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
            throw new Error("AI service returned no response");
          }

          console.log("📝 Raw AI response received, length:", response.length);
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
          // No fallback - throw clear error message
          throw new Error(
            `AI service is currently unavailable. Please try again later. Error: ${aiError.message}`
          );
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
IMPORTANT: You MUST return ONLY valid JSON format. Do not include any other text, explanations, or markdown.

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

CRITICAL: Return ONLY the JSON object, no additional text, no markdown formatting, no thinking process.
    `;
  }

  parseQuizResponse(response) {
    try {
      console.log("🔧 Parsing AI response...");
      console.log(response);
      

      // More robust cleaning
      let cleanedResponse = response
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .replace(/^JSON:\s*/i, "")
        .trim();

      // Remove any thinking process or text before/after JSON
      const jsonStartIndex = cleanedResponse.indexOf("{");
      const jsonEndIndex = cleanedResponse.lastIndexOf("}") + 1;

      if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        cleanedResponse = cleanedResponse.substring(
          jsonStartIndex,
          jsonEndIndex
        );
      } else {
        throw new Error("No valid JSON structure found in AI response");
      }

      console.log(
        "Cleaned response sample:",
        cleanedResponse.substring(0, 200) + "..."
      );

      const quizData = JSON.parse(cleanedResponse);

      // Validate the structure
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error("Invalid quiz structure: missing questions array");
      }

      console.log(`✅ Parsed ${quizData.questions.length} questions`);
      return quizData;
    } catch (error) {
      console.error("❌ Failed to parse quiz response:", error.message);
      console.log("Raw response length:", response.length);
      console.log("Raw response sample:", response.substring(0, 500) + "...");
      throw new Error(
        `AI returned invalid format. Please try again. Error: ${error.message}`
      );
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

    // Analyze strengths and weaknesses using AI - with fallback
    let analysis;
    try {
      console.log("🤖 Starting AI analysis...");
      analysis = await this.analyzePerformance(
        quiz.questions,
        userAnswers,
        finalScore
      );
      console.log("✅ AI analysis completed successfully");
    } catch (analysisError) {
      console.error("AI analysis failed, using basic analysis:", analysisError);
      analysis = this.getBasicAnalysis(quiz.questions, userAnswers, finalScore);
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

  async updateProgress(
    bookId,
    score,
    userId,
    correctMCQs,
    totalMCQs,
    analysis
  ) {
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
      console.error("Progress update error:", error);
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
CRITICAL: You MUST return ONLY valid JSON format. Do not include any thinking process, explanations, or markdown.

Analyze this quiz performance and provide insights about the student's strengths and weaknesses.

QUIZ PERFORMANCE DATA:
${JSON.stringify(quizData, null, 2)}

OVERALL SCORE: ${score}%

Return ONLY valid JSON in this exact format:
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

IMPORTANT: No thinking process, no <think> tags, no additional text. ONLY the JSON object.
    `;

      const analysisResponse = await aiService.generateContent(prompt);

      // Use the same robust parsing as generateQuiz
      return this.parseAnalysisResponse(analysisResponse);
    } catch (error) {
      console.error("AI analysis failed:", error);
      throw new Error("AI analysis service unavailable");
    }
  }

  parseAnalysisResponse(response) {
  try {
    console.log("🔧 Parsing AI analysis response...");
    
    // SIMPLE cleaning - don't overcomplicate it
    let cleanedResponse = response.trim();
    
    // Remove markdown code blocks if present
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/\s*```/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\s*/, '').replace(/\s*```/, '');
    }
    
    // Remove any "JSON:" prefix
    cleanedResponse = cleanedResponse.replace(/^JSON:\s*/i, '');
    
    console.log("🧹 After cleaning:", cleanedResponse.substring(0, 150) + "...");

    // Try direct parse first (it might already be valid JSON)
    try {
      const analysisData = JSON.parse(cleanedResponse);
      console.log("✅ Direct parse successful");
      return this.validateAnalysisStructure(analysisData);
    } catch (directError) {
      console.log("🔄 Direct parse failed, trying extraction...");
    }

    // Extract JSON using a simpler approach
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const extracted = jsonMatch[0];
        console.log("📦 Extracted JSON:", extracted.substring(0, 150) + "...");
        
        const analysisData = JSON.parse(extracted);
        console.log("✅ Extraction parse successful");
        return this.validateAnalysisStructure(analysisData);
      } catch (extractError) {
        console.log("❌ Extraction parse failed:", extractError.message);
      }
    }

    // If both methods fail, try manual repair
    console.log("🛠️ Attempting manual JSON repair...");
    const repaired = this.simpleJsonRepair(cleanedResponse);
    if (repaired) {
      console.log("✅ Manual repair successful");
      return repaired;
    }

    throw new Error("All parsing methods failed");
    
  } catch (error) {
    console.error("❌ Failed to parse analysis response:", error.message);
    console.log("Raw response sample:", response.substring(0, 300));
    
    // Return basic analysis instead of throwing
    return this.getBasicAnalysis([], [], 0);
  }
}

// Add these helper methods:

validateAnalysisStructure(analysisData) {
  // Ensure all required fields exist and are arrays
  const defaultAnalysis = {
    strengths: [],
    weaknesses: [],
    recommendations: [],
    keyInsights: []
  };

  const result = { ...defaultAnalysis, ...analysisData };
  
  // Convert to arrays if needed
  if (!Array.isArray(result.strengths)) result.strengths = [String(result.strengths)];
  if (!Array.isArray(result.weaknesses)) result.weaknesses = [String(result.weaknesses)];
  if (!Array.isArray(result.recommendations)) result.recommendations = [String(result.recommendations)];
  if (!Array.isArray(result.keyInsights)) result.keyInsights = [String(result.keyInsights)];

  // Filter out any empty values
  result.strengths = result.strengths.filter(s => s && s.trim());
  result.weaknesses = result.weaknesses.filter(w => w && w.trim());
  result.recommendations = result.recommendations.filter(r => r && r.trim());
  result.keyInsights = result.keyInsights.filter(k => k && k.trim());

  // Add fallbacks if everything is empty
  if (result.strengths.length === 0) result.strengths = ["Demonstrated some understanding of the material"];
  if (result.weaknesses.length === 0) result.weaknesses = ["Areas for improvement identified"];
  if (result.recommendations.length === 0) result.recommendations = ["Review the material and practice more"];
  if (result.keyInsights.length === 0) result.keyInsights = ["Keep practicing to improve"];

  return result;
}

simpleJsonRepair(jsonString) {
  try {
    // Remove the problematic fixAnalysisJsonIssues and use a simpler approach
    
    // Fix 1: Ensure proper array commas (basic fix)
    let fixed = jsonString.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
    
    // Fix 2: Ensure strings are properly quoted in arrays (basic cases)
    fixed = fixed.replace(/(\[[^\]]*)([a-zA-Z_][a-zA-Z0-9_,\s]*)([^\]]*\])/g, (match, before, unquoted, after) => {
      // Only fix if it looks like unquoted strings in array
      if (unquoted.trim().length > 0 && !unquoted.includes('"') && !unquoted.includes("'")) {
        const quoted = unquoted.split(',').map(item => 
          item.trim() ? `"${item.trim()}"` : ''
        ).filter(item => item).join(',');
        return before + quoted + after;
      }
      return match;
    });

    // Fix 3: Handle common unescaped quote patterns more carefully
    // Don't aggressively replace quotes - this often breaks valid JSON
    fixed = fixed.replace(/(?<!\\)"(?=(?:[^"]*"[^"]*")*[^"]*$)/g, '\\"');

    const parsed = JSON.parse(fixed);
    return this.validateAnalysisStructure(parsed);
  } catch (error) {
    console.log("Manual repair failed:", error.message);
    return null;
  }
}

  fixAnalysisJsonIssues(jsonString) {
    let fixed = jsonString;

    // Fix unquoted property names
    fixed = fixed.replace(
      /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g,
      '$1"$2"$3'
    );

    // Fix single quotes to double quotes
    fixed = fixed.replace(/'/g, '"');

    // Fix trailing commas
    fixed = fixed.replace(/,\s*}/g, "}");
    fixed = fixed.replace(/,\s*]/g, "]");

    // Fix missing commas between objects in arrays
    fixed = fixed.replace(/\}\s*\{/g, "},{");

    // Fix unescaped quotes in strings - be more careful with this
    // Only fix quotes that are likely to be unescaped in string values
    fixed = fixed.replace(/(:\s*"([^"\\]|\\.)*")/g, (match) => {
      return match.replace(/([^\\])"/g, '$1\\"');
    });

    // Fix missing commas in arrays
    fixed = fixed.replace(/"\s*"/g, '","');

    return fixed;
  }

  tryExtractAnalysisJson(response) {
    try {
      console.log("🔄 Attempting JSON extraction...");

      // First, try to clean the response
      let cleaned = response
        .replace(/<think>[\s\S]*?<\/think>/g, "")
        .replace(/Thinking:[\s\S]*?(?={)/i, "")
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      // Try to find JSON object
      const jsonStart = cleaned.indexOf("{");
      const jsonEnd = cleaned.lastIndexOf("}") + 1;

      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        let extracted = cleaned.substring(jsonStart, jsonEnd);

        // Fix common issues
        extracted = this.fixAnalysisJsonIssues(extracted);

        console.log("📦 Extracted JSON:", extracted.substring(0, 200) + "...");

        const parsed = JSON.parse(extracted);

        // Ensure all required fields
        const defaultAnalysis = {
          strengths: ["Basic understanding demonstrated"],
          weaknesses: ["Need more practice with core concepts"],
          recommendations: ["Review the material and try again"],
          keyInsights: ["Keep practicing to improve your score"],
        };

        return {
          ...defaultAnalysis,
          ...parsed,
        };
      }

      return null;
    } catch (error) {
      console.log("❌ Extraction failed:", error.message);
      return null;
    }
  }

  async analyzePerformance(questions, userAnswers, score) {
  try {
    // Prepare data for AI analysis
    const quizData = questions.map((question, index) => ({
      question: question.question,
      type: question.type,
      correctAnswer: question.correctAnswer,
      userAnswer: userAnswers[index] || 'Not answered',
      isCorrect: question.type === "mcq" 
        ? userAnswers[index] === question.correctAnswer
        : !!(userAnswers[index] && userAnswers[index].trim().length > 0),
    }));

    const prompt = `
Analyze this quiz performance and return ONLY valid JSON.

Quiz Data: ${JSON.stringify(quizData, null, 2)}
Score: ${score}%

Return JSON in this exact format (all fields must be arrays):
{
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"], 
  "recommendations": ["recommendation1", "recommendation2"],
  "keyInsights": ["insight1", "insight2"]
}

IMPORTANT: Return ONLY the JSON object, no other text.
    `;

    const analysisResponse = await aiService.generateContent(prompt);
    return this.parseAnalysisResponse(analysisResponse);
    
  } catch (error) {
    console.error("AI analysis failed, using fallback:", error.message);
    return this.getBasicAnalysis(questions, userAnswers, score);
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

    const unansweredQuestions = userAnswers.filter(
      (answer) => !answer || answer.trim() === ""
    ).length;
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
        "Focus on understanding the explanations",
      ],
      keyInsights: [
        `Scored ${score}% on this quiz`,
        incorrectMCQs.length > 0
          ? `Missed ${incorrectMCQs.length} multiple choice questions`
          : "All multiple choice questions correct",
        unansweredQuestions > 0
          ? `${unansweredQuestions} questions were not answered`
          : "All questions were attempted",
      ],
    };
  }
}
