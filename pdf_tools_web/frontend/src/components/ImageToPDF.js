import React, { useState } from "react";
import {
  Button,
  Typography,
  Alert,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Box,
  Container
} from "@mui/material";
import axios from "../services/api";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const ImageToPDF = () => {
  const [files, setFiles] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageFormat, setImageFormat] = useState("jpg");
  const [successMessage, setSuccessMessage] = useState("");
  const [mergedFileName, setMergedFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isConverting, setIsConverting] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles.length) return;

    const allowedExtensions = {
      jpg: ["jpg", "jpeg"],
      png: ["png"],
      heif: ["heif"],
      heic: ["heic"],
      jfif: ["jfif"],
    };

    for (let file of selectedFiles) {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions[imageFormat].includes(fileExtension)) {
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
    setFiles(null);
    setPreviewUrl(null);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleConvert = async () => {
    if (!files) {
      setErrorMessage("❌ Please upload images before converting.");
      return;
    }

    setIsConverting(true);

    const formData = new FormData();
    for (let file of files) {
      formData.append("files", file);
    }

    try {
      const response = await axios.post("/heif-jpg-image-to-pdf/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const contentDisposition = response.headers["content-disposition"];
      let fileName = "converted";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+?)"/);
        if (match) fileName = match[1];
      }

      setPreviewUrl(url);
      setSuccessMessage("✅ Conversion successful! Preview & Download your PDF.");
      setMergedFileName(fileName);
      setErrorMessage("");
    } catch (error) {
      console.error("Error converting images:", error);
      setErrorMessage("❌ Conversion failed. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const uniqueId = uuidv4().split("-")[0];
    const link = document.createElement("a");
    link.href = previewUrl;
    link.setAttribute("download", `${mergedFileName}_${uniqueId}.pdf`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>
      {/* Home Button */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <Button
          variant="contained"
          color="secondary"
          style={{
            backgroundColor: "#9C27B0",
            color: "white",
            padding: "10px 20px",
            borderRadius: "20px",
            fontWeight: "bold",
            border: "none",
            position: "absolute",
            top: "20px",
            left: "20px",
            cursor: "pointer",
            zIndex: 1000,
          }}
        >
          Home
        </Button>
      </Link>

      {/* Centered Form Container */}
      <Container maxWidth="sm" style={{ marginTop: "100px", textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Convert {imageFormat.toUpperCase()} Images to PDF
        </Typography>

        {/* Format Selection */}
        <FormControl component="fieldset" style={{ marginTop: "20px" }}>
          <Typography variant="h6" gutterBottom>Select Image Format</Typography>
          <RadioGroup
            row
            value={imageFormat}
            onChange={handleFormatChange}
            style={{ justifyContent: "center" }}
          >
            <FormControlLabel value="jpg" control={<Radio />} label="JPG / JPEG" />
            <FormControlLabel value="png" control={<Radio />} label="PNG" />
            <FormControlLabel value="heif" control={<Radio />} label="HEIF" />
            <FormControlLabel value="heic" control={<Radio />} label="HEIC" />
            <FormControlLabel value="jfif" control={<Radio />} label="JFIF" />
          </RadioGroup>
        </FormControl>

        {/* File Upload */}
        <Box mt={3}>
          <input
            type="file"
            multiple
            accept={
              imageFormat === "jpg"
                ? ".jpg,.jpeg"
                : imageFormat === "png"
                ? ".png"
                : imageFormat === "heif"
                ? ".heif"
                : imageFormat === "heic"
                ? ".heic"
                : ".jfif"
            }
            onChange={handleFileChange}
            style={{
              margin: "10px auto",
              display: "block",
            }}
          />
        </Box>

        {/* Convert Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleConvert}
          disabled={isConverting}
          style={{ marginTop: "20px" }}
        >
          {isConverting ? "Converting..." : "Convert to PDF"}
        </Button>

        {/* Alerts */}
        {errorMessage && (
          <Alert severity="error" style={{ marginTop: "20px" }}>
            {errorMessage}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" style={{ marginTop: "20px" }}>
            {successMessage}
          </Alert>
        )}
      </Container>

      {/* Full-Width PDF Preview */}
      {previewUrl && (
        <Box mt={5} px={2}>
          <Typography variant="h6" align="center" gutterBottom>
            Converted PDF Preview
          </Typography>

          <Box
            sx={{
              width: "100vw",
              height: "90vh",
              overflow: "hidden",
              border: "1px solid #ccc",
              borderRadius: "10px",
              margin: "0 auto",
            }}
          >
            <object
              data={previewUrl}
              type="application/pdf"
              width="100%"
              height="100%"
              style={{ display: "block" }}
            >
              <p>
                Preview not supported. <a href={previewUrl} download>Download PDF</a>
              </p>
            </object>
          </Box>

          <Box mt={3} textAlign="center">
            <Button
              variant="contained"
              color="secondary"
              onClick={handleDownload}
              style={{ backgroundColor: "#9C27B0" }}
            >
              DOWNLOAD PDF
            </Button>
          </Box>
        </Box>
      )}
    </div>
  );
};

export default ImageToPDF;
