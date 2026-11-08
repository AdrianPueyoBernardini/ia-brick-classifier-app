from pathlib import Path
import numpy as np
import tensorflow as tf

# ==================================================
# CONFIGURACIÓN (igual que en 04_entrenar_modelo_v2.py)
# ==================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_DIR = BASE_DIR / "datasets" / "realwaste_split"
MODEL_PATH = BASE_DIR / "models" / "ecoscan_mobilenetv2_v2.keras"

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
SEED = 42

CLASS_NAMES = [
    "carton-papel",
    "cristal",
    "organico",
    "plastico",
    "restos"
]


# ==================================================
# 1. CARGAR DATOS Y MODELO
# ==================================================

def load_test_dataset():
    return tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR / "test",
        class_names=CLASS_NAMES,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="int",
        shuffle=False,   # importante: mismo orden en todas las pasadas
        seed=SEED
    )


# ==================================================
# 2. PREDICCIÓN CON TTA
# ==================================================
# El modelo ya lleva el preprocesado dentro, así que se le pasan
# las imágenes en bruto (0-255) con distintas transformaciones y
# se promedian las probabilidades.

def predict_tta(model, dataset):

    views = [
        lambda x: x,                                        # original
        lambda x: tf.image.flip_left_right(x),              # espejo horizontal
        lambda x: tf.image.flip_up_down(x),                 # espejo vertical
        lambda x: tf.image.flip_up_down(
            tf.image.flip_left_right(x)),                   # giro de 180º
    ]

    total = None

    for view in views:
        ds = dataset.map(lambda x, y, v=view: (v(x), y))
        probs = model.predict(ds, verbose=0)
        total = probs if total is None else total + probs

    return total / len(views)


# ==================================================
# 3. EVALUACIÓN
# ==================================================

def main():

    print("\nEVALUACIÓN CON TTA")
    print("=" * 50)

    test_dataset = load_test_dataset()
    model = tf.keras.models.load_model(MODEL_PATH)

    y_true = np.concatenate([y.numpy() for _, y in test_dataset])

    # Sin TTA (para comparar)
    probs_normal = model.predict(test_dataset, verbose=0)
    acc_normal = np.mean(np.argmax(probs_normal, axis=1) == y_true)

    # Con TTA
    probs_tta = predict_tta(model, test_dataset)
    y_pred = np.argmax(probs_tta, axis=1)
    acc_tta = np.mean(y_pred == y_true)

    print(f"\nAccuracy sin TTA: {acc_normal * 100:.2f}%")
    print(f"Accuracy con TTA: {acc_tta * 100:.2f}%")

    matrix = tf.math.confusion_matrix(
        y_true, y_pred, num_classes=len(CLASS_NAMES)
    ).numpy()

    print("\nMATRIZ DE CONFUSIÓN CON TTA (filas = real, columnas = predicho)")
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


if __name__ == "__main__":
    main()