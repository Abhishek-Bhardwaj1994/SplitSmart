import React, { useState } from 'react';
import axios from "../services/api";
import { useNavigate } from 'react-router-dom';

const CompressPDF = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestedFilename, setSuggestedFilename] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError('');
    setDownloadUrl('');
    setSuggestedFilename('');
  };

  const handleSubmit = async () => {
    if (!file) return setError('❗ Please select a PDF file.');

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsProcessing(true);

      const response = await axios.post('/compress-pdf/', formData, {
        responseType: 'blob',
        headers: { "Content-Type": "multipart/form-data" },
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const nameWithoutExt = file.name.replace(/\.pdf$/i, '');
      const filename = `${nameWithoutExt}_compressed.pdf`;
      setDownloadUrl(url);
      setSuggestedFilename(filename);
    } catch (err) {
      console.error(err);
      setError('⚠️ Something went wrong.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ This handles the download with dynamic filename
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = suggestedFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem', border: '1px solid #ccc', borderRadius: 8, position: 'relative' }}>
      {/* 🏠 Home button */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: "#9C27B0",
          color: "white",
          padding: "8px 16px",
          borderRadius: "20px",
          fontWeight: "bold",
          border: "none",
          cursor: "pointer",
        }}
      >
        HOME
      </button>

      <h2 style={{ textAlign: 'center' }}>📉 Compress PDF</h2>

      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <br /><br />
      <button
        onClick={handleSubmit}
        disabled={isProcessing}
        style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        {isProcessing ? 'Compressing...' : 'Compress'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      {downloadUrl && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          ✅ Compression complete!
          <br />
          <button
            onClick={handleDownload}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '0.5rem',
              fontWeight: 'bold'
            }}
          >
            🔽 Download {suggestedFilename}
          </button>
        </div>
      )}
    </div>
  );
};

export default CompressPDF;
