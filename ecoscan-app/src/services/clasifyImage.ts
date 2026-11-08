
import { loadTensorflowModel } from "react-native-fast-tflite";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import jpeg from "jpeg-js";
import { toByteArray } from "base64-js";

// Modelo entrenado
const MODEL = require("../../assets/models/ecoscan_mobilenetv2_v2.tflite");

const IMAGE_SIZE = 224;
const CHANNELS = 3;

// Orden exacto de las categorías del entrenamiento
const CLASSES = [
  {
    category: "carton-papel",
    container: "Azul",
  },
  {
    category: "cristal",
    container: "Verde",
  },
  {
    category: "organico",
    container: "Marrón",
  },
  {
    category: "plastico",
    container: "Amarillo",
  },
  {
    category: "restos",
    container: "Gris oscuro",
  },
] as const;

export type ClassificationResult = {
  category: string;
  container: string;
  confidence: number;
};

// Cargamos el modelo una sola vez
let modelPromise: ReturnType<typeof loadTensorflowModel> | null = null;

async function getModel() {
  if (!modelPromise) {
    // Segundo argumento obligatorio en react-native-fast-tflite 3.x
    modelPromise = loadTensorflowModel(MODEL, []);
  }

  return modelPromise;
}

// Convierte una fotografía en un tensor RGB Float32
async function imageToTensor(uri: string): Promise<Float32Array> {
  const resizedImage = await manipulateAsync(
    uri,
    [
      {
        resize: {
          width: IMAGE_SIZE,
          height: IMAGE_SIZE,
        },
      },
    ],
    {
      compress: 1,
      format: SaveFormat.JPEG,
      base64: true,
    }
  );

  if (!resizedImage.base64) {
    throw new Error("No se pudo procesar la fotografía.");
  }

  const imageBytes = toByteArray(resizedImage.base64);

  const decodedImage = jpeg.decode(imageBytes, {
    useTArray: true,
    formatAsRGBA: true,
  });

  const pixels = decodedImage.data;

  const tensor = new Float32Array(
    IMAGE_SIZE * IMAGE_SIZE * CHANNELS
  );

  for (let pixel = 0; pixel < IMAGE_SIZE * IMAGE_SIZE; pixel++) {
    const sourceIndex = pixel * 4;
    const targetIndex = pixel * 3;

    tensor[targetIndex] = pixels[sourceIndex];
    tensor[targetIndex + 1] = pixels[sourceIndex + 1];
    tensor[targetIndex + 2] = pixels[sourceIndex + 2];
  }

  return tensor;
}

// Ejecuta la clasificación
export async function classifyImage(
  imageUri: string
): Promise<ClassificationResult> {
  try {
    const model = await getModel();

    const tensor = await imageToTensor(imageUri);

    // Convertimos Float32Array en ArrayBuffer,
    // que es el formato exigido por model.run().
    const outputs = await model.run([
      tensor.buffer as ArrayBuffer,
    ]);

    const probabilities = new Float32Array(outputs[0]);

    if (probabilities.length !== CLASSES.length) {
      throw new Error("La salida del modelo no tiene 5 categorías.");
    }

    let bestIndex = 0;

    for (let i = 1; i < probabilities.length; i++) {
      if (probabilities[i] > probabilities[bestIndex]) {
        bestIndex = i;
      }
    }

    const prediction = CLASSES[bestIndex];

    return {
      category: prediction.category,
      container: prediction.container,
      confidence: probabilities[bestIndex],
    };
  } catch (error) {
    console.error("Error clasificando imagen:", error);

    throw new Error(
      "No se ha podido clasificar la fotografía."
    );
  }
}
