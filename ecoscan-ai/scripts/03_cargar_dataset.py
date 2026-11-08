
from pathlib import Path
import tensorflow as tf
import matplotlib.pyplot as plt

# --------------------------------------------------
# CONFIGURACIÓN
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_DIR = BASE_DIR / "datasets" / "realwaste_split"

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


# --------------------------------------------------
# CARGAR DATASETS
# --------------------------------------------------

def load_dataset(folder, shuffle):

    dataset = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR / folder,
        class_names=CLASS_NAMES,
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="int",
        shuffle=shuffle,
        seed=SEED
    )

    return dataset


# --------------------------------------------------
# VISUALIZAR IMÁGENES
# --------------------------------------------------

def show_images(dataset):

    images, labels = next(iter(dataset))

    plt.figure(figsize=(12, 8))

    for i in range(min(9, len(images))):

        plt.subplot(3, 3, i + 1)

        # Mostramos la fotografía.
        plt.imshow(images[i].numpy().astype("uint8"))

        # Convertimos el número de etiqueta en su categoría.
        class_name = CLASS_NAMES[labels[i].numpy()]

        plt.title(class_name)
        plt.axis("off")

    plt.tight_layout()
    plt.show()


# --------------------------------------------------
# PROGRAMA PRINCIPAL
# --------------------------------------------------

def main():

    print("\nCARGANDO DATASETS DE ECOSCAN")
    print("=" * 45)

    train_dataset = load_dataset("train", shuffle=True)

    validation_dataset = load_dataset(
        "validation",
        shuffle=False
    )

    test_dataset = load_dataset("test", shuffle=False)

    print("\nCLASES DETECTADAS:")
    print(train_dataset.class_names)

    print("\nFORMATO DE LOS DATOS:")

    images, labels = next(iter(train_dataset))

    print("Forma de las imágenes:", images.shape)
    print("Forma de las etiquetas:", labels.shape)
    print("Tipo de las imágenes:", images.dtype)
    print("Tipo de las etiquetas:", labels.dtype)

    print("\nPRIMERAS ETIQUETAS DEL LOTE:")
    print(labels[:10].numpy())

    print("\nVISUALIZANDO FOTOGRAFÍAS...")

    show_images(train_dataset)

    print("\nDataset cargado correctamente.")


if __name__ == "__main__":
    main()
