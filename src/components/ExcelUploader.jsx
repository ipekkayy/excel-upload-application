import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { Modal, Button } from "react-bootstrap";

export default function ExcelUploader() {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem("excelData");
    return savedData ? JSON.parse(savedData) : [];
  });
  const [newData, setNewData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fileKey, setFileKey] = useState(Date.now());
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("excelData", JSON.stringify(data));
  }, [data]);

  const requiredColumns = ["Ürün Adı", "Fiyat", "Adet", "Stok"];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (parsedData.length === 0) {
          setErrorMessage("Excel dosyası boş.");
          setFileKey(Date.now());
          return;
        }

        const fileColumns = parsedData[0];

        if (JSON.stringify(fileColumns) !== JSON.stringify(requiredColumns)) {
          setErrorMessage("Excel dosyasındaki kolon sıralaması hatalı.");
          setFileKey(Date.now());
          return;
        }

        const formattedData = XLSX.utils.sheet_to_json(sheet);

        if (formattedData.length > 0 && !formattedData[0].hasOwnProperty("Ürün Adı")) {
          setErrorMessage("Excel dosyasında Ürün Adı kolonu bulunmamaktadır.");
          setFileKey(Date.now());
          return;
        }

        const existingProductNames = new Set(data.map((item) => item["Ürün Adı"]));
        const newProductNames = new Set();
        let hasDuplicate = false;

        for (let item of formattedData) {
          if (existingProductNames.has(item["Ürün Adı"]) || newProductNames.has(item["Ürün Adı"])) {
            hasDuplicate = true;
            break;
          }
          newProductNames.add(item["Ürün Adı"]);
        }

        if (hasDuplicate) {
          setErrorMessage("Aynı ürün adı bulunan bir Excel dosyası yüklenemez.");
          setFileKey(Date.now());
        } else {
          setNewData(formattedData);
          setShowModal(true);
          setErrorMessage("");
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleConfirm = () => {
    setData((prevData) => [...prevData, ...newData]);
    setShowModal(false);
    setFileKey(Date.now());
  };

  const handleCancel = () => {
    setNewData([]);
    setShowModal(false);
    setFileKey(Date.now());
  };

  const handleDelete = (index) => {
    const updatedData = data.filter((_, i) => i !== index);
    setData(updatedData);
  };

  return (
    <div className="container mt-5">
      
      <div className="card p-4 shadow">
        <input
          key={fileKey}
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="form-control mb-3"
          ref={fileInputRef}
        />
        <button className="btn btn-primary w-100" onClick={() => fileInputRef.current.click()}>Excel'den Yükle</button>
        <div className="fw-bold mt-2 ">Yükleyeceğiniz excel dosyası Ürün Adı, Fiyat, Adet, Stok şeklinde olmalı ! </div>
        {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
      </div>

      <Modal show={showModal} onHide={handleCancel}>
        <Modal.Header closeButton>
          <Modal.Title>Önizleme</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                {newData.length > 0 && Object.keys(newData[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {newData.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>İptal</Button>
          <Button variant="primary" onClick={handleConfirm}>Onayla</Button>
        </Modal.Footer>
      </Modal>

      {data.length > 0 ? (
        <div className="card mt-4 p-4 shadow">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                  <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(index)}>Sil</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center mt-4 bg-danger text-white p-2 rounded">Henüz dosya yüklenmedi.</p>
      )}
    </div>
  );
}
