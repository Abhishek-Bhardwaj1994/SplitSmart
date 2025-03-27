import React, { useState } from "react";
import { Button, Typography } from "@mui/material";
import axios from "../services/api";

const MergePDF = () => {
  const [files, setFiles] = useState(null);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleMerge = async () => {
    if (!files) return alert("Please select PDF files!");

    const formData = new FormData();
    for (let file of files) {
      formData.append("files", file);
    }

    try {
      const response = await axios.post("/merge", formData, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "merged.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error merging PDF:", error);
    }
  };

  return (
    <div>
      <Typography variant="h4">Merge PDFs</Typography>
      <input type="file" multiple accept="application/pdf" onChange={handleFileChange} />
      <Button variant="contained" color="primary" onClick={handleMerge}>
        Merge PDFs
      </Button>
    </div>
  );
};

export default MergePDF;
