'use server';

/**
 * @fileOverview Extracts text from an image using OCR.
 *
 * - extractTextFromImageFlow - A function that handles the text extraction process.
 * - ExtractTextFromImageInput - The input type for the extractTextFromImageFlow function.
 * - ExtractTextFromImageOutput - The return type for the extractTextFromImageFlow function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {extractTextFromImage} from '@/services/ocr';

const ExtractTextFromImageInputSchema = z.object({
  imageBase64: z
    .string()
    .describe(
      'The image to extract text from, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' /* data uri */
    ),
});
export type ExtractTextFromImageInput = z.infer<typeof ExtractTextFromImageInputSchema>;

const ExtractTextFromImageOutputSchema = z.object({
  extractedText: z.string().describe('The extracted text from the image.'),
});
export type ExtractTextFromImageOutput = z.infer<typeof ExtractTextFromImageOutputSchema>;

export async function extractText(input: ExtractTextFromImageInput): Promise<ExtractTextFromImageOutput> {
  return extractTextFromImageFlow(input);
}

const extractTextFromImagePrompt = ai.definePrompt({
  name: 'extractTextFromImagePrompt',
  input: {
    schema: z.object({
      imageBase64: z
        .string()
        .describe(
          'The image to extract text from, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
        ),
    }),
  },
  output: {
    schema: z.object({
      extractedText: z.string().describe('The extracted text from the image.'),
    }),
  },
  prompt: `Extract the text from the following image: {{media url=imageBase64}}`,
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
    const ocrResult = await extractTextFromImage(input.imageBase64);
    return {extractedText: ocrResult.text};
  }
);
