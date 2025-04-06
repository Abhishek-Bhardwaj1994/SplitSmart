import React, { useState, useRef } from 'react';
import api from '../services/api';
import {
  Button,
  Typography,
  Box,
  Stack,
  CircularProgress,
} from "@mui/material";

const EditPDF = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      const formData = new FormData();
      formData.append("file", file);
      setLoading(true);
      try {
        const res = await api.post("/edit-pdf/", formData);
        setSessionId(res.data.session_id);
        setPdfFile(URL.createObjectURL(file));
      } catch (error) {
        alert("Upload failed");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const handleEdit = async (endpoint, payload) => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await api.post(`/edit-pdf/${endpoint}/`, {
        session_id: sessionId,
        ...payload,
      }, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      setPdfFile(url);
    } catch (err) {
      alert("Edit failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await api.post(`/edit-pdf/download/`, { session_id: sessionId }, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "final_edited.pdf";
      a.click();
    } catch (err) {
      alert("Download failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box textAlign="center" mt={5}>
      <Typography variant="h4" gutterBottom>
        Edit Your PDF
      </Typography>
      {!pdfFile && (
        <>
          <Button variant="contained" onClick={() => fileInputRef.current.click()}>
            Upload PDF
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="application/pdf"
            onChange={handleUpload}
          />
        </>
      )}
      {pdfFile && (
        <Box>
          <iframe src={pdfFile} width="100%" height="600px" title="PDF Preview" />
          <Stack direction="row" spacing={2} mt={2} justifyContent="center">
            <Button variant="outlined" onClick={() => handleEdit("crop", { crop_params: { "0": [20, 20, 20, 20] } })}>Crop</Button>
            <Button variant="outlined" onClick={() => handleEdit("rotate", { rotation_data: { "0": 90 } })}>Rotate</Button>
            <Button variant="outlined" onClick={() => handleEdit("delete", { pages_to_delete: [1] })}>Delete Page</Button>
            <Button variant="outlined" onClick={() => handleEdit("reorder", { new_order: [1, 0] })}>Reorder</Button>
            <Button variant="outlined" onClick={() => handleEdit("add-text", { text_items: [{ page: 0, position: [100, 100], text: "Hello!" }] })}>Add Text</Button>
            <Button variant="outlined" onClick={() => handleEdit("draw", { draw_data: { page: 0, shapes: [{ type: "rect", x: 100, y: 100, width: 50, height: 50 }] } })}>Draw</Button>
            <Button variant="outlined" onClick={() => handleEdit("add-image", { image_path: "/logo.png", position_data: { page: 0, x: 50, y: 50 } })}>Add Image</Button>
            <Button variant="contained" color="success" onClick={handleDownload}>
              Download Final PDF
            </Button>
          </Stack>
        </Box>
      )}
      {loading && <CircularProgress sx={{ mt: 2 }} />}
    </Box>
  );
};

export default EditPDF;
