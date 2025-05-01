/**
 * Represents the result of an OCR operation, containing the extracted text.
 */
export interface OCRResult {
  /**
   * The extracted text from the image.
   */
  text: string;
}

/**
 * Asynchronously extracts text from an image using a simulated OCR service.
 * Introduces a slight delay to mimic network latency.
 *
 * @param imageBase64 The base64 encoded image data (not actually used in this mock).
 * @returns A promise that resolves to an OCRResult object containing the extracted text.
 */
export async function extractTextFromImage(imageBase64: string): Promise<OCRResult> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate potential outcomes - sometimes text is found, sometimes not.
  // This mock doesn't actually analyze the imageBase64.
  // A real implementation would call an external OCR API here.
  const shouldFindText = Math.random() > 0.1; // 90% chance of finding text

  if (shouldFindText) {
    return {
        // Example extracted text - replace with actual OCR result in a real app
      text: `This is sample text extracted from the image.\nIt can contain multiple lines.\nAnd various characters like 123!@#.`,
    };
  } else {
     return {
        text: 'No text found in the image.',
    };
  }
}
