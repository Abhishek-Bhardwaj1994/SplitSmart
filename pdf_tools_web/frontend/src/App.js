import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MergePDF from "./components/MergePDF";
import SplitPDF from "./components/SplitPDF";
import ConvertPDF from "./components/ConvertPDF";
import EditPDF from "./components/EditPDF";
import ImageToPDF from "./components/ImageToPDF";
import PDFToImage from "./components/PDFToImage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/merge-pdf" element={<MergePDF />} />
        <Route path="/split-pdf" element={<SplitPDF />} />
        <Route path="/convert-pdf" element={<ConvertPDF />} />
        <Route path="/pdf-to-word" element={<ConvertPDF />} />
        <Route path="/word-to-pdf" element={<ConvertPDF />} />
        <Route path="/edit-pdf" element={<EditPDF />} />
        <Route path="/image-pdf" element={<ImageToPDF />} />
        <Route path="/pdf-image" element={<PDFToImage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;