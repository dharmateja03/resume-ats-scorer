import React, { useRef } from 'react';
import './FileUpload.css';

const FileUpload = ({ onFileUpload }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || 
          selectedFile.type === 'application/msword' ||
          selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        onFileUpload(selectedFile);
      } else {
        alert('Please upload a PDF or Word document (.pdf, .doc, .docx)');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type === 'application/pdf' || 
          droppedFile.type === 'application/msword' ||
          droppedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        onFileUpload(droppedFile);
      } else {
        alert('Please upload a PDF or Word document (.pdf, .doc, .docx)');
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div 
      className="file-upload"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx"
        className="file-input"
      />
      <div className="upload-content">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p>Drag & drop your resume or</p>
        <button className="upload-button" onClick={handleButtonClick}>
          Choose File
        </button>
        <p className="file-hint">Supports PDF, DOC, DOCX</p>
      </div>
    </div>
  );
};

export default FileUpload;