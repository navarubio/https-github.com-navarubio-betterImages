
import React, { useState, useCallback, useRef } from 'react';
import { processImageWithGemini } from '../services/geminiService';
import { fileToGenerativePart, resizeImage } from '../utils/fileUtils';
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
    if (!originalImageFile) return;

    setIsProcessing(true);
    setProcessedImageUrl(null);
    setToast({
      title: "Procesando Imagen",
      description: "Centrando objeto y ajustando dimensiones a 564x564...",
      variant: "default",
      onClose: () => setToast(null),
    });

    try {
      const imagePart = await fileToGenerativePart(originalImageFile);
      
      const prompt = `
        ACTÚA COMO UN EDITOR FOTOGRÁFICO DE ALTA PRECISIÓN PARA ECOMMERCE.
        
        INSTRUCCIONES DE RECOMPOSICIÓN ESPACIAL (CRÍTICO):
        1. EXTRACCIÓN: Identifica el producto principal en la imagen.
        2. IGNORAR POSICIÓN ORIGINAL: No mantengas el objeto en la parte inferior. El objeto debe ser "despegado" de su ubicación original.
        3. CENTRADO VERTICAL ABSOLUTO: Coloca el objeto en el CENTRO MUERTO del eje Y. El margen superior debe ser EXACTAMENTE IGUAL al margen inferior.
        4. CENTRADO HORIZONTAL ABSOLUTO: Coloca el objeto en el CENTRO MUERTO del eje X.
        5. LIENZO: El resultado debe ser un cuadrado perfecto 1:1.
        6. ESCALA: El producto debe ocupar entre el 75% y el 80% del área total.
        
        INSTRUCCIONES DE COLOR Y FONDO:
        1. FONDO BLANCO PURO: Todo el fondo DEBE ser color sólido hexadecimal #FFFFFF. Sin degradados.
        2. SOMBRA DE CONTACTO: Aplica una sombra de contacto extremadamente pequeña y sutil justo debajo del producto.
        3. NITIDEZ: Mantén todos los textos del empaque perfectamente legibles.
        
        IMPORTANTE: La imagen final será escalada a 564x564 píxeles. Optimiza la nitidez para este tamaño.
      `;

      const resultBase64 = await processImageWithGemini(prompt, imagePart);
      
      // Aplicamos el redimensionamiento proporcional a 564x564 para evitar distorsiones
      const finalResizedUrl = await resizeImage(resultBase64, 564, 564);
      
      setProcessedImageUrl(finalResizedUrl);
      setToast({
        title: "¡Optimización Exitosa!",
        description: "Imagen centrada y ajustada a 564x564 para catálogo.",
        variant: "success",
        onClose: () => setToast(null),
      });
    } catch (error) {
      setToast({
        title: "Error de IA",
        description: error instanceof Error ? error.message : "Error al procesar la imagen.",
        variant: "destructive",
        onClose: () => setToast(null),
      });
    } finally {
      setIsProcessing(false);
    }
  }, [originalImageFile]);

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4">
      {toast && <Toast {...toast} />}
      
      <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 p-6">
          <CardTitle className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <SparklesIcon className="text-sky-500 w-6 h-6" />
            Optimizador de Catálogo Profesional
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Estandarización automática: Centrado simétrico y resolución final de 564x564px.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            
            {/* PANEL ORIGINAL */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Carga de Producto</span>
              
              <div className="relative aspect-square w-full rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80">
                {originalImageUrl ? (
                  <img src={originalImageUrl} alt="Original" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center p-8 opacity-40">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-sm font-semibold">Suelta la imagen aquí</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>
              
              <Button onClick={() => fileInputRef.current?.click()} className="h-12 bg-sky-600 hover:bg-sky-700 font-bold transition-transform active:scale-95 shadow-md">
                <UploadIcon className="mr-2 w-5 h-5" />
                {originalImageUrl ? 'Cambiar Imagen' : 'Seleccionar Archivo'}
              </Button>
            </div>

            {/* PANEL RESULTADO */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resultado 564 x 564</span>
                {processedImageUrl && <span className="bg-emerald-100 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full font-black">COMPLETADO</span>}
              </div>

              <div className="relative aspect-square w-full rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shadow-inner">
                {isProcessing ? (
                  <div className="flex flex-col items-center">
                    <LoaderIcon className="w-10 h-10 text-sky-500 mb-4" />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center animate-pulse">Estandarizando Composición...</p>
                  </div>
                ) : processedImageUrl ? (
                  <div className="w-full h-full bg-white flex items-center justify-center p-2">
                    <img src={processedImageUrl} alt="Resultado Final" className="w-full h-full object-contain shadow-sm border border-slate-50" />
                  </div>
                ) : (
                  <div className="text-center p-8 opacity-20">
                    <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-sm italic text-center">La versión final aparecerá aquí</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {processedImageUrl ? (
                  <>
                    <a href={processedImageUrl} download="producto_catalogo_564x564.webp" className="w-full">
                      <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-600/20">
                        <DownloadIcon className="mr-2 w-5 h-5" /> Descargar Formato Catálogo
                      </Button>
                    </a>
                    <button 
                      onClick={() => setProcessedImageUrl(null)} 
                      className="text-[10px] font-bold text-slate-400 hover:text-sky-500 uppercase tracking-widest text-center transition-colors"
                    >
                      Limpiar y procesar otra
                    </button>
                  </>
                ) : (
                  <Button 
                    onClick={handleProcessImage} 
                    disabled={!originalImageFile || isProcessing}
                    className="w-full h-14 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black text-base shadow-xl disabled:opacity-30"
                  >
                    {isProcessing ? <LoaderIcon className="mr-2" /> : <SparklesIcon className="mr-2 text-amber-400" />}
                    {isProcessing ? 'GENERANDO...' : 'OPTIMIZAR PARA CATÁLOGO'}
                  </Button>
                )}
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
      
      <div className="mt-10 flex flex-col items-center gap-2">
        <div className="h-px w-24 bg-slate-200 dark:bg-slate-800 mb-2"></div>
        <p className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-400 text-center">
          Procesamiento de Alta Fidelidad
        </p>
        <p className="text-[9px] text-slate-400 opacity-60 text-center max-w-xs">
          Cumple con los estándares de Amazon, Mercado Libre y Catálogos Pro.
        </p>
      </div>
    </div>
  );
};

export default ImageProcessor;
