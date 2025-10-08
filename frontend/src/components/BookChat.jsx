import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const BookChat = ({ bookId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`http://localhost:5001/api/chat/${bookId}`, {
        question: input
      });

      const botMessage = { text: response.data.answer, isUser: false };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat failed:', error);
      const errorMessage = { text: 'Sorry, I encountered an error. Please try again.', isUser: false };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // SVG Icons
  const SendIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );

  const PersonIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const RobotIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  );

  const LoadingSpinner = () => (
    <svg className="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <RobotIcon />
          Chat with Your Book
        </h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                message.isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-green-600 text-white'
                }`}
              >
                {message.isUser ? <PersonIcon /> : <RobotIcon />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[70%] rounded-lg px-4 py-3 ${
                  message.isUser
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.text}
                </p>
              </div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                <RobotIcon />
              </div>
              <div className="bg-gray-100 text-gray-900 rounded-lg rounded-bl-none border border-gray-200 px-4 py-3 max-w-[70%]">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <LoadingSpinner />
                  Thinking...
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your book..."
            disabled={loading}
            rows={1}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            style={{
              minHeight: '42px',
              maxHeight: '120px'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <SendIcon />
            <span className="ml-2">Send</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default BookChat;