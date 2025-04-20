// src/components/EditPDF/PDFViewer.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFViewer = ({ pdfUrl }) => {
  const canvasRef = useRef(null);
  const drawCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState(null);

  // Load PDF
  useEffect(() => {
    const renderPDF = async () => {
      if (!pdfUrl) return;
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      const drawCanvas = drawCanvasRef.current;

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      drawCanvas.height = viewport.height;
      drawCanvas.width = viewport.width;

      const context = canvas.getContext('2d');
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      await page.render(renderContext).promise;

      setCtx(drawCanvas.getContext('2d'));
    };

    renderPDF();
  }, [pdfUrl]);

  // Drawing handlers
  const startDrawing = (e) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    ctx.lineTo(offsetX, offsetY);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
    ctx.closePath();
  };

  return (
    <div style={{ position: 'relative', textAlign: 'center' }}>
      <canvas ref={canvasRef} style={{ border: '1px solid #ccc', position: 'absolute', zIndex: 0 }} />
      <canvas
        ref={drawCanvasRef}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, cursor: 'crosshair' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
      />
    </div>
  );
};

export default PDFViewer;
