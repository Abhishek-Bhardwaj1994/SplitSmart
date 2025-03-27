import React, { useState } from "react";
import { Button, Typography } from "@mui/material";
import axios from "../services/api";

const SplitPDF = () => {
  const [file, setFile] = useState(null);
  const [pageNumbers, setPageNumbers] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSplit = async () => {
    if (!file || !pageNumbers) return alert("Please upload a file and enter pages to split!");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pages", pageNumbers);

    try {
      const response = await axios.post("/split", formData, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "split_pages.zip");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error splitting PDF:", error);
    }
  };

  return (
    <div>
      <Typography variant="h4">Split PDF</Typography>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <input
        type="text"
        placeholder="Enter pages (e.g., 1-3,5)"
        value={pageNumbers}
        onChange={(e) => setPageNumbers(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleSplit}>
        Split PDF
      </Button>
    </div>
  );
};

export default SplitPDF;
