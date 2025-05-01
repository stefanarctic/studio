# PhotoText Extractor

This is a Next.js application built within Firebase Studio that allows users to extract text from images using AI.

## Features

- **Image Upload:** Users can upload image files (PNG, JPG, GIF, WebP) via drag-and-drop or file selection.
- **AI-Powered Text Extraction:** Utilizes Google's Gemini model via Genkit to perform Optical Character Recognition (OCR) on the uploaded image.
- **Text Display & Copy:** Displays the extracted text in a text area and provides a button to copy the text to the clipboard.
- **User Feedback:** Provides loading states, error messages, and success/no-text-found notifications using toasts.
- **Responsive Design:** Built with ShadCN UI components and Tailwind CSS for a clean and responsive user interface.

## Getting Started

To run this project locally:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add your Google Generative AI API key:
    ```env
    GOOGLE_GENAI_API_KEY=YOUR_API_KEY
    ```
3.  **Run Genkit Dev Server (Optional but recommended for flow monitoring):**
    In a separate terminal:
    ```bash
    npm run genkit:dev
    ```
4.  **Run Next.js Development Server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) (or your specified port) in your browser to see the application.
