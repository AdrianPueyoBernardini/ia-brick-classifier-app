from pathlib import Path
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
EPOCHS = 15
SEED = 42

CLASS_NAMES = [
    "carton-papel",
    "cristal",
    "organico",
    "plastico",
    "restos"
]

MODEL_PATH = MODEL_DIR / "ecoscan_mobilenetv2.keras"


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


# ==================================================
# 2. PREPROCESAMIENTO
# ==================================================

def preprocess_data(images, labels):

    images = tf.keras.applications.mobilenet_v2.preprocess_input(images)

    return images, labels


# ==================================================
# 3. CONSTRUIR EL MODELO
# ==================================================

def build_model():

    # Cargar MobileNetV2 preentrenada
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights="imagenet"
    )

    # Congelar las capas originales
    base_model.trainable = False

    # Crear nuestra propia arquitectura
    inputs = tf.keras.Input(shape=(224, 224, 3))

    x = base_model(inputs, training=False)

    x = tf.keras.layers.GlobalAveragePooling2D()(x)

    x = tf.keras.layers.Dropout(0.2)(x)

    outputs = tf.keras.layers.Dense(
        len(CLASS_NAMES),
        activation="softmax"
    )(x)

    model = tf.keras.Model(inputs, outputs)

    # Configurar el entrenamiento
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    return model


# ==================================================
# 4. ENTRENAMIENTO
# ==================================================

def main():

    print("\nENTRENAMIENTO DE ECOSCAN")
    print("=" * 50)

    print("\nCargando imágenes...")

    train_dataset = load_dataset("train", shuffle=True)
    validation_dataset = load_dataset("validation", shuffle=False)
    test_dataset = load_dataset("test", shuffle=False)

    # Aplicar preprocesamiento específico de MobileNetV2
    train_dataset = train_dataset.map(preprocess_data)
    validation_dataset = validation_dataset.map(preprocess_data)
    test_dataset = test_dataset.map(preprocess_data)

    # Preparar la carga de datos
    train_dataset = train_dataset.prefetch(tf.data.AUTOTUNE)
    validation_dataset = validation_dataset.prefetch(tf.data.AUTOTUNE)
    test_dataset = test_dataset.prefetch(tf.data.AUTOTUNE)

    print("\nConstruyendo modelo...")

    model = build_model()

    model.summary()

    # Guardar automáticamente el mejor modelo
    callbacks = [

        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=4,
            restore_best_weights=True
        ),

        tf.keras.callbacks.ModelCheckpoint(
            filepath=MODEL_PATH,
            monitor="val_loss",
            save_best_only=True
        )

    ]

    print("\nComenzando entrenamiento...")

    history = model.fit(
        train_dataset,
        validation_data=validation_dataset,
        epochs=EPOCHS,
        callbacks=callbacks
    )

    # Evaluación final con imágenes que no ha utilizado
    # durante el entrenamiento ni la validación
    print("\nEVALUACIÓN FINAL")
    print("=" * 50)

    test_loss, test_accuracy = model.evaluate(test_dataset)

    print(f"\nTest Loss: {test_loss:.4f}")
    print(f"Test Accuracy: {test_accuracy * 100:.2f}%")

    print("\nModelo guardado en:")
    print(MODEL_PATH)

    print("\nEntrenamiento finalizado.")


if __name__ == "__main__":
    main()