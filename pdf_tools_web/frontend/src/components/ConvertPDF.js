import React, { useState, useEffect } from "react";
import { Button, Typography, Select, MenuItem } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../services/api";
import { v4 as uuidv4 } from "uuid";

const ConvertPDF = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getConversionTypeFromURL = () => {
    const path = location.pathname.replace("/", "");
    return path === "word-to-pdf" ? "word-to-pdf" : "pdf-to-word"; // Default
  };

  const [file, setFile] = useState(null);
  const [conversionType, setConversionType] = useState(getConversionTypeFromURL());
  const [message, setMessage] = useState("");
  const [convertedFile, setConvertedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigate(`/${conversionType}`);
    setMessage("");  // Clear success/error message when switching conversion types
    setConvertedFile(null); // Also clear the converted file preview
  }, [conversionType, navigate]);
  

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setConvertedFile(null);  // Clear previous converted file
    setMessage("");  // Reset message when selecting a new file
  };
  

  const handleConvert = async () => {
    if (!file) return alert("Please upload a file!");
  
    setLoading(true);
    setConvertedFile(null); // Ensure we clear any previous file
    setMessage(""); // Reset message before conversion
  
    const formData = new FormData();
    formData.append("file", file);
  
    const endpoint = conversionType === "pdf-to-word" ? "/pdf-to-word/" : "/word-to-pdf/";
    const fileType =
      conversionType === "pdf-to-word"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/pdf";
  
    try {
      const response = await axios.post(endpoint, formData, { responseType: "blob" });
  
      if (response.status !== 200) {
        throw new Error("Failed to convert file. Please try again.");
      }
  
      const fileBlob = new Blob([response.data], { type: fileType });
      const fileURL = URL.createObjectURL(fileBlob);
  
      setConvertedFile(fileURL);
      setMessage("File converted successfully!");
    } catch (error) {
      console.error("Error converting file:", error);
      setMessage("Error converting file. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  
  

  const handleDownload = () => {
    if (!convertedFile) return;

    const uniqueId = uuidv4().split("-")[0];
    const originalName = file.name.split(".")[0];
    const extension = conversionType === "pdf-to-word" ? "docx" : "pdf";

    const link = document.createElement("a");
    link.href = convertedFile;
    link.setAttribute("download", `${originalName}_${uniqueId}.${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <Typography variant="h4">Convert PDF / Word</Typography>

      {/* Conversion Type Selector */}
      <Select value={conversionType} onChange={(e) => setConversionType(e.target.value)}>
        <MenuItem value="pdf-to-word">PDF to Word</MenuItem>
        <MenuItem value="word-to-pdf">Word to PDF</MenuItem>
      </Select>

      {/* File Upload */}
      <input 
        type="file"
        accept={conversionType === "pdf-to-word" ? ".pdf" : ".docx"}
        onChange={handleFileChange}
      />

      {/* Convert Button */}
      <Button variant="contained" color="primary" onClick={handleConvert} disabled={loading}>
        {loading ? "Converting..." : "Convert"}
      </Button>

      {/* Show Preview and Download Button */}
      {convertedFile && (
  <>
    <Typography variant="h6">Preview:</Typography>

    {conversionType === "word-to-pdf" ? (
      <iframe
        title="Converted PDF Preview"
        src={convertedFile}
        width="100%"
        height="500px"
        type="application/pdf"
      ></iframe>
    ) : (
      <Typography variant="body1">
        Word document converted successfully. Click "Download" to view it.
      </Typography>
    )}

    <Button variant="contained" color="secondary" onClick={handleDownload}>
      Download
    </Button>
  </>
)}



      {/* Feedback Message */}
      {message && <Typography color="secondary">{message}</Typography>}
    </div>
  );
};

export default ConvertPDF;
