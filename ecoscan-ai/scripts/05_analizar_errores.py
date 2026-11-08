
from pathlib import Path

import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt

# CONFIGURACIÓN

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_DIR = BASE_DIR / "datasets" / "realwaste_split"
MODEL_PATH = BASE_DIR / "models" / "ecoscan_mobilenetv2_v2.keras"

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32

CLASS_NAMES = [
    "carton-papel",
    "cristal",
    "organico",
    "plastico",
    "restos"
]


def main():

    print("\nANÁLISIS DE ERRORES DE ECOSCAN")
    print("=" * 50)

    # Cargar modelo
    model = tf.keras.models.load_model(MODEL_PATH)

    # Cargar test SIN preprocesar:
    # el modelo ya incorpora el preprocesamiento.
    dataset = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR / "test",
        class_names=CLASS_NAMES,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="int",
        shuffle=False
    )

    # Obtener imágenes y etiquetas
    all_images = []
    all_labels = []

    for images, labels in dataset:
        all_images.append(images.numpy())
        all_labels.append(labels.numpy())

    images = np.concatenate(all_images)
    y_true = np.concatenate(all_labels)

    # Obtener predicciones
    probabilities = model.predict(images, verbose=1)

    y_pred = np.argmax(probabilities, axis=1)
    confidence = np.max(probabilities, axis=1)

    # Localizar errores
    error_indices = np.where(y_true != y_pred)[0]

    print(f"\nTotal de imágenes: {len(y_true)}")
    print(f"Predicciones incorrectas: {len(error_indices)}")

    if len(error_indices) == 0:
        print("No se han encontrado errores.")
        return

    # Mostrar primero los errores con mayor confianza.
    error_indices = sorted(
        error_indices,
        key=lambda i: confidence[i],
        reverse=True
    )

    selected = error_indices[:25]

    columns = 5
    rows = int(np.ceil(len(selected) / columns))

    plt.figure(figsize=(16, rows * 3.5))

    for position, index in enumerate(selected):

        plt.subplot(rows, columns, position + 1)

        plt.imshow(images[index].astype("uint8"))

        real = CLASS_NAMES[y_true[index]]
        predicted = CLASS_NAMES[y_pred[index]]
        conf = confidence[index] * 100

        plt.title(
            f"Real: {real}\n"
            f"Predicción: {predicted}\n"
            f"Confianza: {conf:.1f}%",
            fontsize=9
        )

        plt.axis("off")

    plt.suptitle(
        "EcoScan - Errores de clasificación",
        fontsize=15
    )

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    main()
