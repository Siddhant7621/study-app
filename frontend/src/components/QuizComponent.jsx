import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { server } from "../main";

const QuizComponent = ({ bookId }) => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [generatingNewQuiz, setGeneratingNewQuiz] = useState(false);

  // Remove auto-generation on mount, only generate when button is clicked
  // useEffect(() => {
  //   if (bookId) {
  //     generateQuiz();
  //   }
  // }, [bookId]);

  const generateQuiz = async () => {
    setLoading(true);
    // setGeneratingNewQuiz(false);
    try {
      const response = await axios.post(
        `${server}/quiz/generate/${bookId}`
      );
      setQuiz(response.data);
      setUserAnswers(new Array(response.data.questions.length).fill(""));
      setCurrentQuestion(0);
      setSubmitted(false);
      setResults(null);
      toast.success("Quiz generated successfully!");
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      toast.error("Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateAnotherQuiz = async () => {
    setGeneratingNewQuiz(true);
    try {
      await generateQuiz();
    } finally {
      setGeneratingNewQuiz(false);
    }
  };

  const handleAnswerChange = (value) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = value;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (userAnswers.some((answer) => !answer)) {
      if (!confirm("You have unanswered questions. Submit anyway?")) {
        return;
      }
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${server}/quiz/submit/${quiz._id}`,
        {
          answers: userAnswers,
        }
      );
      setResults(response.data);
      setSubmitted(true);
      toast.success(
        `Quiz submitted! Score: ${response.data.score.toFixed(1)}%`
      );
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // SVG Icons
  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-6 w-6 text-blue-600"
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

  // Show Generate Quiz button if no quiz is loaded
  if (!quiz && !loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <div className="text-4xl mb-4">🧠</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Ready to Test Your Knowledge?
        </h3>
        <p className="text-gray-600 mb-6">
          Generate a quiz based on your book content
        </p>
        <button
          onClick={generateQuiz}
          disabled={loading}
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? (
            <>
              <LoadingSpinner />
              <span className="ml-2">Generating...</span>
            </>
          ) : (
            <>
              <span className="mr-2">Generate Quiz</span>
              <RefreshIcon />
            </>
          )}
        </button>
      </div>
    );
  }

  if (loading && !quiz) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Generating Quiz...
        </h3>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
        </div>
        <p className="text-gray-600 text-center mt-2">
          Creating personalized questions for you...
        </p>
      </div>
    );
  }

  if (submitted && results) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">
          Quiz Completed! 🎉
        </h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="text-center">
            <p className="text-lg font-semibold text-blue-800">
              Score: {results.correctAnswers} / {results.totalQuestions} (
              {results.score.toFixed(1)}%)
            </p>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${results.score}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* AI Analysis Section - Add this if you have AI analysis */}
        {results.analysis && (
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
              <span className="text-xl mr-2">🤖</span>
              AI Learning Analysis
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h5 className="font-semibold text-green-700 mb-2">
                  ✅ Strengths
                </h5>
                <ul className="text-sm text-green-600 space-y-1">
                  {results.analysis.strengths?.map((strength, index) => (
                    <li key={index}>• {strength}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 border border-yellow-200">
                <h5 className="font-semibold text-yellow-700 mb-2">
                  💡 Areas to Improve
                </h5>
                <ul className="text-sm text-yellow-600 space-y-1">
                  {results.analysis.weaknesses?.map((weakness, index) => (
                    <li key={index}>• {weakness}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 bg-white rounded-lg p-4 border border-blue-200">
              <h5 className="font-semibold text-blue-700 mb-2">
                🎯 Recommendations
              </h5>
              <ul className="text-sm text-blue-600 space-y-1">
                {results.analysis.recommendations?.map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          {results.results.map((result, index) => (
            <div
              key={index}
              className={`border-2 rounded-lg p-4 ${
                result.isCorrect
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
              }`}
            >
              <h4 className="font-semibold text-gray-900 mb-2">
                Q{index + 1}: {result.question}
              </h4>
              <p
                className={`mb-1 ${
                  result.isCorrect ? "text-green-700" : "text-red-700"
                }`}
              >
                <strong>Your answer:</strong>{" "}
                {result.userAnswer || "Not answered"}
              </p>
              <p className="text-green-700 mb-2">
                <strong>Correct answer:</strong> {result.correctAnswer}
              </p>
              <p className="text-gray-600 text-sm italic">
                <strong>Explanation:</strong> {result.explanation}
              </p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={generateAnotherQuiz}
            disabled={generatingNewQuiz}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            {generatingNewQuiz ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Generating...</span>
              </>
            ) : (
              <>
                <RefreshIcon />
                <span className="ml-2">Generate Another Quiz</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setQuiz(null);
              setResults(null);
              setSubmitted(false);
              toast("Returned to quiz menu");
            }}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium rounded-lg transition-colors duration-200"
          >
            <span>Back to Quiz Menu</span>
          </button>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const progressPercentage =
    ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header with Generate New Quiz button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Quiz Time! 🧠</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
          <button
            onClick={generateAnotherQuiz}
            disabled={generatingNewQuiz}
            className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
            title="Generate new quiz"
          >
            <RefreshIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {currentQ.question}
        </h3>

        {/* Multiple Choice Questions */}
        {currentQ.type === "mcq" && (
          <div className="space-y-3">
            {currentQ.options.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
              const isSelected = userAnswers[currentQuestion] === optionLetter;

              return (
                <label
                  key={index}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={optionLetter}
                    checked={isSelected}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="hidden"
                  />
                  <div
                    className={`flex-shrink-0 w-5 h-5 border-2 rounded-full mr-3 flex items-center justify-center ${
                      isSelected ? "border-blue-500" : "border-gray-400"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-900">
                    <span className="font-medium">{optionLetter}.</span>{" "}
                    {option}
                  </span>
                </label>
              );
            })}
          </div>
        )}

        {/* Short Answer Questions */}
        {currentQ.type === "saq" && (
          <textarea
            value={userAnswers[currentQuestion] || ""}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your short answer here..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors duration-200"
          />
        )}

        {/* Long Answer Questions */}
        {currentQ.type === "laq" && (
          <textarea
            value={userAnswers[currentQuestion] || ""}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your detailed answer here..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors duration-200"
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <PreviousIcon />
          <span className="ml-1">Previous</span>
        </button>

        {currentQuestion === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Submitting...</span>
              </>
            ) : (
              "Submit Quiz"
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <span className="mr-1">Next</span>
            <NextIcon />
          </button>
        )}
      </div>

      {/* Question Progress Dots */}
      <div className="flex justify-center space-x-2 mt-6">
        {quiz.questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestion(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-200 ${
              index === currentQuestion
                ? "bg-blue-600"
                : userAnswers[index]
                ? "bg-green-500"
                : "bg-gray-300"
            }`}
            title={`Question ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default QuizComponent;
