// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import MergePDF from "./components/MergePDF";
import SplitPDF from "./components/SplitPDF";
import ConvertPDF from "./components/ConvertPDF";
import ImageToPDF from "./components/ImageToPDF";
import PDFToImage from "./components/PDFToImage";
import Home from "./pages/Home";
import Login from "./pages/Login";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/merge" element={<MergePDF />} />
        <Route path="/split" element={<SplitPDF />} />
        <Route path="/convert" element={<ConvertPDF />} />
        <Route path="/image-to-pdf" element={<ImageToPDF />} />
        <Route path="/pdf-to-image" element={<PDFToImage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;

