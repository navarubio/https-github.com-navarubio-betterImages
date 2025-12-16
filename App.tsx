
import React from 'react';
import ImageProcessor from './components/ImageProcessor';

function App() {
  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200">
      <header className="bg-white dark:bg-slate-800 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Asistente de Catálogo de Productos con IA
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Mejora y estandariza las imágenes de tus productos con el poder de Gemini.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ImageProcessor />
      </main>
      <footer className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
        <p>Desarrollado con React, Tailwind CSS y la API de Google Gemini.</p>
      </footer>
    </div>
  );
}

export default App;
