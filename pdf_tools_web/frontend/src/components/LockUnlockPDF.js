import React, { useState,useRef  } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LockUnlockPDF = () => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('lock');
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);


  const navigate = useNavigate();

  const resetOutput = () => {
    setDownloadUrl('');
    setPreviewUrl('');
    setError('');
  };

  const handleFileChange = (e) => {
    resetOutput();
    if (e.target.files.length > 1) {
      setError("❌ Please upload only one PDF file.");
      setFile(null);
    } else {
      setError('');
      setFile(e.target.files[0]);
    }
  };

  const handleModeChange = (selectedMode) => {
    resetOutput();
    setMode(selectedMode);
    setPassword('');
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  

  const handleSubmit = async () => {
    if (!file) return setError('❗ Please select a PDF file.');
    if (!password) return setError('❗ Please enter a password.');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    formData.append('mode', mode);

    try {
      setIsProcessing(true);
      const response = await axios.post('/lock-unlock-pdf/', formData, {
        responseType: 'blob',
        headers: { "Content-Type": "multipart/form-data" },
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      if (mode === 'lock') {
        setDownloadUrl(url);
      } else {
        setPreviewUrl(url);
      }

      setError('');
    } catch (err) {
      console.error("AXIOS ERROR:", err);
      if (err.response) {
        err.response.data.text().then(text => console.error("Error response text:", text));
      }
      setError("⚠️ Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="lock-unlock-container" style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem', border: '1px solid #ccc', borderRadius: 8 }}>
      <button
        onClick={() => navigate('/')}
        style={{
          backgroundColor: '#9C27B0',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '20px',
          fontWeight: 'bold',
          border: 'none',
          position: 'absolute',
          top: '20px',
          left: '20px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        HOME
      </button>

      <h2>🔐 Lock / Unlock PDF</h2>

      <div style={{ marginBottom: '1rem' }}>
        <input type="file" accept="application/pdf" onChange={handleFileChange} 
        ref={fileInputRef}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="radio"
            value="lock"
            checked={mode === 'lock'}
            onChange={() => handleModeChange('lock')}
            style={{ marginRight: '0.5rem' }}
          />
          Lock PDF
        </label>
        <label style={{ marginLeft: '1rem' }}>
          <input
            type="radio"
            value="unlock"
            checked={mode === 'unlock'}
            onChange={() => handleModeChange('unlock')}
            style={{ marginRight: '0.5rem' }}
          />
          Unlock PDF
        </label>
      </div>

      <div style={{ marginBottom: '1rem', position: 'relative' }}>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder={mode === 'lock' ? "Set Password" : "Enter Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '95%', padding: '0.5rem' }}
        />
        <button
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: 10,
            top: 5,
            background: 'none',
            border: 'none',
            color: '#9C27B0',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          {showPassword ? '🙈 Hide' : '👁 Show'}
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {isProcessing ? (mode === 'lock' ? '🔐 Locking...' : '🔓 Unlocking...') : 'Submit'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {mode === 'lock' && downloadUrl && (
        <div style={{ marginTop: '1rem' }}>
          ✅ PDF successfully locked!
          <br />
          <a href={downloadUrl} download="locked.pdf">🔽 Download Locked PDF</a>
        </div>
      )}

      {mode === 'unlock' && previewUrl && (
        <div style={{ marginTop: '1rem' }}>
          ✅ PDF unlocked successfully!
          <br />
          <iframe src={previewUrl} width="100%" height="600px" title="PDF Preview" />
        </div>
      )}
    </div>
  );
};

export default LockUnlockPDF;
