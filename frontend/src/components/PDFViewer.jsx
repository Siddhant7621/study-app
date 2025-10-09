import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Use CDN for PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const PDFViewer = ({ fileUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("📄 PDFViewer fileUrl:", fileUrl);

  useEffect(() => {
    setNumPages(null);
    setPageNumber(1);
    setError(null);
    setLoading(true);
  }, [fileUrl]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    console.log("✅ PDF loaded successfully, pages:", numPages);
    setNumPages(numPages);
    setError(null);
    setLoading(false);
  };

  const onDocumentLoadError = (error) => {
    console.error("PDF load error:", error);
    setError(`PDF loading failed: ${error.message}`);
    setLoading(false);
  };

  const reloadPDF = () => {
    setError(null);
    setLoading(true);
  };

  const openInNewTab = () => {
    window.open(fileUrl, "_blank");
  };

  const goToPreviousPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.5));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  // SVG Icons for Tailwind
  const PreviousIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );

  const NextIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );

  const ZoomOutIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 12H4"
      />
    </svg>
  );

  const ZoomInIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );

  const RefreshIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );

  const OpenInNewIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );

  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-5 w-5 text-blue-600"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  if (!fileUrl) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900">No PDF selected</h3>
        <p className="text-gray-500 mt-1">Please select a PDF to view</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousPage}
            disabled={pageNumber <= 1 || loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <PreviousIcon />
            <span className="ml-1">Previous</span>
          </button>

          <span className="text-sm font-medium text-gray-700 px-3 py-2">
            Page {pageNumber} of {numPages || "--"}
          </span>

          <button
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 1) || loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <span className="mr-1">Next</span>
            <NextIcon />
          </button>

          {loading && <LoadingSpinner />}
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="Zoom Out"
          >
            <ZoomOutIcon />
          </button>
          <span className="text-sm text-gray-600 px-2">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 2.5}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="Zoom In"
          >
            <ZoomInIcon />
          </button>
          <button
            onClick={reloadPDF}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200"
            title="Reload PDF"
          >
            <RefreshIcon />
          </button>
          <button
            onClick={openInNewTab}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200"
            title="Open in new tab"
          >
            <OpenInNewIcon />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Error loading PDF
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={reloadPDF}
              className="ml-4 text-sm font-medium text-red-800 hover:text-red-900 transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* PDF Document */}
      <div className="overflow-auto max-h-[70vh] border border-gray-200 rounded-md flex justify-center items-center min-h-[500px] bg-gray-50">
        {loading && !error && (
          <div className="text-center p-8">
            <LoadingSpinner />
            <p className="text-sm text-gray-600 mt-3">
              Loading PDF document...
            </p>
          </div>
        )}

        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          error={null}
        >
          {!loading && !error && numPages && (
            <Page
              pageNumber={pageNumber}
              scale={scale}
              loading={
                <div className="text-center p-8">
                  <LoadingSpinner />
                  <p className="text-sm text-gray-600 mt-3">
                    Loading page {pageNumber}...
                  </p>
                </div>
              }
            />
          )}
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;
