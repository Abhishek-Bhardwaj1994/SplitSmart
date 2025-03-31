import React, { useState } from "react";
import { Button, Typography, Alert, FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import axios from "../services/api";
import { Link } from "react-router-dom";

const ImageToPDF = () => {
  const [files, setFiles] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageFormat, setImageFormat] = useState("jpg"); // Default format: JPG
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles.length) return;

    // ✅ Validate file type based on selected format
    for (let file of selectedFiles) {
      const fileType = file.type.split("/")[1]; // Extract format (e.g., "jpeg" from "image/jpeg")
      if (!["jpeg", "jpg", "png", "heif", "heic", "jfif"].includes(fileType) || fileType !== imageFormat) {
        setErrorMessage(`❌ Only ${imageFormat.toUpperCase()} files are allowed!`);
        return;
      }
    }

    setFiles(selectedFiles);
    setPreviewUrl(null);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleFormatChange = (e) => {
    setImageFormat(e.target.value);
    setFiles(null); // Clear files on format change
    setPreviewUrl(null);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleConvert = async () => {
    if (!files) {
      setErrorMessage("❌ Please upload images before converting.");
      return;
    }

    const formData = new FormData();
    for (let file of files) {
      formData.append("images", file);
    }
    formData.append("format", "pdf"); // Always convert to PDF

    try {
      const response = await axios.post("/convert-image/", formData, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));

      setPreviewUrl(url);
      setSuccessMessage(`✅ Conversion successful! Preview & Download your PDF.`);
      setErrorMessage("");
    } catch (error) {
      console.error("Error converting images:", error);
      setErrorMessage("❌ Conversion failed. Please try again.");
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.href = previewUrl;
    link.setAttribute("download", "converted.pdf");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>
      {/* Home Button */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <Button variant="contained" color="secondary" style={{ marginBottom: "10px" }}>
          Home
        </Button>
      </Link>

      <Typography variant="h4">Convert {imageFormat.toUpperCase()} Images to PDF</Typography>

      {/* Select Image Format */}
      <FormControl component="fieldset" style={{ marginTop: "15px" }}>
        <Typography variant="h6">Select Image Format</Typography>
        <RadioGroup row value={imageFormat} onChange={handleFormatChange}>
          <FormControlLabel value="jpg" control={<Radio />} label="JPG" />
          <FormControlLabel value="png" control={<Radio />} label="PNG" />
          <FormControlLabel value="heif" control={<Radio />} label="HEIF" />
          <FormControlLabel value="heic" control={<Radio />} label="HEIC" />
          <FormControlLabel value="jfif" control={<Radio />} label="JFIF" /> {/* ✅ JFIF Added */}
        </RadioGroup>
      </FormControl>

      <input
        type="file"
        multiple
        accept={`image/${imageFormat}`}
        onChange={handleFileChange}
        style={{ marginTop: "10px" }}
      />

      <Button variant="contained" color="primary" onClick={handleConvert} style={{ marginTop: "10px" }}>
        Convert to PDF
      </Button>

      {errorMessage && <Alert severity="error" style={{ marginTop: "10px" }}>{errorMessage}</Alert>}
      {successMessage && <Alert severity="success" style={{ marginTop: "10px" }}>{successMessage}</Alert>}

      {/* Preview & Download */}
      {previewUrl && (
        <div style={{ marginTop: "20px" }}>
          <Typography variant="h6">Converted PDF Preview</Typography>
          <iframe src={previewUrl} width="100%" height="500px" style={{ border: "1px solid #ccc", marginTop: "10px" }} title="Preview" />
          <Button variant="contained" color="secondary" onClick={handleDownload} style={{ marginTop: "10px" }}>
            Download PDF
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageToPDF;
