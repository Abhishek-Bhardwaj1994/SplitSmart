import React, { useState } from "react";
import { Button, Typography, Select, MenuItem } from "@mui/material";
import axios from "../services/api";

const PDFToImage = () => {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState("jpg");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleConvert = async () => {
    if (!file) return alert("Please upload a PDF file!");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("format", format);

    try {
      const response = await axios.post("/pdf-to-image", formData, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `converted.${format}`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error converting PDF to Image:", error);
    }
  };

  return (
    <div>
      <Typography variant="h4">Convert PDF to Image</Typography>
      <Select value={format} onChange={(e) => setFormat(e.target.value)}>
        <MenuItem value="jpg">JPG</MenuItem>
        <MenuItem value="png">PNG</MenuItem>
        <MenuItem value="heif">HEIF</MenuItem>
      </Select>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <Button variant="contained" color="primary" onClick={handleConvert}>
        Convert
      </Button>
    </div>
  );
};

export default PDFToImage;
