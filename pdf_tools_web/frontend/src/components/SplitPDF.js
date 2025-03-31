import React, { useState } from "react";
import { Button, TextField, Typography, Alert, Radio, FormControl, FormControlLabel, RadioGroup } from "@mui/material";
import axios from "../services/api";
import { v4 as uuidv4 } from "uuid";
import { Link } from "react-router-dom";

const SplitPDF = () => {
  const [file, setFile] = useState(null);
  const [splitPreviewUrl, setSplitPreviewUrl] = useState(null);
  const [splitFileName, setSplitFileName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [splitMode, setSplitMode] = useState("range"); // Default: Range Mode
  const [pages, setPages] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setSplitPreviewUrl(null);
      setSuccessMessage("");
      setPages(""); // Reset input
    }
  };

  const handleSplit = async () => {
    if (!file) return alert("❌ Please select a PDF file.");
    if (!pages.trim()) return alert("❌ Enter pages based on selected mode.");
  
    // ✅ Validate input based on split mode
    const rangePattern = /^\d+-\d+$/;  // Matches "1-3"
    const specificPattern = /^\d+(,\d+)*$/;  // Matches "1,3,4,5"
  
    if (splitMode === "range" && !rangePattern.test(pages)) {
      return alert("❌ Invalid format! Use range format like '1-3'.");
    }
    if (splitMode === "specific" && !specificPattern.test(pages)) {
      return alert("❌ Invalid format! Use comma-separated values like '1,3,5'.");
    }
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("pages", pages);
    formData.append("mode", splitMode); // Pass the selected mode to backend
  
    try {
      const response = await axios.post("/split-pdf/", formData, { responseType: "blob" });
  
      // ✅ Extract filename from Content-Disposition
      const contentDisposition = response.headers["content-disposition"];
      let fileName = "split";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+?)"/);
        if (match) fileName = match[1];
      }
  
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      setSplitPreviewUrl(url);
      setSplitFileName(fileName);
      setSuccessMessage(`✅ PDF split successfully! Preview and download: ${fileName}`);
  
    } catch (error) {
      console.error("Error splitting PDF:", error);
      setSuccessMessage("❌ Something went wrong. Please try again.");
    }
  };
  

  const handleDownload = () => {
    if (!splitPreviewUrl) return;
    const uniqueId = uuidv4().split("-")[0];
    const link = document.createElement("a");
    link.href = splitPreviewUrl;
    link.setAttribute("download", `${splitFileName}_${uniqueId}.pdf`); // Unique filename
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div style={{ textDecoration: "none" }}>
      {/* Home Button */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <Button variant="contained" color="secondary" style={{ marginBottom: "10px" }}>
          Home
        </Button>
      </Link>

      <Typography variant="h4">Split PDF</Typography>

      <input type="file" accept="application/pdf" onChange={handleFileChange} />

      {/* Split Mode Selection */}
      <FormControl component="fieldset" style={{ marginTop: "15px" }}>
        <Typography variant="h6">Select Split Mode</Typography>
        <RadioGroup row value={splitMode} onChange={(e) => setSplitMode(e.target.value)}>
          <FormControlLabel value="range" control={<Radio />} label="Range (e.g., 1-3)" />
          <FormControlLabel value="specific" control={<Radio />} label="Specific Pages (e.g., 1,5)" />
        </RadioGroup>
      </FormControl>

      {/* Page Selection Input */}
      <TextField
        label={splitMode === "range" ? "Enter Page Range (e.g., 1-3)" : "Enter Specific Pages (e.g., 1,5)"}
        variant="outlined"
        margin="normal"
        value={pages}
        onChange={(e) => setPages(e.target.value)}
        sx={{ width: "250px" }} // Fixed width for cleaner UI
      />

      <Button variant="contained" color="primary" onClick={handleSplit} style={{ marginTop: "10px" }}>
        Split PDF
      </Button>

      {successMessage && (
        <Alert severity={successMessage.includes("✅") ? "success" : "error"} style={{ marginTop: "10px" }}>
          {successMessage}
        </Alert>
      )}

      {/* Split PDF Preview */}
      {splitPreviewUrl && (
        <div style={{ marginTop: "20px" }}>
          <Typography variant="h6">Split PDF Preview</Typography>
          <iframe
            src={splitPreviewUrl}
            width="100%"
            height="500px"
            style={{ border: "1px solid #ccc", marginTop: "10px" }}
            title="Split PDF Preview"
          />
          <Button variant="contained" color="secondary" onClick={handleDownload} style={{ marginTop: "10px" }}>
            Download Split PDF
          </Button>
        </div>
      )}
    </div>
  );
};

export default SplitPDF;
