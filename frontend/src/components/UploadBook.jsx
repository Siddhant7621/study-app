import React, { useState } from 'react';
import axios from 'axios';

const UploadBook = ({ onBookSelect, books }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [bookTitle, setBookTitle] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf')) {
      alert('Please select a PDF file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setBookTitle(file.name.replace('.pdf', ''));
    setUploadDialogOpen(true);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('title', bookTitle);

    // Get authentication token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
      alert('Please log in to upload books');
      return;
    }

    console.log('Starting upload...', {
      file: selectedFile.name,
      title: bookTitle,
      hasToken: !!token
    });

    setUploading(true);
    setUploadProgress(0);
    setUploadDialogOpen(false);

    try {
      const response = await axios.post('http://localhost:5001/api/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(progress);
          }
        },
        timeout: 30000 // 30 second timeout
      });

      console.log('Upload response:', response.data);

      if (response.data.success) {
        console.log('Upload successful:', response.data.book);
        alert('Book uploaded successfully!');
        window.location.reload();
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      
      // Detailed error handling
      if (error.response) {
        // Server responded with error status
        console.error('Server error:', error.response.status, error.response.data);
        alert(`Upload failed: ${error.response.data.error || 'Server error'}`);
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response:', error.request);
        alert('Upload failed: No response from server. Please check if the server is running.');
      } else {
        // Something else happened
        console.error('Error:', error.message);
        alert(`Upload failed: ${error.message}`);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setSelectedFile(null);
      setBookTitle('');
    }
  };

  const handleCancelUpload = () => {
    setUploadDialogOpen(false);
    setSelectedFile(null);
    setBookTitle('');
  };

  // SVG Icons
  const CloudUploadIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );

  const DescriptionIcon = () => (
    <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Upload or Choose a Book
      </h2>

      {/* Upload Section */}
      <div className="mb-6">
        <input
          accept=".pdf"
          className="hidden"
          id="pdf-upload"
          type="file"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        <label htmlFor="pdf-upload" className="cursor-pointer">
          <div
            className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <CloudUploadIcon />
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </div>
        </label>

        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      {uploadDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Book</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book Title
              </label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Enter book title"
                autoFocus
              />
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Selected file: <span className="font-medium">{selectedFile?.name}</span>
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelUpload}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">Uploading...</span>
                  </>
                ) : (
                  'Upload'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Books List */}
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Available Books ({books.length})
      </h3>
      <div className="space-y-3">
        {books.map((book) => (
          <div
            key={book._id}
            onClick={() => onBookSelect(book)}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 group"
          >
            <DescriptionIcon />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                {book.title}
              </h4>
              <p className="text-sm text-gray-500">
                Uploaded: {new Date(book.uploadDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
        
        {books.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <DescriptionIcon />
            <p className="mt-2">No books available. Upload your first book to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadBook;