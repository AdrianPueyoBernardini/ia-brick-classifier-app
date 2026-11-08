
from pathlib import Path
import tensorflow as tf
import numpy as np

# ==================================================
# CONFIGURACIÓN
# ==================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "ecoscan_mobilenetv2_v2.keras"
TFLITE_PATH = BASE_DIR / "models" / "ecoscan_mobilenetv2_v2.tflite"

IMAGE_SIZE = (224, 224)


# ==================================================
# CONVERSIÓN
# ==================================================

def main():

    print("\nCONVERSIÓN DE ECOSCAN A TFLITE")
    print("=" * 50)

    print("\nCargando modelo Keras...")

    model = tf.keras.models.load_model(MODEL_PATH)

    print("Modelo cargado.")

    print("\nPreparando conversor...")

    converter = tf.lite.TFLiteConverter.from_keras_model(model)

    # De momento mantenemos precisión completa.
    # No aplicamos cuantización todavía.

    print("\nConvirtiendo modelo...")

    tflite_model = converter.convert()

    print("\nGuardando modelo...")

    TFLITE_PATH.write_bytes(tflite_model)

    print(f"Modelo guardado en: {TFLITE_PATH}")

    # ==================================================
    # COMPROBACIÓN DEL MODELO CONVERTIDO
    # ==================================================

    print("\nCOMPROBANDO MODELO TFLITE")
    print("=" * 50)

    interpreter = tf.lite.Interpreter(model_path=str(TFLITE_PATH))
    interpreter.allocate_tensors()

    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    print("\nENTRADA:")
    print("Forma:", input_details[0]["shape"])
    print("Tipo:", input_details[0]["dtype"])

    print("\nSALIDA:")
    print("Forma:", output_details[0]["shape"])
    print("Tipo:", output_details[0]["dtype"])

    # Imagen ficticia para comprobar que el modelo ejecuta
    dummy_image = np.zeros(
        (1, IMAGE_SIZE[0], IMAGE_SIZE[1], 3),
        dtype=np.float32
    )

    interpreter.set_tensor(
        input_details[0]["index"],
        dummy_image
    )

    interpreter.invoke()

    prediction = interpreter.get_tensor(
        output_details[0]["index"]
    )

    print("\nPREDICCIÓN DE PRUEBA:")
    print(prediction)

    print("\nSuma de probabilidades:", prediction.sum())

    print("\nTamaño del archivo:")
    print(f"{TFLITE_PATH.stat().st_size / (1024 * 1024):.2f} MB")

    print("\nConversión y comprobación finalizadas.")


if __name__ == "__main__":
    main()
