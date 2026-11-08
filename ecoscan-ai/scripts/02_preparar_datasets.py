
from pathlib import Path
import random
import shutil

# --------------------------------------------------
# CONFIGURACIÓN
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

SOURCE_DIR = BASE_DIR / "datasets" / "realwaste"

OUTPUT_DIR = BASE_DIR / "datasets" / "realwaste_split"

CATEGORIES = [
    "carton-papel",
    "cristal",
    "organico",
    "plastico",
    "restos"
]

TRAIN_RATIO = 0.70
VALIDATION_RATIO = 0.15
TEST_RATIO = 0.15

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}

SEED = 42


# --------------------------------------------------
# PREPARACIÓN
# --------------------------------------------------

def main():

    random.seed(SEED)

    if not SOURCE_DIR.exists():
        raise FileNotFoundError(
            f"No existe el dataset: {SOURCE_DIR}"
        )

    if OUTPUT_DIR.exists() and any(OUTPUT_DIR.iterdir()):
        raise FileExistsError(
            "La carpeta de destino ya contiene datos. "
            "No se sobrescribirá automáticamente."
        )

    splits = ["train", "validation", "test"]

    total_images = 0

    for category in CATEGORIES:

        category_dir = SOURCE_DIR / category

        if not category_dir.exists():
            raise FileNotFoundError(
                f"No existe la categoría: {category}"
            )

        images = [
            file for file in category_dir.iterdir()
            if file.is_file()
            and file.suffix.lower() in IMAGE_EXTENSIONS
        ]

        # Mezclamos las imágenes aleatoriamente.
        random.shuffle(images)

        total = len(images)

        # Calculamos las cantidades.
        train_count = int(total * TRAIN_RATIO)
        validation_count = int(total * VALIDATION_RATIO)

        # El resto se asigna a test.
        train_images = images[:train_count]

        validation_images = images[
            train_count:train_count + validation_count
        ]

        test_images = images[
            train_count + validation_count:
        ]

        split_images = {
            "train": train_images,
            "validation": validation_images,
            "test": test_images
        }

        # Creamos las carpetas y copiamos las imágenes.
        for split, selected_images in split_images.items():

            destination = OUTPUT_DIR / split / category

            destination.mkdir(
                parents=True,
                exist_ok=True
            )

            for image in selected_images:
                shutil.copy2(
                    image,
                    destination / image.name
                )

        total_images += total

        print(f"\nCategoría: {category}")
        print(f"  Entrenamiento: {len(train_images)}")
        print(f"  Validación:    {len(validation_images)}")
        print(f"  Test:          {len(test_images)}")

    print("\n" + "=" * 40)
    print(f"TOTAL PROCESADO: {total_images}")
    print("Dataset preparado correctamente.")


if __name__ == "__main__":
    main()
