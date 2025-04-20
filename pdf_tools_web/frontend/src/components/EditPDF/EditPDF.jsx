import React, { useState, useRef, useEffect } from 'react';
import axios from '../../services/api';
import DrawCanvas from './DrawCanvas';

const EditPDF = () => {
  const [sessionId, setSessionId] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const canvasRef = useRef(null);

  // ✅ Fetch CSRF cookie once on mount
  useEffect(() => {
    axios.get('/set-csrf/', { withCredentials: true })
      .then(() => console.log("CSRF cookie set"))
      .catch(err => console.error("Failed to set CSRF:", err));
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/edit-pdf/upload-pdf/', formData, {
        withCredentials: true,
      });
      setSessionId(res.data.session_id);
      setPdfUrl(res.data.file_url);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleSubmitDrawing = async () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');

    try {
      const res = await axios.post(
        '/edit-pdf/draw/',
        {
          session_id: sessionId,
          image_data: imageData,
        },
        {
          withCredentials: true,
          responseType: 'blob',
        }
      );

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url);
    } catch (err) {
      console.error('Drawing submission failed:', err);
    }
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {pdfUrl && (
        <div>
          <DrawCanvas canvasRef={canvasRef} pdfUrl={pdfUrl} />
          <button onClick={handleSubmitDrawing}>Submit Drawing</button>
        </div>
      )}
    </div>
  );
};

export default EditPDF;
