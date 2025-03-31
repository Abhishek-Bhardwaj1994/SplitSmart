import React, { useState } from "react";
import { Button, Typography, Alert } from "@mui/material";
import axios from "../services/api";
import { v4 as uuidv4 } from "uuid";
import { Link } from "react-router-dom";

const MergePDF = () => {
  const [files, setFiles] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mergedFileName, setMergedFileName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleFileChange = (e) => {
    setFiles(e.target.files);
    setPreviewUrl(null);
    setSuccessMessage("");
  };

  const handleMerge = async () => {
    if (!files || files.length < 2) {
      return alert("Please select at least two PDF files!");
    }

    const formData = new FormData();
    for (let file of files) {
      formData.append("files", file);
    }

    try {
      const response = await axios.post("/merge-pdf/", formData, { responseType: "blob" });

      // ✅ Extract filename from Content-Disposition
      const contentDisposition = response.headers["content-disposition"];
      let fileName = "merged";
      if (contentDisposition) { 
        const match = contentDisposition.match(/filename="(.+?)"/);
        if (match) fileName = match[1];
      }

      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      setPreviewUrl(url);
      setMergedFileName(fileName);
      setSuccessMessage(`✅ Files merged successfully! Download: ${fileName}`);

    } catch (error) {
      console.error("Error merging PDF:", error);
      setSuccessMessage("❌ Something went wrong. Please try again.");
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const uniqueId = uuidv4().split("-")[0]
    const link = document.createElement("a");
    link.href = previewUrl;
    link.setAttribute("download", `${mergedFileName}_${uniqueId}.pdf`); // Use the extracted filename
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>
      {/* Home Button at the Top */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <Button variant="contained" color="secondary" style={{ marginBottom: "10px" }}>
          Home
        </Button>
      </Link>

      <Typography variant="h4">Merge PDFs</Typography>
      <input type="file" multiple accept="application/pdf" onChange={handleFileChange} />

      <Button variant="contained" color="primary" onClick={handleMerge} style={{ marginTop: "10px" }}>
        Merge PDFs
      </Button>

      {successMessage && (
        <Alert severity={successMessage.includes("successfully") ? "success" : "error"} style={{ marginTop: "10px" }}>
          {successMessage}
        </Alert>
      )}

      {previewUrl && (
        <div style={{ marginTop: "20px" }}>
          <Typography variant="h6">Merged PDF Preview</Typography>
          <iframe
            src={previewUrl}
            width="100%"
            height="500px"
            style={{ border: "1px solid #ccc", marginTop: "10px" }}
            title="Merged PDF Preview"
          />
          <Button variant="contained" color="secondary" onClick={handleDownload} style={{ marginTop: "10px" }}>
            Download Merged PDF
          </Button>
        </div>
      )}
    </div>
  );
};


export default MergePDF;
