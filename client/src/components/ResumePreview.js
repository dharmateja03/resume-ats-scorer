import React, { useState, useEffect } from 'react';
import './ResumePreview.css';

const ResumePreview = ({ file }) => {
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!file) {
      setPreview('');
      setLoading(false);
      return;
    }

    setLoading(true);

    // For PDF files, create an object URL to display in an iframe
    if (file.type === 'application/pdf') {
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
      setLoading(false);
      
      // Clean up object URL when component unmounts
      return () => URL.revokeObjectURL(fileUrl);
    }
    
    // For Word documents, we can't directly preview them
    // We'd need to convert them server-side or use a specialized library
    // For now, just show the filename
    if (file.type === 'application/msword' || 
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setPreview('');
      setLoading(false);
    }
  }, [file]);

  if (loading) {
    return <div className="resume-preview-loading">Loading preview...</div>;
  }

  return (
    <div className="resume-preview">
      <h3>Resume Preview</h3>
      
      {file && file.type === 'application/pdf' ? (
        <iframe 
          src={preview} 
          title="Resume Preview" 
          width="100%" 
          height="500px"
          className="pdf-preview"
        />
      ) : (
        <div className="file-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <p>{file ? file.name : 'No file selected'}</p>
          <p className="preview-note">
            {file && (file.type === 'application/msword' || 
                     file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') 
              ? 'Preview not available for Word documents' 
              : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default ResumePreview;