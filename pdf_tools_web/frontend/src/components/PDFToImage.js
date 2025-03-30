import React, { useState } from "react";
import { Button, Typography, Select, MenuItem, CircularProgress, Snackbar } from "@mui/material";
import axios from "../services/api";

const PDFToImage = () => {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState("jpg");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleConvert = async () => {
    if (!file) return alert("Please upload a PDF file!");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("format", format);

    setLoading(true);

    try {
      const response = await axios.post("/pdf-to-image", formData, { responseType: "blob" });

      // Detect if response is a ZIP file (for multi-page PDFs)
      const contentType = response.headers["content-type"];
      const isZip = contentType === "application/zip";

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", isZip ? "converted_images.zip" : `converted.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage("Conversion successful! File downloaded.");
    } catch (error) {
      console.error("Error converting PDF to Image:", error);
      setMessage("Conversion failed. Please try again.");
    } finally {
      setLoading(false);
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
      <Button variant="contained" color="primary" onClick={handleConvert} disabled={loading}>
        {loading ? <CircularProgress size={24} color="inherit" /> : "Convert"}
      </Button>
      <Snackbar open={!!message} autoHideDuration={4000} message={message} onClose={() => setMessage("")} />
    </div>
  );
};

export default PDFToImage;
