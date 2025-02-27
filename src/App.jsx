import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import ExcelUploader from "./components/ExcelUploader";

function RedirectToUpload() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/upload", { replace: true });
  }, []);

  return null;
}

function App() {
  return (
    <Router>
      <div className="container main-container mt-5">
        <h1 className="text-center mb-4 text-white">Excel Yükleme Uygulaması</h1>
        
        <Routes>
          <Route path="/" element={<RedirectToUpload />} />
          <Route path="/upload" element={<ExcelUploader />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
