import React, { useState, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";

// Import Heroicons
import {
  BookOpenIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  PlayCircleIcon,
  ChartBarIcon,
  DocumentArrowUpIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

import UploadBook from "./components/UploadBook";
import SimplePDFViewer from "./components/SimplePDFViewer";
import QuizComponent from "./components/QuizComponent";
import BookChat from "./components/BookChat";
import VideoRecommendations from "./components/VideoRecommendations";
import ProgressDashboard from "./components/ProgressDashboard";
import Login from "./components/Login";

function TabPanel({ children, value, index }) {
  return (
    <div className={`${value === index ? "block" : "hidden"}`}>{children}</div>
  );
}

function App() {
  const [currentBook, setCurrentBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    fetchBooks();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        // Verify token is still valid
        const response = await axios.get("http://localhost:5001/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data.user);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        toast.success(`Welcome back, ${response.data.user.name}!`);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Clear invalid tokens
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
      toast.error("Session expired. Please login again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/books");
      setBooks(response.data);
    } catch (error) {
      console.error("Failed to fetch books:", error);
      toast.error("Failed to load books. Please try again.");
    }
  };

  const handleBookSelect = (book) => {
    setCurrentBook(book);
    setActiveTab(1); // Switch to read tab
    toast.success(`Now reading: ${book.title}`);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${localStorage.getItem("token")}`;
    setShowLogin(false);
    fetchBooks(); // Refresh books for the logged-in user
    toast.success(`Welcome to Study Assistant, ${userData.name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setCurrentBook(null);
    setBooks([]);
    setShowUserMenu(false);
    delete axios.defaults.headers.common["Authorization"];
    toast.success("Logged out successfully!");
  };

  // Tab styling function
  const getTabClass = (tabIndex) => {
    const baseClasses =
      "flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200";
    if (activeTab === tabIndex) {
      return `${baseClasses} border-blue-500 text-blue-600 bg-blue-50`;
    }
    return `${baseClasses} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpenIcon className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading Study Assistant...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10B981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#EF4444",
                secondary: "#fff",
              },
            },
          }}
        />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-8">
            {/* Welcome Section */}
            <div className="text-center">
              <BookOpenIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Study Assistant
              </h1>
              <p className="text-gray-600 text-lg">
                Your AI-powered learning companion
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <QuestionMarkCircleIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-700">Smart Quizzes</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-700">AI Chat</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <PlayCircleIcon className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-gray-700">Video Lessons</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <ChartBarIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-700">Progress Tracking</p>
              </div>
            </div>

            {/* Get Started Button */}
            <button
              onClick={() => setShowLogin(true)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium text-lg shadow-md"
            >
              Get Started
            </button>

            {/* Login Modal */}
            <Login
              isOpen={showLogin}
              onClose={() => setShowLogin(false)}
              onLogin={handleLogin}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />

      {/* User Menu Modal for Mobile */}
      {showUserMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 md:hidden">
          <div className="bg-white rounded-lg shadow-xl max-w-xs w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <UserCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {user.name}
              </h3>
              <p className="text-gray-600 mb-4">{user.email}</p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
        {/* Header with User Info */}
        <header className="bg-white shadow-sm border-b border-gray-200 ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <BookOpenIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Study Assistant
                  </h1>
                  <p className="text-sm text-gray-500">
                    Welcome back, {user.name}
                  </p>
                </div>
              </div>

              {/* User Menu - Desktop (unchanged) & Mobile (new button) */}
              <div className="sm:flex items-center sm:space-x-4 space-x-1">
                {/* Desktop View - Full user info and logout */}
                <div className="hidden sm:flex items-center space-x-2 text-gray-700">
                  <UserCircleIcon className="h-6 w-6" />
                  <span className="font-medium">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span>Logout</span>
                </button>

                {/* Mobile View - User icon button that opens modal */}
                <button
                  onClick={() => setShowUserMenu(true)}
                  className="sm:hidden flex items-center justify-center p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
                >
                  <UserCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {!currentBook ? (
            <div className="space-y-8">
              <UploadBook onBookSelect={handleBookSelect} books={books} />
              <ProgressDashboard />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Book Info Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="sm:text-2xl text-lg font-semibold text-gray-900">
                      {currentBook.title}
                    </h2>
                    <p className="text-gray-600 mt-1 sm:text-sm text-xs">
                      Currently studying:{" "}
                      <span className="font-medium">
                        {currentBook.originalName}
                      </span>
                    </p>
                  </div>
                  {/* <div className="text-sm text-gray-500">
                    Uploaded by: <span className="font-medium">{user.name}</span>
                  </div> */}
                </div>
              </div>

              {/* Navigation Tabs - Made responsive */}
              <div className="border-b border-gray-200">
                <nav
                  className="flex space-x-1 px-6 overflow-x-auto"
                  aria-label="Tabs"
                >
                  <button
                    onClick={() => setActiveTab(0)}
                    className={`${getTabClass(0)} whitespace-nowrap`}
                  >
                    <BookOpenIcon className="w-5 h-5 mr-2" />
                    Read
                  </button>
                  <button
                    onClick={() => setActiveTab(1)}
                    className={`${getTabClass(1)} whitespace-nowrap`}
                  >
                    <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                    Quiz
                  </button>
                  <button
                    onClick={() => setActiveTab(2)}
                    className={`${getTabClass(2)} whitespace-nowrap`}
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                    Chat
                  </button>
                  <button
                    onClick={() => setActiveTab(3)}
                    className={`${getTabClass(3)} whitespace-nowrap`}
                  >
                    <PlayCircleIcon className="w-5 h-5 mr-2" />
                    Videos
                  </button>
                  <button
                    onClick={() => setActiveTab(4)}
                    className={`${getTabClass(4)} whitespace-nowrap`}
                  >
                    <ChartBarIcon className="w-5 h-5 mr-2" />
                    Progress
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="min-h-[600px]">
                <TabPanel value={activeTab} index={0}>
                  <SimplePDFViewer
                    fileUrl={currentBook.fileUrl}
                    bookId={currentBook._id}
                    onBookCompleted={(book) => {
                      console.log("Book completed:", book);
                      toast.success("Book marked as completed!");
                    }}
                  />
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                  <QuizComponent bookId={currentBook._id} />
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                  <BookChat bookId={currentBook._id} />
                </TabPanel>

                <TabPanel value={activeTab} index={3}>
                  <VideoRecommendations topic={currentBook.title} />
                </TabPanel>

                <TabPanel value={activeTab} index={4}>
                  <ProgressDashboard />
                </TabPanel>
              </div>

              {/* Back to Library Button */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setCurrentBook(null);
                    toast.success("Returned to library");
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <DocumentArrowUpIcon className="w-4 h-4 mr-2" />
                  Back to Library
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default App;
