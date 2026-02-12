type DecodedImage = CanvasImageSource & { close?: () => void };

export type PerceptualHashes = {
  pHash: string;
  dHash: string;
};

const PHASH_SIZE = 32;
const PHASH_LOW_FREQUENCY_SIZE = 8;
const DHASH_WIDTH = 9;
const DHASH_HEIGHT = 8;

const DCT_COSINE_TABLE = buildDctCosineTable(PHASH_SIZE);
const DCT_SCALE = Array.from({ length: PHASH_SIZE }, (_, frequency) =>
  frequency === 0 ? Math.sqrt(1 / PHASH_SIZE) : Math.sqrt(2 / PHASH_SIZE)
);

function buildDctCosineTable(size: number): Float64Array {
  const table = new Float64Array(size * size);
  for (let frequency = 0; frequency < size; frequency += 1) {
    for (let index = 0; index < size; index += 1) {
      table[(frequency * size) + index] = Math.cos(((2 * index + 1) * frequency * Math.PI) / (2 * size));
    }
  }
  return table;
}

function bitsToHex(bits: ArrayLike<number>): string {
  let value = 0n;
  for (let bitIndex = 0; bitIndex < bits.length; bitIndex += 1) {
    value = (value << 1n) | BigInt(bits[bitIndex] ? 1 : 0);
  }
  return value.toString(16).padStart(16, "0");
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sortedValues = [...values].sort((left, right) => left - right);
  const midpoint = Math.floor(sortedValues.length / 2);
  if (sortedValues.length % 2 === 0) {
    return (sortedValues[midpoint - 1] + sortedValues[midpoint]) / 2;
  }
  return sortedValues[midpoint];
}

function dct1d(values: Float64Array): Float64Array {
  const transformedValues = new Float64Array(PHASH_SIZE);
  for (let frequency = 0; frequency < PHASH_SIZE; frequency += 1) {
    let sum = 0;
    const tableOffset = frequency * PHASH_SIZE;
    for (let index = 0; index < PHASH_SIZE; index += 1) {
      sum += values[index] * DCT_COSINE_TABLE[tableOffset + index];
    }
    transformedValues[frequency] = DCT_SCALE[frequency] * sum;
  }
  return transformedValues;
}

function dct2d(values: Float64Array): Float64Array {
  const rowTransformed = new Float64Array(PHASH_SIZE * PHASH_SIZE);
  for (let row = 0; row < PHASH_SIZE; row += 1) {
    const rowStart = row * PHASH_SIZE;
    const transformedRow = dct1d(values.subarray(rowStart, rowStart + PHASH_SIZE));
    rowTransformed.set(transformedRow, rowStart);
  }

  const fullyTransformed = new Float64Array(PHASH_SIZE * PHASH_SIZE);
  for (let column = 0; column < PHASH_SIZE; column += 1) {
    const columnValues = new Float64Array(PHASH_SIZE);
    for (let row = 0; row < PHASH_SIZE; row += 1) {
      columnValues[row] = rowTransformed[(row * PHASH_SIZE) + column];
    }

    const transformedColumn = dct1d(columnValues);
    for (let row = 0; row < PHASH_SIZE; row += 1) {
      fullyTransformed[(row * PHASH_SIZE) + column] = transformedColumn[row];
    }
  }

  return fullyTransformed;
}

function readGrayscalePixels(image: CanvasImageSource, width: number, height: number): Float64Array {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context is not available");
  }

  context.drawImage(image, 0, 0, width, height);
  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const grayscalePixels = new Float64Array(width * height);

  for (let sourceIndex = 0, destinationIndex = 0; sourceIndex < pixels.length; sourceIndex += 4, destinationIndex += 1) {
    const red = pixels[sourceIndex];
    const green = pixels[sourceIndex + 1];
    const blue = pixels[sourceIndex + 2];
    grayscalePixels[destinationIndex] = (0.299 * red) + (0.587 * green) + (0.114 * blue);
  }

  return grayscalePixels;
}

function computeDHash(image: CanvasImageSource): string {
  const grayscalePixels = readGrayscalePixels(image, DHASH_WIDTH, DHASH_HEIGHT);
  const bits = new Uint8Array(64);

  let bitIndex = 0;
  for (let row = 0; row < DHASH_HEIGHT; row += 1) {
    for (let column = 0; column < DHASH_WIDTH - 1; column += 1) {
      const leftPixel = grayscalePixels[(row * DHASH_WIDTH) + column];
      const rightPixel = grayscalePixels[(row * DHASH_WIDTH) + column + 1];
      bits[bitIndex] = leftPixel > rightPixel ? 1 : 0;
      bitIndex += 1;
    }
  }

  return bitsToHex(bits);
}

function computePHash(image: CanvasImageSource): string {
  const grayscalePixels = readGrayscalePixels(image, PHASH_SIZE, PHASH_SIZE);
  const frequencyMap = dct2d(grayscalePixels);
  const lowFrequencyValues = new Float64Array(PHASH_LOW_FREQUENCY_SIZE * PHASH_LOW_FREQUENCY_SIZE);

  let lowFrequencyIndex = 0;
  for (let row = 0; row < PHASH_LOW_FREQUENCY_SIZE; row += 1) {
    for (let column = 0; column < PHASH_LOW_FREQUENCY_SIZE; column += 1) {
      lowFrequencyValues[lowFrequencyIndex] = frequencyMap[(row * PHASH_SIZE) + column];
      lowFrequencyIndex += 1;
    }
  }

  const threshold = median(Array.from(lowFrequencyValues.slice(1)));
  const bits = new Uint8Array(lowFrequencyValues.length);
  for (let bitIndex = 0; bitIndex < lowFrequencyValues.length; bitIndex += 1) {
    bits[bitIndex] = lowFrequencyValues[bitIndex] > threshold ? 1 : 0;
  }

  return bitsToHex(bits);
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to decode image"));
    };

    image.src = objectUrl;
  });
}

async function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file);
  }
  return loadImageElement(file);
}

export async function computePerceptualHashes(file: File): Promise<PerceptualHashes> {
  const image = await decodeImage(file);

  try {
    return {
      pHash: computePHash(image),
      dHash: computeDHash(image),
    };
  } finally {
    image.close?.();
  }
}
