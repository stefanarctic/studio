'use server';

/**
 * @fileOverview Extracts text from an image using OCR via an AI model.
 *
 * - extractText - A function that handles the text extraction process by invoking the AI flow.
 * - ExtractTextFromImageInput - The input type for the extractText function.
 * - ExtractTextFromImageOutput - The return type for the extractText function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
// Removed import of mock service: import {extractTextFromImage} from '@/services/ocr';

const ExtractTextFromImageInputSchema = z.object({
  imageBase64: z
    .string()
    .describe(
      'The image to extract text from, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' /* data uri */
    ),
});
export type ExtractTextFromImageInput = z.infer<typeof ExtractTextFromImageInputSchema>;

const ExtractTextFromImageOutputSchema = z.object({
  extractedText: z
    .string()
    .describe('The extracted text from the image. Returns an empty string if no text is found.'),
});
export type ExtractTextFromImageOutput = z.infer<typeof ExtractTextFromImageOutputSchema>;

/**
 * Public function to call the text extraction flow.
 * @param input The input containing the image data URI.
 * @returns A promise resolving to the extracted text.
 */
export async function extractText(input: ExtractTextFromImageInput): Promise<ExtractTextFromImageOutput> {
  return extractTextFromImageFlow(input);
}

const extractTextFromImagePrompt = ai.definePrompt({
  name: 'extractTextFromImagePrompt',
  input: {
    schema: ExtractTextFromImageInputSchema,
  },
  output: {
    schema: ExtractTextFromImageOutputSchema,
  },
  prompt: `Extract the text content accurately from the following image. If no text is present, return an empty string for the extractedText field.
Image: {{media url=imageBase64}}`,
});

const extractTextFromImageFlow = ai.defineFlow<
  typeof ExtractTextFromImageInputSchema,
  typeof ExtractTextFromImageOutputSchema
>(
  {
    name: 'extractTextFromImageFlow',
    inputSchema: ExtractTextFromImageInputSchema,
    outputSchema: ExtractTextFromImageOutputSchema,
  },
  async input => {
    // Call the AI prompt directly instead of the mock service
    const {output} = await extractTextFromImagePrompt(input);

    // Ensure output is not null or undefined before returning
    // If the model somehow returns null/undefined, default to an empty string
    return {extractedText: output?.extractedText ?? ''};
  }
);
