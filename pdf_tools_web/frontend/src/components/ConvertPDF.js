import React, { useState, useEffect } from "react";
import { Button, Typography, Select, MenuItem } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../services/api";

const ConvertPDF = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract conversion type from the URL path
  const getConversionTypeFromURL = () => {
    const path = location.pathname.replace("/", ""); // Remove "/"
    return path === "word-to-pdf" ? "word-to-pdf" : "pdf-to-word"; // Default is "pdf-to-word"
  };

  const [file, setFile] = useState(null);
  const [conversionType, setConversionType] = useState(getConversionTypeFromURL());

  // Update URL when conversion type changes
  useEffect(() => {
    navigate(`/${conversionType}`);
  }, [conversionType, navigate]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleConvert = async () => {
    if (!file) return alert("Please upload a file!");

    const formData = new FormData();
    formData.append("file", file);

    console.log("Selected Conversion Type:", conversionType);

    const endpoint = conversionType === "pdf-to-word" ? "/pdf-to-word/" : "/word-to-pdf/";
    console.log("API Request URL:", endpoint); // Debugging log

    try {
      const response = await axios.post(endpoint, formData, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `converted.${conversionType === "pdf-to-word" ? "docx" : "pdf"}`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error converting file:", error);
    }
  };

  return (
    <div>
      <Typography variant="h4">Convert PDF / Word</Typography>
      <Select
        value={conversionType}
        onChange={(e) => setConversionType(e.target.value)}
      >
        <MenuItem value="pdf-to-word">PDF to Word</MenuItem>
        <MenuItem value="word-to-pdf">Word to PDF</MenuItem>
      </Select>
      <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />
      <Button variant="contained" color="primary" onClick={handleConvert}>
        Convert
      </Button>
    </div>
  );
};

export default ConvertPDF;
