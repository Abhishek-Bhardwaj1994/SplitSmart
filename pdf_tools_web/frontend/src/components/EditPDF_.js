import React, { useState, useRef } from 'react';
import api from '../services/api';
import React, { useRef, useState } from 'react';

export default function DrawCanvas({ pageIndex, width, height, onDrawEnd }) {
  const canvasRef = useRef();
  const [drawing, setDrawing] = useState(false);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [color, setColor] = useState('#FF0000');
  const [strokeWidth, setStrokeWidth] = useState(2);

  const startDrawing = (e) => {
    setDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    setCurrentPath([[offsetX, offsetY]]);
  };

  const draw = (e) => {
    if (!drawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const newPath = [...currentPath, [offsetX, offsetY]];
    setCurrentPath(newPath);
    redraw([...paths, { points: newPath, color, width: strokeWidth }]);
  };

  const endDrawing = () => {
    if (!drawing) return;
    const newPaths = [...paths, { points: currentPath, color, width: strokeWidth }];
    setPaths(newPaths);
    setCurrentPath([]);
    setDrawing(false);
    onDrawEnd(pageIndex, newPaths);
  };

  const redraw = (allPaths) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    allPaths.forEach(stroke => {
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.moveTo(stroke.points[0][0], stroke.points[0][1]);
      stroke.points.slice(1).forEach(pt => ctx.lineTo(pt[0], pt[1]));
      ctx.stroke();
    });
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 10, cursor: 'crosshair' }}
      />
      <div className="flex space-x-2 p-2 bg-white rounded absolute top-2 left-2 z-20">
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <input
          type="range"
          min="1"
          max="10"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
        />
      </div>
    </>
  );
}
