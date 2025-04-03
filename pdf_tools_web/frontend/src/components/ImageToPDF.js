import React, { useState } from "react";
import { Button, Typography, Alert, FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import axios from "../services/api";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const ImageToPDF = () => {
  const [files, setFiles] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageFormat, setImageFormat] = useState("jpg"); // Default format: JPG/JPEG
  const [successMessage, setSuccessMessage] = useState("");
  const [mergedFileName, setMergedFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles.length) return;

    const allowedExtensions = {
      jpg: ["jpg", "jpeg"], // ✅ JPG & JPEG handled together
      png: ["png"],
      heif: ["heif"],
      heic: ["heic"],
      jfif: ["jfif"],
    };

    for (let file of selectedFiles) {
      const fileExtension = file.name.split(".").pop().toLowerCase(); // Get file extension
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
    setFiles(null); // Clear files on format change
    setPreviewUrl(null);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const [isConverting, setIsConverting] = useState(false); // ✅ Track conversion state

const handleConvert = async () => {
    if (!files) {
        setErrorMessage("❌ Please upload images before converting.");
        return;
    }

    setIsConverting(true); // ✅ Set loading state

    const formData = new FormData();
    for (let file of files) {
        formData.append("files", file);
    }

    try {
        const response = await axios.post("/heif-jpg-image-to-pdf/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            responseType: "blob",  // ✅ Correctly handle binary file response
        });

        // ✅ Create a downloadable blob URL
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);

        // ✅ Extract filename from headers
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
        setIsConverting(false); // ✅ Reset loading state
    }
};



  const handleDownload = () => {
    if (!previewUrl) return;
    const uniqueId = uuidv4().split("-")[0]
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
        <Button variant="contained" color="secondary" style={{ marginBottom: "10px" }}>
          Home
        </Button>
      </Link>

      <Typography variant="h4">Convert {imageFormat.toUpperCase()} Images to PDF</Typography>

      {/* Select Image Format */}
      <FormControl component="fieldset" style={{ marginTop: "15px" }}>
        <Typography variant="h6">Select Image Format</Typography>
        <RadioGroup row value={imageFormat} onChange={handleFormatChange}>
          <FormControlLabel value="jpg" control={<Radio />} label="JPG / JPEG" /> {/* ✅ Merged JPG & JPEG */}
          <FormControlLabel value="png" control={<Radio />} label="PNG" />
          <FormControlLabel value="heif" control={<Radio />} label="HEIF" />
          <FormControlLabel value="heic" control={<Radio />} label="HEIC" />
          <FormControlLabel value="jfif" control={<Radio />} label="JFIF" />
        </RadioGroup>
      </FormControl>

      <input
        type="file"
        multiple
        accept={`image/${imageFormat}`}
        onChange={handleFileChange}
        style={{ marginTop: "10px" }}
      />

<Button 
  variant="contained" 
  color="primary" 
  onClick={handleConvert} 
  style={{ marginTop: "10px" }} 
  disabled={isConverting} // ✅ Disable button while converting
>
  {isConverting ? "Converting..." : "Convert to PDF"} {/* ✅ Change button text */}
</Button>

      {errorMessage && <Alert severity="error" style={{ marginTop: "10px" }}>{errorMessage}</Alert>}
      {successMessage && <Alert severity="success" style={{ marginTop: "10px" }}>{successMessage}</Alert>}

      {/* Preview & Download */}
      {previewUrl && (
    <div style={{ marginTop: "20px" }}>
        <Typography variant="h6">Converted PDF Preview</Typography>
        <object 
            data={previewUrl} 
            type="application/pdf" 
            width="100%" 
            height="500px"
            style={{ border: "1px solid #ccc", marginTop: "10px" }}
        >
            <p>Preview not supported. <a href={previewUrl} download>Download PDF</a></p>
        </object>

        <Button variant="contained" color="secondary" onClick={handleDownload} style={{ marginTop: "10px" }}>
            Download PDF
        </Button>
    </div>
)}

    </div>
  );
}
;

export default ImageToPDF;
