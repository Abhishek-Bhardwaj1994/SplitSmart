import React, { useState } from "react";
import { Button, Typography } from "@mui/material";
import axios from "../services/api";

const ImageToPDF = () => {
  const [files, setFiles] = useState(null);

  const handleFileChange = (e) => setFiles(e.target.files);

  const handleConvert = async () => {
    if (!files) return alert("Please upload images!");

    const formData = new FormData();
    for (let file of files) {
      formData.append("images", file);
    }

    try {
      const response = await axios.post("/image-to-pdf", formData, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "converted.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error converting images to PDF:", error);
    }
  };

  return (
    <div>
      <Typography variant="h4">Convert Images to PDF</Typography>
      <input type="file" multiple accept="image/png, image/jpeg, image/heif" onChange={handleFileChange} />
      <Button variant="contained" color="primary" onClick={handleConvert}>
        Convert to PDF
      </Button>
    </div>
  );
};

export default ImageToPDF;
