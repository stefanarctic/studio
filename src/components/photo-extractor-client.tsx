"use client";

import { useState, ChangeEvent, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, Copy, Loader2, XCircle, AlertCircle, FileText } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { extractText } from '@/ai/flows/extract-text-from-image';

export default function PhotoExtractorClient() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearState = () => {
    setImageBase64(null);
    setExtractedText('');
    setError(null);
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Clear previous state immediately on new file selection
      clearState();
      const reader = new FileReader();
      reader.onloadstart = () => setIsLoading(true); // Indicate loading while reading file
      reader.onloadend = () => {
        const result = reader.result as string;
        setIsLoading(false); // Finished reading
        // Basic validation for image data URI
        if (result && result.startsWith('data:image/')) {
           if (file.size > 10 * 1024 * 1024) { // Check file size (e.g., 10MB)
             setError('File size exceeds 10MB limit.');
             clearState(); // Clear state on error
          } else {
            setImageBase64(result);
          }
        } else {
          setError('Invalid file type. Please upload an image (PNG, JPG, GIF).');
          clearState(); // Clear state on error
        }
      };
      reader.onerror = () => {
        setIsLoading(false); // Finished reading (with error)
        setError('Failed to read the file.');
        clearState(); // Clear state on error
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtractText = useCallback(async () => {
    if (!imageBase64) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setExtractedText('');

    try {
      const result = await extractText({ imageBase64 });
      setExtractedText(result.extractedText);
      if (result.extractedText === 'No text found in the image.') {
         toast({
          title: "Extraction Complete",
          description: "No text was detected in the provided image.",
        });
      } else {
         toast({
          title: "Extraction Successful",
          description: "Text extracted from the image.",
        });
      }
    } catch (err) {
      console.error('Extraction failed:', err);
      setError('Failed to extract text. The service might be unavailable or the image could not be processed. Please try again.');
      setExtractedText(''); // Clear text on error
       toast({
          variant: "destructive",
          title: "Extraction Failed",
          description: "Could not extract text from the image.",
        });
    } finally {
      setIsLoading(false);
    }
  }, [imageBase64, toast]);

  const handleCopyText = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText)
      .then(() => {
        toast({
          title: "Copied!",
          description: "Extracted text copied to clipboard.",
        });
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast({
          variant: "destructive",
          title: "Copy Failed",
          description: "Could not copy text to clipboard.",
        });
      });
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    // Optional: Add visual feedback on drag over
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
       // Simulate file change event for consistency
       const dt = new DataTransfer();
       dt.items.add(file);
       if (fileInputRef.current) {
           fileInputRef.current.files = dt.files;
           // Trigger the change event handler
           const changeEvent = new Event('change', { bubbles: true });
           fileInputRef.current.dispatchEvent(changeEvent);
       }
    }
  };

   const triggerFileInput = () => {
    fileInputRef.current?.click();
  };


  return (
    <div className="w-full max-w-2xl">
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="text-center bg-muted/30 border-b">
          <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">PhotoText Extractor</CardTitle>
          <CardDescription>Upload an image to extract text using AI</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
             <Label
              htmlFor="image-upload"
              className={`flex flex-col items-center justify-center w-full min-h-[12rem] border-2 border-dashed rounded-lg cursor-pointer border-border hover:border-primary/50 hover:bg-muted/30 transition-colors relative ${isLoading && !imageBase64 ? 'animate-pulse' : ''}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              aria-busy={isLoading && !imageBase64}
              aria-label="Image upload area: Click or drag and drop an image file here"
            >
               {imageBase64 ? (
                 <div className="relative w-full h-48 flex items-center justify-center p-2">
                   <Image
                    src={imageBase64}
                    alt="Uploaded preview"
                    fill
                    style={{ objectFit: 'contain' }}
                    className="rounded-md"
                    data-ai-hint="uploaded image preview"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Example sizes
                  />
                 </div>
               ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                    <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold text-primary">Click to upload</span> or drag & drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF (Max 10MB)</p>
                </div>
               )}
              <Input
                id="image-upload"
                type="file"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
                disabled={isLoading}
                aria-describedby={error ? "error-alert" : undefined}
              />
               {isLoading && !imageBase64 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70 rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                   <span className="sr-only">Loading image...</span>
                </div>
              )}
            </Label>

            {error && (
             <Alert variant="destructive" id="error-alert" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
             </Alert>
            )}

             {(imageBase64 || error) && (
              <div className="flex justify-between items-center mt-2">
                {imageBase64 && (
                  <Button variant="outline" size="sm" onClick={triggerFileInput} disabled={isLoading} className="text-xs">
                    Change Image
                  </Button>
                 )}
                 <Button variant="ghost" size="sm" onClick={clearState} disabled={isLoading} className="text-destructive hover:text-destructive text-xs">
                    <XCircle className="mr-1 h-4 w-4" />
                    Clear
                 </Button>
              </div>
            )}

          </div>

          <Button
            onClick={handleExtractText}
            disabled={!imageBase64 || isLoading}
            className="w-full"
            aria-label="Extract Text from Uploaded Image"
            aria-live="polite"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
               <FileText className="mr-2 h-4 w-4"/>
            )}
            {isLoading ? 'Extracting Text...' : 'Extract Text'}
          </Button>

          {(extractedText || (isLoading && imageBase64)) && (
            <div className="space-y-2">
              <Label htmlFor="extracted-text" className="font-semibold">Extracted Text:</Label>
              <div className="relative" role="region" aria-live="polite">
                 {isLoading && imageBase64 && (
                     <div className="flex items-center justify-center p-4 border rounded-md min-h-[150px] bg-muted/30">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Processing image...</span>
                     </div>
                 )}
                 {extractedText && !isLoading && (
                    <>
                        <Textarea
                          id="extracted-text"
                          value={extractedText}
                          readOnly
                          className="pr-10 min-h-[150px] bg-muted/20 border rounded-md shadow-inner text-sm"
                          aria-label="Extracted text display area"
                          rows={6}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCopyText}
                          className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Copy extracted text to clipboard"
                          title="Copy text"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                    </>
                 )}
              </div>
            </div>
          )}

        </CardContent>
         <CardFooter className="bg-muted/30 border-t p-4 text-center text-xs text-muted-foreground">
              Powered by AI - Ensure extracted text accuracy before use.
         </CardFooter>
      </Card>
    </div>
  );
}
