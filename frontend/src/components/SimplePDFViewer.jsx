import React, { useState } from "react";
import axios from "axios";

// ✅ 1️⃣ Moved OUTSIDE main component
const CompletionModal = ({
  loading,
  userFeedback,
  setUserFeedback,
  onCancel,
  onConfirm,
}) => {
  const CheckIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2
          5.291A7.962 7.962 0 014 12H0
          c0 3.042 1.135 5.824 3
          7.938l3-2.647z"
      ></path>
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckIcon />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Mark Book as Completed?
          </h3>
          <p className="text-gray-600 mb-4">
            Are you sure you have finished reading this book? This will update
            your progress and learning statistics.
          </p>

          {/* Optional Feedback */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 text-left mb-2">
              Optional Feedback (What did you learn?)
            </label>
            <textarea
              value={userFeedback}
              onChange={(e) => setUserFeedback(e.target.value)}
              placeholder="Share what you learned from this book..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700
                         font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50
                         transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white
                         font-medium rounded-lg hover:bg-green-700 disabled:opacity-50
                         transition-colors duration-200"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Marking...</span>
                </>
              ) : (
                <>
                  <CheckIcon />
                  <span className="ml-2">Yes, Mark Completed</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ 2️⃣ Main Component (Unchanged Layout)
const SimplePDFViewer = ({ fileUrl, bookId, onBookCompleted }) => {
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userFeedback, setUserFeedback] = useState("");

  // Icons
  const OpenInNewIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2
           2 0 002 2h10a2 2 0 002-2v-4M14
           4h6m0 0v6m0-6L10 14" />
    </svg>
  );

  const DownloadIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 10v6m0 0l-3-3m3 3l3-3m2
           8H7a2 2 0 01-2-2V5a2 2 0
           012-2h5.586a1 1 0
           01.707.293l5.414
           5.414a1 1 0
           01.293.707V19a2
           2 0 01-2 2z" />
    </svg>
  );

  const DocumentIcon = () => (
    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12h6m-6 4h6m2
           5H7a2 2 0 01-2-2V5a2
           2 0 012-2h5.586a1 1 0
           01.707.293l5.414
           5.414a1 1 0
           01.293.707V19a2
           2 0 01-2 2z" />
    </svg>
  );

  const CheckIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M5 13l4 4L19 7" />
    </svg>
  );

  const CloudIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 15a4 4 0 004 4h9a5
           5 0 10-.1-9.999 5.002
           5.002 0 10-9.78
           2.096A4.001 4.001
           0 003 15z" />
    </svg>
  );

  const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373
           0 0 5.373 0 12h4zm2
           5.291A7.962 7.962 0
           014 12H0c0 3.042
           1.135 5.824 3
           7.938l3-2.647z"></path>
    </svg>
  );

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "document.pdf";
    link.target = "_blank";
    link.click();
  };

  const handleMarkCompleted = async () => {
    if (!bookId) {
      alert("Book ID is required to mark as completed");
      return;
    }

    setLoading(true);
    try {
      console.log("📚 Marking book as completed:", {
        bookId,
        userFeedback,
        fullURL: `http://localhost:5001/api/books/${bookId}/complete`,
      });

      const response = await axios.patch(
        `http://localhost:5001/api/books/${bookId}/complete`,
        { feedback: userFeedback }
      );

      console.log("✅ Book completion response:", response.data);

      setShowCompletionModal(false);
      setUserFeedback("");

      if (onBookCompleted) onBookCompleted(response.data.book);

      alert("🎉 Book marked as completed! Your progress has been updated.");
    } catch (error) {
      console.error("❌ Failed to mark book as completed:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        bookId,
      });
      alert("Failed to mark book as completed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!fileUrl) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <DocumentIcon />
        <h3 className="text-lg font-medium text-gray-900 mt-4">No PDF selected</h3>
        <p className="text-gray-500 mt-1">Please select a PDF to view</p>
      </div>
    );
  }

  const isCloudinaryUrl = fileUrl.includes("cloudinary.com");
  const isLocalUrl = fileUrl.includes("localhost:5001/uploads");

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 ">
        {/* Header */}
        <div className="sm:flex justify-between items-center mb-4">
          <div>
            <h2 className="sm:text-xl text-sm font-semibold text-gray-900 ml-2">PDF Viewer</h2>
            <p className="text-gray-600 sm:text-sm text-xs mt-1 ml-2">
              {isCloudinaryUrl ? (
                <span className="inline-flex items-center">
                  <CloudIcon className="w-4 h-4 mr-1" />
                  Served via Cloudinary CDN
                </span>
              ) : (
                "Using your browser's built-in PDF viewer"
              )}
            </p>
          </div>
          <div className="sm:flex sm:gap-2 gap-6">
            {isCloudinaryUrl && (
              <span className="inline-flex items-center mt-1 sm:mt-0 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CloudIcon className="w-3 h-3 mr-1" />
                Cloudinary
              </span>
            )}
            {bookId && (
              <button
                onClick={() => setShowCompletionModal(true)}
                className="inline-flex items-center px-4 py-2 mt-2 sm:mt-0 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <CheckIcon />
                <span className="ml-2 ">Mark Completed</span>
              </button>
            )}
            <button
              onClick={() => window.open(fileUrl, "_blank")}
              className="inline-flex items-center px-4 py-2 mt-2 sm:mt-0 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <OpenInNewIcon />
              <span className="ml-2 ">Open in New Tab</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 mt-2 sm:mt-0 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <DownloadIcon />
              <span className="ml-2 ">Download</span>
            </button>
          </div>
        </div>

        {/* PDF */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <iframe
            src={fileUrl}
            width="100%"
            height="600px"
            title="PDF Viewer"
            className="border-0"
            loading="lazy"
          />
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>📄 PDF Document</span>
            <span>•</span>
            {isCloudinaryUrl ? (
              <span className="inline-flex items-center">
                <CloudIcon className="w-3 h-3 mr-1" />
                Cloud Delivery
              </span>
            ) : (
              <span>🔍 Search enabled</span>
            )}
            <span>•</span>
            <span>🖨️ Print ready</span>
          </div>
          <button
            onClick={() => window.open(fileUrl, "_blank")}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            Open in full window →
          </button>
        </div>
        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3 b mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21
                     12a9 9 0 11-18 0 9 9 0 0118
                     0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                {isCloudinaryUrl ? "Cloudinary PDF Delivery" : "Best PDF Experience"}
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                {isCloudinaryUrl ? (
                  <p>Your PDF is being delivered via Cloudinary's global CDN for faster loading.</p>
                ) : (
                  <p>Your browser's PDF viewer provides the best experience:</p>
                )}
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {isCloudinaryUrl ? (
                    <>
                      <li>Fast global content delivery</li>
                      <li>Automatic optimization</li>
                      <li>Secure cloud storage</li>
                      <li>Reliable access from anywhere</li>
                    </>
                  ) : (
                    <>
                      <li>Text search and selection</li>
                      <li>Zoom controls</li>
                      <li>Print functionality</li>
                      <li>Full-screen mode</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Fixed Modal */}
      {showCompletionModal && (
        <CompletionModal
          loading={loading}
          userFeedback={userFeedback}
          setUserFeedback={setUserFeedback}
          onCancel={() => {
            setShowCompletionModal(false);
            setUserFeedback("");
          }}
          onConfirm={handleMarkCompleted}
        />
      )}
    </>
  );
};

export default SimplePDFViewer;
