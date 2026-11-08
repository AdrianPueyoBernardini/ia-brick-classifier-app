
from pathlib import Path
from collections import Counter

DATASET_DIR = (
    Path(__file__).resolve().parent.parent
    / "datasets"
    / "realwaste"
)

IMAGE_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".bmp", ".webp"
}


def main():
    print("\nDIAGNÓSTICO DEL DATASET")
    print("=" * 55)

    if not DATASET_DIR.exists():
        print(f"No existe la ruta: {DATASET_DIR}")
        return

    total = 0

    # Buscamos todas las imágenes, también en subcarpetas.
    for folder in sorted(DATASET_DIR.iterdir()):

        if not folder.is_dir():
            continue

        images = [
            file for file in folder.rglob("*")
            if file.is_file()
            and file.suffix.lower() in IMAGE_EXTENSIONS
        ]

        extensions = Counter(
            file.suffix.lower() for file in images
        )

        total += len(images)

        print(f"\nCarpeta: {folder.name}")
        print(f"Imágenes: {len(images)}")
        print(f"Extensiones: {dict(extensions)}")

        # Mostramos las subcarpetas que existan.
        subfolders = [
            item.name for item in folder.iterdir()
            if item.is_dir()
        ]

        if subfolders:
            print(f"Subcarpetas: {subfolders}")

    print("\n" + "=" * 55)
    print(f"TOTAL DE IMÁGENES: {total}")


if __name__ == "__main__":
    main()
