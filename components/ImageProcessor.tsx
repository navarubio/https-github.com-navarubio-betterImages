
import React, { useState, useCallback, useRef } from 'react';
import { processImageWithGemini } from '../services/geminiService';
import { fileToGenerativePart } from '../utils/fileUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Toast, ToastProps } from './ui/Toast';
import { UploadIcon, SparklesIcon, DownloadIcon, LoaderIcon, ImageIcon } from './ui/icons';

const ImageProcessor: React.FC = () => {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastProps | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalImageFile(file);
      setOriginalImageUrl(URL.createObjectURL(file));
      setProcessedImageUrl(null);
      setToast(null);
    }
  };

  const handleProcessImage = useCallback(async () => {
    if (!originalImageFile) {
      setToast({
        title: "Archivo no encontrado",
        description: "Por favor, selecciona una imagen primero.",
        variant: "destructive",
        onClose: () => setToast(null),
      });
      return;
    }

    setIsProcessing(true);
    setProcessedImageUrl(null);
    setToast({
      title: "Procesando imagen...",
      description: "Aplicando fondo blanco y mejoras. Esto puede tardar unos segundos.",
      variant: "default",
      onClose: () => setToast(null),
    });

    try {
      const imagePart = await fileToGenerativePart(originalImageFile);
      // Prompt optimizado para forzar fondo blanco y eliminar fondos grises/complejos
      const prompt = `
        Actúa como un editor fotográfico profesional de eCommerce. Tu objetivo es estandarizar esta imagen para un catálogo premium.
        
        INSTRUCCIONES OBLIGATORIAS:
        1.  **FONDO BLANCO ABSOLUTO**: Elimina POR COMPLETO el fondo original, sin importar si es gris, de estudio o complejo. El fondo final DEBE ser blanco sólido puro (Hex: #FFFFFF).
        2.  **Aislamiento del Producto**: Recorta el producto con extrema precisión. Asegúrate de que no queden bordes grises ni halos del fondo anterior alrededor del objeto.
        3.  **Centrado y Encuadre**: Centra el producto perfectamente en el lienzo (alineación vertical y horizontal). El producto debe ocupar un 80-85% de la imagen, dejando un margen blanco equilibrado alrededor.
        4.  **Iluminación de Estudio**: Ajusta la iluminación para que el producto se vea nítido, brillante y tridimensional. Elimina sombras duras sobre el producto, pero mantén el contraste natural.
        5.  **Sombra de Apoyo**: Genera una sombra de contacto suave y realista (drop shadow) DEBAJO del producto sobre el fondo blanco. Esto es crucial para que el producto no parezca estar flotando. La sombra debe ser gris suave y difusa.
        6.  **Formato**: Genera la imagen en alta calidad y formato cuadrado (1:1).
      `;

      const resultBase64 = await processImageWithGemini(prompt, imagePart);
      setProcessedImageUrl(`data:image/webp;base64,${resultBase64}`);
      setToast({
        title: "¡Imagen procesada con éxito!",
        description: "Fondo blanco aplicado y calidad mejorada.",
        variant: "success",
        onClose: () => setToast(null),
      });
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
      setToast({
        title: "Error de procesamiento",
        description: `No se pudo procesar la imagen. ${errorMessage}`,
        variant: "destructive",
        onClose: () => setToast(null),
      });
    } finally {
      setIsProcessing(false);
    }
  }, [originalImageFile]);

  const triggerFileSelect = () => fileInputRef.current?.click();

  const ImagePlaceholder = ({ text }: { text: string }) => (
    <div className="flex flex-col items-center justify-center w-full h-full aspect-square bg-slate-100 dark:bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
      <ImageIcon className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4" />
      <p className="text-slate-500 dark:text-slate-400 text-center">{text}</p>
    </div>
  );

  return (
    <>
      {toast && <Toast {...toast} />}
      <Card>
        <CardHeader>
          <CardTitle>Editor de Imágenes para Catálogo</CardTitle>
          <CardDescription>Sube una imagen y la IA eliminará el fondo (dejándolo 100% blanco) y mejorará la calidad del producto.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Original Image Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-center">Imagen Original</h3>
              <div className="w-full max-w-lg mx-auto">
                {originalImageUrl ? (
                  <img src={originalImageUrl} alt="Original" className="rounded-lg shadow-md w-full h-auto object-contain aspect-square" />
                ) : (
                  <ImagePlaceholder text="Sube una imagen para comenzar" />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />
              <Button onClick={triggerFileSelect} disabled={isProcessing}>
                <UploadIcon className="mr-2 h-4 w-4" />
                {originalImageFile ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
              </Button>
            </div>

            {/* Processed Image Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-center">Imagen Procesada</h3>
              <div className="w-full max-w-lg mx-auto">
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center w-full h-full aspect-square bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                    <LoaderIcon className="w-16 h-16 text-sky-500" />
                    <p className="mt-4 text-slate-500 dark:text-slate-400 animate-pulse">Procesando con IA...</p>
                    <p className="text-xs text-slate-400 mt-2">Aplicando fondo blanco puro...</p>
                  </div>
                ) : processedImageUrl ? (
                  <img src={processedImageUrl} alt="Processed" className="rounded-lg shadow-md w-full h-auto object-contain aspect-square" />
                ) : (
                  <ImagePlaceholder text="La imagen mejorada aparecerá aquí" />
                )}
              </div>
              {processedImageUrl && !isProcessing ? (
                <a href={processedImageUrl} download="producto-fondo-blanco.webp">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Descargar Imagen (.webp)
                  </Button>
                </a>
              ) : (
                 <Button onClick={handleProcessImage} disabled={!originalImageFile || isProcessing} className="w-full">
                  {isProcessing ? (
                    <LoaderIcon className="mr-2 h-4 w-4" />
                  ) : (
                    <SparklesIcon className="mr-2 h-4 w-4" />
                  )}
                  {isProcessing ? 'Procesando...' : 'Aplicar Fondo Blanco y Mejorar'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ImageProcessor;
