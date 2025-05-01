"use client";

import { useState, ChangeEvent, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, Copy, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { extractText } from '@/ai/flows/extract-text-from-image';

export default function PhotoExtractorClient() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      setExtractedText(''); // Reset extracted text when a new image is selected
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Validate if it's a valid image Data URI
        if (result.startsWith('data:image/')) {
          setImageBase64(result);
        } else {
          setError('Invalid file type. Please upload an image.');
          setImageBase64(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset file input
          }
        }
      };
      reader.onerror = () => {
        setError('Failed to read the file.');
        setImageBase64(null);
         if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset file input
          }
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
    } catch (err) {
      console.error('Extraction failed:', err);
      setError('Failed to extract text from the image. Please try again.');
      setExtractedText(''); // Clear text on error
    } finally {
      setIsLoading(false);
    }
  }, [imageBase64]);

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
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
       setError(null);
       setExtractedText(''); // Reset extracted text on drop
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
         if (result.startsWith('data:image/')) {
          setImageBase64(result);
        } else {
          setError('Invalid file type. Please drop an image file.');
          setImageBase64(null);
        }
      };
       reader.onerror = () => {
        setError('Failed to read the dropped file.');
        setImageBase64(null);
      };
      reader.readAsDataURL(file);
    }
  };

   const triggerFileInput = () => {
    fileInputRef.current?.click();
  };


  return (
    <div className="w-full max-w-2xl space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-foreground">PhotoText Extractor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
             <Label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer border-border hover:bg-muted/50 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
               {imageBase64 ? (
                 <div className="relative w-full h-full">
                   <Image
                    src={imageBase64}
                    alt="Uploaded preview"
                    layout="fill"
                    objectFit="contain"
                    className="rounded-md"
                    data-ai-hint="uploaded image preview"
                  />
                 </div>
               ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                    <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                </div>
               )}
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
            </Label>
            {imageBase64 && (
              <Button variant="outline" size="sm" onClick={triggerFileInput} className="mt-2">
                Change Image
              </Button>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            onClick={handleExtractText}
            disabled={!imageBase64 || isLoading}
            className="w-full"
            aria-label="Extract Text from Image"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>

            )}
            {isLoading ? 'Extracting...' : 'Extract Text'}
          </Button>

          {extractedText && (
            <div className="space-y-2">
              <Label htmlFor="extracted-text">Extracted Text:</Label>
              <div className="relative">
                <Textarea
                  id="extracted-text"
                  value={extractedText}
                  readOnly
                  className="pr-10 min-h-[150px] bg-muted/30"
                  aria-label="Extracted text display area"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyText}
                  className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-foreground"
                  aria-label="Copy extracted text"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
           {isLoading && !extractedText && (
             <div className="space-y-2">
               <Label>Extracting Text:</Label>
                 <div className="flex items-center justify-center p-4 border rounded-md min-h-[150px] bg-muted/30">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
             </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
