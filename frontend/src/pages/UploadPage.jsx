import React, { useState, useRef } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import './UploadPage.css';

const UploadPage = () => {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef(null);

    // Optional metadata fields
    const [metadata, setMetadata] = useState({
        propertyAddress: '',
        landlordName: '',
        startDate: '',
        monthlyRent: '',
    });

    // Validate file type and size
    const validateFile = (file) => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['application/pdf'];

        if (!allowedTypes.includes(file.type)) {
            return 'Only PDF files are allowed';
        }

        if (file.size > maxSize) {
            return 'File size must be less than 10MB';
        }

        return null;
    };

    // Handle file selection
    const handleFileSelect = (selectedFile) => {
        setError('');
        setUploadSuccess(false);

        const validationError = validateFile(selectedFile);
        if (validationError) {
            setError(validationError);
            return;
        }

        setFile(selectedFile);
    };

    // Handle drag events
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    };

    // Handle file input change
    const handleInputChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            handleFileSelect(selectedFile);
        }
    };

    // Handle upload
    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);
        setError('');

        try {
            // Simulate upload progress (will be replaced with real S3 upload)
            for (let i = 0; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 200));
                setUploadProgress(i);
            }

            // TODO: Implement real S3 upload
            // const result = await uploadToS3(file, metadata);

            setUploadSuccess(true);
            setFile(null);
            setMetadata({
                propertyAddress: '',
                landlordName: '',
                startDate: '',
                monthlyRent: '',
            });
        } catch (err) {
            setError(err.message || 'Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    // Reset form
    const handleReset = () => {
        setFile(null);
        setError('');
        setUploadSuccess(false);
        setUploadProgress(0);
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="upload-page">
            <div className="upload-container">
                {/* Header */}
                <div className="upload-header animate-fadeIn">
                    <h1>Upload Contract</h1>
                    <p>Upload your rental contract PDF for AI analysis</p>
                </div>

                {/* Success Message */}
                {uploadSuccess && (
                    <Card variant="glass" padding="md" className="success-card animate-slideUp">
                        <div className="success-content">
                            <span className="success-icon">✅</span>
                            <div>
                                <h3>Upload Successful!</h3>
                                <p>Your contract has been uploaded and will be analyzed shortly.</p>
                            </div>
                        </div>
                        <Button variant="primary" onClick={handleReset}>
                            Upload Another
                        </Button>
                    </Card>
                )}

                {/* Upload Area */}
                {!uploadSuccess && (
                    <div className="upload-content">
                        {/* Drop Zone */}
                        <Card
                            variant="glass"
                            padding="lg"
                            className={`drop-zone animate-slideUp ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            {!file ? (
                                <div className="drop-content">
                                    <div className="drop-icon">📄</div>
                                    <h3>Drop your PDF here</h3>
                                    <p>or click to browse</p>
                                    <Button
                                        variant="secondary"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Browse Files
                                    </Button>
                                    <p className="drop-hint">Maximum file size: 10MB | PDF only</p>
                                </div>
                            ) : (
                                <div className="file-preview">
                                    <div className="file-icon">📄</div>
                                    <div className="file-info">
                                        <h4>{file.name}</h4>
                                        <p>{formatFileSize(file.size)}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setFile(null)}
                                        disabled={isUploading}
                                    >
                                        ✕
                                    </Button>
                                </div>
                            )}

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                onChange={handleInputChange}
                                style={{ display: 'none' }}
                            />

                            {/* Upload Progress */}
                            {isUploading && (
                                <div className="upload-progress">
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                    <p>{uploadProgress}% Uploading...</p>
                                </div>
                            )}
                        </Card>

                        {/* Error Message */}
                        {error && (
                            <div className="error-message animate-slideUp">
                                {error}
                            </div>
                        )}

                        {/* Metadata Section (Optional) */}
                        {file && !isUploading && (
                            <Card variant="elevated" padding="lg" className="metadata-card animate-slideUp">
                                <h3>Contract Details (Optional)</h3>
                                <p className="metadata-hint">Add details to help organize your contracts</p>

                                <div className="metadata-grid">
                                    <Input
                                        label="Property Address"
                                        placeholder="123 Main St, City"
                                        value={metadata.propertyAddress}
                                        onChange={(e) => setMetadata({ ...metadata, propertyAddress: e.target.value })}
                                    />
                                    <Input
                                        label="Landlord Name"
                                        placeholder="John Doe"
                                        value={metadata.landlordName}
                                        onChange={(e) => setMetadata({ ...metadata, landlordName: e.target.value })}
                                    />
                                    <Input
                                        type="date"
                                        label="Lease Start Date"
                                        value={metadata.startDate}
                                        onChange={(e) => setMetadata({ ...metadata, startDate: e.target.value })}
                                    />
                                    <Input
                                        type="number"
                                        label="Monthly Rent ($)"
                                        placeholder="1500"
                                        value={metadata.monthlyRent}
                                        onChange={(e) => setMetadata({ ...metadata, monthlyRent: e.target.value })}
                                    />
                                </div>
                            </Card>
                        )}

                        {/* Upload Button */}
                        {file && !isUploading && (
                            <Button
                                variant="primary"
                                size="lg"
                                fullWidth
                                onClick={handleUpload}
                                className="upload-button animate-slideUp"
                            >
                                Upload Contract
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadPage;
