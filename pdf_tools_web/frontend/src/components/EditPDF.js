import React, { useState } from "react";
import { Button, Typography, Select, MenuItem, TextField, Card, CardContent } from "@mui/material";
import axios from "../services/api";

const EditPDF = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [rotation, setRotation] = useState(0);
  const [image, setImage] = useState(null);
  const [filter, setFilter] = useState("none");

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleImageChange = (e) => setImage(e.target.files[0]);

  const handleApplyEdits = async () => {
    if (!file) return alert("Please upload a PDF file!");

    const formData = new FormData();
    formData.append("file", file);
    if (text) formData.append("text", text);
    formData.append("rotation", rotation);
    if (image) formData.append("image", image);
    formData.append("filter", filter);

    try {
      const response = await axios.post("/edit-pdf", formData, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "edited.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error editing PDF:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <Card sx={{ maxWidth: 600, margin: "20px auto", padding: "20px" }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Advanced PDF Editor
        </Typography>
        
        {/* Upload PDF */}
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        
        {/* Add Text */}
        <TextField
          label="Add Text"
          fullWidth
          margin="normal"
          variant="outlined"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        
        {/* Rotation */}
        <Typography>Rotation:</Typography>
        <Select value={rotation} fullWidth onChange={(e) => setRotation(e.target.value)}>
          <MenuItem value={0}>0°</MenuItem>
          <MenuItem value={90}>90°</MenuItem>
          <MenuItem value={180}>180°</MenuItem>
          <MenuItem value={270}>270°</MenuItem>
        </Select>

        {/* Filters */}
        <Typography>Apply Filters:</Typography>
        <Select value={filter} fullWidth onChange={(e) => setFilter(e.target.value)}>
          <MenuItem value="none">None</MenuItem>
          <MenuItem value="grayscale">Grayscale</MenuItem>
          <MenuItem value="sepia">Sepia</MenuItem>
          <MenuItem value="invert">Invert</MenuItem>
        </Select>

        {/* Insert Image */}
        <Typography>Insert Image:</Typography>
        <input type="file" accept="image/*" onChange={handleImageChange} />

        {/* Submit Button */}
        <Button variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }} onClick={handleApplyEdits}>
          Apply Edits
        </Button>
      </CardContent>
    </Card>
  );
};

export default EditPDF;
