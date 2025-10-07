import Quiz from "../models/Quiz.js";
import Progress from "../models/Progress.js";
import aiService from "./aiService.js";

export class QuizService {
  constructor() {
    this.pendingRequests = new Map(); // Track pending requests by bookId
  }

  async generateQuiz(bookId, bookText) {
  // Check if there's already a pending request for this book
  if (this.pendingRequests.has(bookId)) {
    console.log("📞 Returning pending quiz request for book:", bookId);
    return this.pendingRequests.get(bookId);
  }

  try {
    console.log("🎯 Starting quiz generation for book:", bookId);

    const prompt = this.buildQuizPrompt(bookText);

    // Create the promise and store it
    const quizPromise = (async () => {
      try {
        console.log("🤖 Sending to OpenRouter...");
        const response = await aiService.generateContent(prompt);
        
        if (!response) {
          throw new Error('AI service returned no response');
        }
        
        const quizData = this.parseQuizResponse(response);

        const quiz = new Quiz({
          bookId,
          questions: quizData.questions,
        });

        await quiz.save();
        console.log("✅ Quiz saved successfully with AI-generated questions");
        return quiz;
      } catch (aiError) {
        console.log("❌ AI service failed:", aiError.message);
        // Throw the actual error with clear message
        throw new Error(`AI service error: ${aiError.message}`);
      }
    })();

    // Store the promise
    this.pendingRequests.set(bookId, quizPromise);

    // Always clean up the pending request
    try {
      const result = await quizPromise;
      return result;
    } finally {
      this.pendingRequests.delete(bookId);
    }
  } catch (error) {
    console.error("Quiz generation error:", error.message);
    this.pendingRequests.delete(bookId); // Clean up on error
    // Re-throw the error to be handled by the route
    throw error;
  }
}

  buildQuizPrompt(text) {
    const limitedText = text.substring(0, 3000);

    return `
      Create a comprehensive quiz based on the following textbook content. Generate:
      - 3 Multiple Choice Questions (MCQs) with 4 options each
      - 2 Short Answer Questions (SAQs)
      - 1 Long Answer Question (LAQ)

      For each question, provide:
      - Clear question text
      - For MCQs: 4 options labeled A, B, C, D
      - Correct answer
      - Detailed explanation

      Textbook Content:
      ${limitedText}

      Return ONLY valid JSON in this exact format:
      {
        "questions": [
          {
            "type": "mcq",
            "question": "Question text?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "A",
            "explanation": "Detailed explanation..."
          }
        ]
      }

      Important: Return ONLY the JSON, no additional text or markdown.
    `;
  }

  parseQuizResponse(response) {
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim();

      // Extract JSON from response
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("No JSON found in AI response");
    } catch (error) {
      console.error("Failed to parse quiz response:", error);
      console.log("Raw response:", response.substring(0, 200) + "...");
      throw new Error("AI returned invalid format. Please try again.");
    }
  }

  async evaluateQuiz(quizId, userAnswers, userId) {
    try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw new Error("Quiz not found");
      }

      let score = 0;
      let correctMCQs = 0;
      let totalMCQs = 0;
      const results = [];

      quiz.questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        let isCorrect = false;

        if (question.type === "mcq") {
          totalMCQs++;
          isCorrect = userAnswer === question.correctAnswer;
          if (isCorrect) correctMCQs++;
        } else {
          isCorrect = userAnswer && userAnswer.trim().length > 0;
        }

        if (isCorrect) score++;

        results.push({
          question: question.question,
          userAnswer,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          isCorrect,
          type: question.type,
        });
      });

      const finalScore = (score / quiz.questions.length) * 100;

      quiz.score = finalScore;
      quiz.completedAt = new Date();
      await quiz.save();

      // Analyze strengths and weaknesses using AI
      let analysis;
      try {
        analysis = await this.analyzePerformance(
          quiz.questions,
          userAnswers,
          finalScore
        );
      } catch (analysisError) {
        console.error("AI analysis failed:", analysisError);
        // Use basic analysis if AI fails
        analysis = this.getBasicAnalysis(questions, userAnswers, finalScore);
      }

      await this.updateProgress(
        quiz.bookId,
        finalScore,
        userId,
        correctMCQs,
        totalMCQs,
        analysis
      );

      return {
        score: finalScore,
        results,
        totalQuestions: quiz.questions.length,
        correctAnswers: score,
        analysis: analysis,
      };
    } catch (error) {
      console.error("Quiz evaluation error:", error);
      throw new Error("Failed to evaluate quiz");
    }
  }

  async updateProgress(bookId, score, userId, correctMCQs, totalMCQs, analysis) {
    try {
      let progress = await Progress.findOne({ bookId, userId });
      
      if (!progress) {
        progress = new Progress({ bookId, userId });
      }

      progress.totalQuizzes += 1;
      progress.totalScore += score;
      progress.averageScore = progress.totalScore / progress.totalQuizzes;
      progress.correctMCQs += correctMCQs;
      progress.totalMCQs += totalMCQs;
      progress.lastActivity = new Date();

      // Store AI analysis
      progress.strengths = analysis.strengths;
      progress.weaknesses = analysis.weaknesses;
      progress.recommendations = analysis.recommendations;
      progress.lastAnalysis = new Date();

      await progress.save();
    } catch (error) {
      console.error('Progress update error:', error);
    }
  }

  async analyzePerformance(questions, userAnswers, score) {
    try {
      // Prepare data for AI analysis
      const quizData = questions.map((question, index) => ({
        question: question.question,
        type: question.type,
        correctAnswer: question.correctAnswer,
        userAnswer: userAnswers[index],
        isCorrect:
          question.type === "mcq"
            ? userAnswers[index] === question.correctAnswer
            : userAnswers[index] && userAnswers[index].trim().length > 0,
        explanation: question.explanation,
      }));

      const prompt = `
      Analyze this quiz performance and provide insights about the student's strengths and weaknesses.

      QUIZ PERFORMANCE DATA:
      ${JSON.stringify(quizData, null, 2)}

      OVERALL SCORE: ${score}%

      Please analyze and return ONLY valid JSON in this exact format:
      {
        "strengths": [
          "Specific strength area 1",
          "Specific strength area 2"
        ],
        "weaknesses": [
          "Specific weakness area 1 with explanation",
          "Specific weakness area 2 with explanation"
        ],
        "recommendations": [
          "Specific study recommendation 1",
          "Specific study recommendation 2"
        ],
        "keyInsights": [
          "Key insight about learning patterns",
          "Another key insight"
        ]
      }

      Guidelines:
      - Be specific and actionable
      - Base analysis on the actual questions and answers
      - Focus on conceptual understanding
      - Provide practical study recommendations
      - Keep it educational and encouraging
    `;

      const analysisResponse = await aiService.generateContent(prompt);
      return JSON.parse(analysisResponse);
    } catch (error) {
      console.error("AI analysis failed:", error);
      throw new Error("AI analysis service unavailable");
    }
  }

  getBasicAnalysis(questions, userAnswers, score) {
    // Basic analysis without AI
    const incorrectMCQs = questions.filter(
      (question, index) =>
        question.type === "mcq" && userAnswers[index] !== question.correctAnswer
    );

    const weakAreas = [];
    if (incorrectMCQs.length > 0) {
      weakAreas.push("Multiple Choice Questions");
    }

    const unansweredQuestions = userAnswers.filter(answer => !answer || answer.trim() === '').length;
    if (unansweredQuestions > 0) {
      weakAreas.push("Question completion");
    }

    return {
      strengths:
        score >= 70
          ? ["Good conceptual understanding"]
          : score >= 50
          ? ["Basic understanding of concepts"]
          : ["Willingness to learn and improve"],
      weaknesses:
        weakAreas.length > 0 ? weakAreas : ["No major weaknesses identified"],
      recommendations: [
        "Review incorrect answers carefully",
        "Practice more questions to improve accuracy",
        "Focus on understanding the explanations"
      ],
      keyInsights: [
        `Scored ${score}% on this quiz`,
        incorrectMCQs.length > 0 ? `Missed ${incorrectMCQs.length} multiple choice questions` : "All multiple choice questions correct",
        unansweredQuestions > 0 ? `${unansweredQuestions} questions were not answered` : "All questions were attempted"
      ],
    };
  }
}