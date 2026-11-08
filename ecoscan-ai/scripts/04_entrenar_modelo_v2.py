from pathlib import Path
import numpy as np
import tensorflow as tf

# ==================================================
# CONFIGURACIÓN
# ==================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_DIR = BASE_DIR / "datasets" / "realwaste_split"
MODEL_DIR = BASE_DIR / "models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
SEED = 42

EPOCHS_HEAD = 10        # Fase 1: solo la cabeza nueva
EPOCHS_FINE = 25        # Fase 2: fine-tuning (EarlyStopping lo cortará antes)
FINE_TUNE_AT = 100      # MobileNetV2 tiene 154 capas: descongelamos desde la 100

CLASS_NAMES = [
    "carton-papel",
    "cristal",
    "organico",
    "plastico",
    "restos"
]

MODEL_PATH = MODEL_DIR / "ecoscan_mobilenetv2_v2.keras"

tf.keras.utils.set_random_seed(SEED)


# ==================================================
# 1. CARGAR LOS DATASETS
# ==================================================

def load_dataset(folder, shuffle):

    return tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR / folder,
        class_names=CLASS_NAMES,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="int",
        shuffle=shuffle,
        seed=SEED
    )


def get_class_weights():
    # Pesos inversamente proporcionales al nº de imágenes de cada clase,
    # para que las clases pequeñas no queden infravaloradas.
    counts = [
        len(list((DATASET_DIR / "train" / name).glob("*")))
        for name in CLASS_NAMES
    ]
    total = sum(counts)

    print("\nImágenes por clase (train):")
    for name, n in zip(CLASS_NAMES, counts):
        print(f"  {name:<14} {n}")

    return {
        i: total / (len(counts) * n)
        for i, n in enumerate(counts)
    }


# ==================================================
# 2. CONSTRUIR EL MODELO
# ==================================================
# El aumento de datos y el preprocesado van DENTRO del modelo:
#  - El aumento solo se activa al entrenar (en validación/test se ignora).
#  - El modelo guardado ya incluye el preprocesado, así que en la app
#    móvil/inferencia le pasas la imagen en bruto (0-255).

def build_model():

    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights="imagenet"
    )
    base_model.trainable = False

    augmentation = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal_and_vertical"),
        tf.keras.layers.RandomRotation(0.15),
        tf.keras.layers.RandomZoom(0.15),
        tf.keras.layers.RandomContrast(0.15),
        tf.keras.layers.RandomBrightness(0.15),
    ], name="augmentation")

    inputs = tf.keras.Input(shape=(224, 224, 3))

    x = augmentation(inputs)

    # Equivale a mobilenet_v2.preprocess_input: [0, 255] -> [-1, 1]
    x = tf.keras.layers.Rescaling(scale=1.0 / 127.5, offset=-1.0)(x)

    x = base_model(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.3)(x)

    outputs = tf.keras.layers.Dense(
        len(CLASS_NAMES),
        activation="softmax"
    )(x)

    model = tf.keras.Model(inputs, outputs)

    return model, base_model


def compile_model(model, learning_rate):
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )


# ==================================================
# 3. EVALUACIÓN DETALLADA
# ==================================================

def detailed_evaluation(model, test_dataset):

    y_true = np.concatenate([y.numpy() for _, y in test_dataset])
    y_pred = np.argmax(model.predict(test_dataset, verbose=0), axis=1)

    matrix = tf.math.confusion_matrix(
        y_true, y_pred, num_classes=len(CLASS_NAMES)
    ).numpy()

    print("\nMATRIZ DE CONFUSIÓN (filas = real, columnas = predicho)")
    print("-" * 50)
    print(" " * 15 + "".join(f"{i:>6}" for i in range(len(CLASS_NAMES))))
    for i, name in enumerate(CLASS_NAMES):
        print(f"{i} {name:<12} " + "".join(f"{v:>6}" for v in matrix[i]))

    print("\nACCURACY POR CLASE (recall)")
    print("-" * 50)
    for i, name in enumerate(CLASS_NAMES):
        total = matrix[i].sum()
        recall = matrix[i, i] / total if total else 0
        print(f"  {name:<14} {recall * 100:6.2f}%  ({matrix[i, i]}/{total})")


# ==================================================
# 4. ENTRENAMIENTO
# ==================================================

def main():

    print("\nENTRENAMIENTO DE ECOSCAN v2")
    print("=" * 50)

    print("\nCargando imágenes...")

    train_dataset = load_dataset("train", shuffle=True)
    validation_dataset = load_dataset("validation", shuffle=False)
    test_dataset = load_dataset("test", shuffle=False)

    # cache(): decodifica los JPG una sola vez (usa ~1.5 GB de RAM).
    # Si vas justo de memoria, quita los .cache()
    train_dataset = train_dataset.cache().prefetch(tf.data.AUTOTUNE)
    validation_dataset = validation_dataset.cache().prefetch(tf.data.AUTOTUNE)
    test_dataset = test_dataset.cache().prefetch(tf.data.AUTOTUNE)

    class_weights = get_class_weights()

    print("\nConstruyendo modelo...")
    model, base_model = build_model()
    model.summary()

    # ---------------------------------------------
    # FASE 1: entrenar solo la cabeza (base congelada)
    # ---------------------------------------------
    print("\nFASE 1: entrenando la cabeza")
    print("=" * 50)

    compile_model(model, learning_rate=1e-3)

    model.fit(
        train_dataset,
        validation_data=validation_dataset,
        epochs=EPOCHS_HEAD,
        class_weight=class_weights,
        callbacks=[
            tf.keras.callbacks.EarlyStopping(
                monitor="val_loss",
                patience=3,
                restore_best_weights=True
            )
        ]
    )

    # ---------------------------------------------
    # FASE 2: fine-tuning de las últimas capas
    # ---------------------------------------------
    print("\nFASE 2: fine-tuning")
    print("=" * 50)

    base_model.trainable = True

    for layer in base_model.layers[:FINE_TUNE_AT]:
        layer.trainable = False

    # Las BatchNorm se quedan congeladas: con pocas imágenes,
    # reajustarlas suele empeorar el modelo.
    for layer in base_model.layers:
        if isinstance(layer, tf.keras.layers.BatchNormalization):
            layer.trainable = False

    # Hay que recompilar tras cambiar trainable. Learning rate MUY bajo.
    compile_model(model, learning_rate=1e-5)

    trainable_params = sum(
        int(np.prod(w.shape)) for w in model.trainable_weights
    )
    print(f"Parámetros entrenables ahora: {trainable_params:,}")

    callbacks = [

        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=5,
            restore_best_weights=True
        ),

        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.3,
            patience=2,
            min_lr=1e-7,
            verbose=1
        ),

        tf.keras.callbacks.ModelCheckpoint(
            filepath=MODEL_PATH,
            monitor="val_loss",
            save_best_only=True
        )
    ]

    model.fit(
        train_dataset,
        validation_data=validation_dataset,
        epochs=EPOCHS_FINE,
        class_weight=class_weights,
        callbacks=callbacks
    )

    # ---------------------------------------------
    # EVALUACIÓN FINAL (el test solo se toca aquí)
    # ---------------------------------------------
    print("\nEVALUACIÓN FINAL")
    print("=" * 50)

    test_loss, test_accuracy = model.evaluate(test_dataset)

    print(f"\nTest Loss: {test_loss:.4f}")
    print(f"Test Accuracy: {test_accuracy * 100:.2f}%")

    detailed_evaluation(model, test_dataset)

    print("\nModelo guardado en:")
    print(MODEL_PATH)

    print("\nEntrenamiento finalizado.")


if __name__ == "__main__":
    main()