import React, { useState, useRef } from 'react';
import { Portfolio } from '../types/portfolio';
import { portfolioApi } from '../services/api';

interface ResumeUploadProps {
  onUploadSuccess: (portfolio: Portfolio) => void;
  onClose: () => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadSuccess, onClose }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFileSecurely = (file: File): { isValid: boolean; error?: string } => {
    // 1. Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Please upload a PDF, DOCX, DOC, or TXT file.' };
    }

    // 2. Validate file size (10MB limit, matching backend)
    if (file.size > 10 * 1024 * 1024) {
      return { isValid: false, error: 'File size must be less than 10MB.' };
    }

    // 3. Validate minimum file size
    if (file.size < 100) {
      return { isValid: false, error: 'File appears to be empty or corrupted.' };
    }

    // 4. Validate file extension matches MIME type
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      return { isValid: false, error: 'File extension not allowed. Use .pdf, .docx, .doc, or .txt files.' };
    }

    // 5. Check for suspicious file names
    const suspiciousPatterns = [
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.scr$/i,
      /\.com$/i,
      /\.pif$/i,
      /\.js$/i,
      /\.vbs$/i,
      /\.ps1$/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(file.name)) {
        return { isValid: false, error: 'File type not allowed for security reasons.' };
      }
    }

    // 6. Check for double extensions (e.g., resume.pdf.exe)
    const extensionCount = (file.name.match(/\./g) || []).length;
    if (extensionCount > 1) {
      return { isValid: false, error: 'Files with multiple extensions are not allowed for security reasons.' };
    }

    // 7. Validate MIME type matches extension
    const mimeExtensionMap: { [key: string]: string[] } = {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    };

    const expectedExtensions = mimeExtensionMap[file.type];
    if (expectedExtensions && !expectedExtensions.includes(fileExtension)) {
      return { isValid: false, error: 'File type and extension do not match. This may indicate a security risk.' };
    }

    return { isValid: true };
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // 🔒 Frontend security validation
    const validation = validateFileSecurely(file);
    if (!validation.isValid) {
      setError(validation.error || 'File validation failed.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      const result = await portfolioApi.uploadResume(file);
      onUploadSuccess(result.portfolio);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="upload-modal-overlay">
      <div className="upload-modal">
        <div className="upload-header">
          <h2>Upload Your Resume</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="upload-content">
          <div 
            className={`upload-dropzone ${dragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon">📄</div>
            <p className="upload-text">
              {uploading ? 'Processing your resume...' : 'Drop your resume here or click to browse'}
            </p>
            <p className="upload-subtext">
              Supports PDF, DOCX, DOC, and TXT files (max 5MB)
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </div>
          
          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <p>Parsing your resume and updating portfolio...</p>
            </div>
          )}
          
          {error && (
            <div className="upload-error">
              <p>❌ {error}</p>
            </div>
          )}
          
          <div className="upload-info">
            <h3>What happens when you upload?</h3>
            <ul>
              <li>✅ Your resume is parsed automatically</li>
              <li>✅ Personal information is extracted</li>
              <li>✅ Work experience and education are organized</li>
              <li>✅ Skills are categorized</li>
              <li>✅ Your portfolio is instantly updated</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
