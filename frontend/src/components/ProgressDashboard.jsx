import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { server } from '../main';

const ProgressDashboard = () => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedBook, setExpandedBook] = useState(null);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(`${server}/api/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Fetched progress data:', response.data);
      
      setProgressData(response.data);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const markBookAsCompleted = async (bookId) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.patch(`${server}/api/books/${bookId}/complete`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchProgressData(); // Refresh data
    } catch (error) {
      console.error('Failed to mark book as completed:', error);
    }
  };

  // SVG Icons
  const BookIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );

  const CheckIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const QuizIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const LoadingSpinner = () => (
    <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <LoadingSpinner />
        <p className="text-gray-600 mt-2">Loading your progress...</p>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <p className="text-gray-600">Failed to load progress data.</p>
      </div>
    );
  }

  const { userStats, quizPerformance, learningInsights, detailedProgress } = progressData;
  console.log('detailedProgress:', detailedProgress);
  

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Books Uploaded */}
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <BookIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{userStats.totalUploadedBooks}</p>
            <p className="text-sm text-blue-600">Books Uploaded</p>
          </div>

          {/* Books Completed */}
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <CheckIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{userStats.totalCompletedBooks}</p>
            <p className="text-sm text-green-600">Books Completed</p>
          </div>

          {/* Quizzes Taken */}
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <QuizIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{quizPerformance.totalQuizzes}</p>
            <p className="text-sm text-purple-600">Quizzes Taken</p>
          </div>

          {/* MCQ Accuracy */}
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="w-8 h-8 text-orange-600 mx-auto mb-2 font-bold text-lg">
              {quizPerformance.correctMCQsPercentage}%
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {quizPerformance.correctMCQs}/{quizPerformance.totalMCQsAttempted}
            </p>
            <p className="text-sm text-orange-600">MCQ Accuracy</p>
          </div>
        </div>
      </div>

      {/* AI-Powered Insights Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          📊 AI Learning Analysis
        </h3>
        
        {learningInsights.strengths.length === 0 && learningInsights.weaknesses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-3">🤖</div>
            <p>Complete some quizzes to get AI-powered insights about your learning!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Strengths */}
            {learningInsights.strengths.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-semibold text-green-800 mb-2 flex items-center">
                  <span className="text-lg mr-2">✅</span>
                  Your Strengths
                </h5>
                <ul className="space-y-1">
                  {learningInsights.strengths.map((strength, index) => (
                    <li key={index} className="text-green-700 text-sm">
                      • {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas to Improve */}
            {learningInsights.weaknesses.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h5 className="font-semibold text-yellow-800 mb-2 flex items-center">
                  <span className="text-lg mr-2">💡</span>
                  Areas to Improve
                </h5>
                <ul className="space-y-1">
                  {learningInsights.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-yellow-700 text-sm">
                      • {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {learningInsights.recommendations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <span className="text-lg mr-2">🎯</span>
                  Study Recommendations
                </h5>
                <ul className="space-y-1">
                  {learningInsights.recommendations.map((rec, index) => (
                    <li key={index} className="text-blue-700 text-sm">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detailed Book Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Detailed Book Progress</h3>
        
        {detailedProgress.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No quiz progress yet. Take some quizzes to see your progress!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {detailedProgress.map((bookProgress) => {
              const isCompleted = userStats.completedBooks.some(
                book => book.id === bookProgress.bookId
              );
              
              return (
                <div
                  key={bookProgress.bookId}
                  className={`border rounded-lg p-4 transition-all duration-200 ${
                    isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 mr-2">
                      <BookIcon className={`w-5 h-5 ${
                        isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <h4 className="font-semibold sm:text-lg text-sm text-gray-900">{bookProgress.bookTitle}</h4>
                        <p className="sm:text-sm text-xs text-gray-500">
                          {bookProgress.totalQuizzes} quizzes taken • {bookProgress.averageScore}% average score
                        </p>
                      </div>
                    </div>

                    <div className="sm:flex items-center space-x-3">
                      {/* MCQ Progress */}
                      {bookProgress.mcqStats.total > 0 && (
                        <div className="sm:text-sm text-xs text-gray-600">
                          <span className="font-medium">
                            {bookProgress.mcqStats.correct}/{bookProgress.mcqStats.total}
                          </span> MCQs correct
                        </div>
                      )}

                      {/* Complete Checkbox */}
                      <button
                        onClick={() => markBookAsCompleted(bookProgress.bookId)}
                        className={`flex sm:mt-0 mt-2   items-center space-x-2 sm:px-3 px-1 py-1 rounded-md sm:text-sm text-xs font-medium transition-colors ${
                          isCompleted
                            ? 'bg-green-100 text-green-800 border border-green-200 '
                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 '
                        }`}
                      >
                        <CheckIcon className="sm:w-4 sm:h-4 w-2 h-2 " />
                        <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar for MCQ Accuracy */}
                  {bookProgress.mcqStats.total > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>MCQ Performance</span>
                        <span>{bookProgress.mcqStats.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            bookProgress.mcqStats.percentage >= 80 ? 'bg-green-500' :
                            bookProgress.mcqStats.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${bookProgress.mcqStats.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Book-specific insights */}
                  {(bookProgress.strengths.length > 0 || bookProgress.weaknesses.length > 0) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedBook(expandedBook === bookProgress.bookId ? null : bookProgress.bookId)}
                      >
                        <h5 className="font-medium text-gray-700">Book Insights</h5>
                        <div className="text-gray-400">
                          {expandedBook === bookProgress.bookId ? '▼' : '▶'}
                        </div>
                      </div>

                      {expandedBook === bookProgress.bookId && (
                        <div className="mt-2 space-y-2 animate-fadeIn">
                          {bookProgress.strengths.length > 0 && (
                            <div className="text-sm text-green-600">
                              <span className="font-medium">Strengths: </span>
                              {bookProgress.strengths.join(', ')}
                            </div>
                          )}
                          {bookProgress.weaknesses.length > 0 && (
                            <div className="text-sm text-yellow-600">
                              <span className="font-medium">Areas to improve: </span>
                              {bookProgress.weaknesses.join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Simple Graph - MCQ Performance */}
      {/* {detailedProgress.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">MCQ Performance by Book</h3>
          <div className="flex items-end justify-between h-32 space-x-2">
            {detailedProgress.map((bookProgress, index) => (
              <div key={bookProgress.bookId} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full max-w-16 transition-all duration-500 ${
                    bookProgress.mcqStats.percentage >= 80 ? 'bg-green-500' :
                    bookProgress.mcqStats.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  } rounded-t`}
                  style={{ height: `${bookProgress.mcqStats.percentage || 5}%` }}
                ></div>
                <p className="text-xs text-gray-500 mt-2 text-center truncate w-full">
                  {bookProgress.bookTitle.split(' ')[0]}
                </p>
                <p className="text-xs font-medium text-gray-700">{bookProgress.mcqStats.percentage}%</p>
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ProgressDashboard;