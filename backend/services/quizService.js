import Quiz from '../models/Quiz.js';
import Progress from '../models/Progress.js';
import aiService from './aiService.js';

export class QuizService {
  async generateQuiz(bookId, bookText) {
    try {
      const prompt = this.buildQuizPrompt(bookText);
      
      try {
        const response = await aiService.generateContent(prompt);
        const quizData = this.parseQuizResponse(response);
        
        const quiz = new Quiz({
          bookId,
          questions: quizData.questions
        });

        await quiz.save();
        return quiz;
      } catch (aiError) {
        console.log('AI service failed, using fallback quiz');
        return await this.createEnhancedFallbackQuiz(bookId, bookText);
      }
      
    } catch (error) {
      console.error('Quiz generation error:', error);
      return await this.createEnhancedFallbackQuiz(bookId, bookText);
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
      const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      
      // Extract JSON from response
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      console.error('Failed to parse quiz response:', error);
      console.log('Raw response:', response.substring(0, 200) + '...');
      return this.getFallbackQuizData();
    }
  }

  getFallbackQuizData() {
    return {
      questions: [
        {
          type: "mcq",
          question: "What is the main purpose of studying this material?",
          options: [
            "To understand fundamental concepts",
            "To memorize facts", 
            "To pass exams",
            "To complete assignments"
          ],
          correctAnswer: "A",
          explanation: "The primary goal is to build a strong understanding of fundamental concepts that can be applied in various contexts."
        },
        {
          type: "mcq",
          question: "Which learning approach is most effective for this subject?",
          options: [
            "Active learning and practice",
            "Passive reading",
            "Last-minute cramming",
            "Memorization without understanding"
          ],
          correctAnswer: "A",
          explanation: "Active learning through practice and application leads to better retention and understanding."
        },
        {
          type: "saq",
          question: "Explain one key concept you learned from this material.",
          correctAnswer: "Answers may vary but should demonstrate understanding of core concepts from the material.",
          explanation: "This question tests your ability to identify and explain important concepts from your studies."
        },
        {
          type: "laq",
          question: "Describe how you would apply what you've learned to solve a real-world problem.",
          correctAnswer: "Answers should show practical application of the learned concepts to realistic scenarios.",
          explanation: "This evaluates your ability to transfer theoretical knowledge to practical situations."
        }
      ]
    };
  }

  async createEnhancedFallbackQuiz(bookId, bookText) {
    const keywords = this.extractKeywords(bookText);
    
    const questions = [
      {
        type: "mcq",
        question: `Based on the material, what is the primary focus of ${keywords.topic || 'this chapter'}?`,
        options: [
          `Understanding ${keywords.concept1 || 'fundamental concepts'}`,
          `Memorizing ${keywords.concept2 || 'key terms'}`,
          "Solving complex problems",
          "Historical background"
        ],
        correctAnswer: "A",
        explanation: `The chapter focuses on building a strong foundation in ${keywords.topic || 'the core concepts'} through understanding rather than memorization.`
      },
      {
        type: "mcq", 
        question: `Which approach would best help you master ${keywords.concept1 || 'the main concepts'} presented?`,
        options: [
          "Active practice and application",
          "Passive reading",
          "Highlighting text",
          "Group discussion only"
        ],
        correctAnswer: "A",
        explanation: "Active learning through practice and real-world application leads to better retention and deeper understanding."
      },
      {
        type: "saq",
        question: `Explain the significance of ${keywords.concept1 || 'one key concept'} in your own words.`,
        correctAnswer: "Your answer should demonstrate understanding of the core concepts and their practical applications.",
        explanation: "This tests your ability to articulate important concepts clearly and apply them to different contexts."
      },
      {
        type: "laq",
        question: `Describe how you would apply the principles from this chapter to solve a practical problem related to ${keywords.topic || 'this subject'}.`,
        correctAnswer: "A comprehensive answer should connect theoretical concepts with real-world applications, showing clear understanding.",
        explanation: "This evaluates your ability to transfer knowledge from theoretical learning to practical problem-solving scenarios."
      }
    ];

    const quiz = new Quiz({
      bookId,
      questions: questions
    });
    
    return quiz.save();
  }

  extractKeywords(text) {
    if (!text || text.length < 10) {
      return {
        topic: 'the subject',
        concept1: 'fundamental principles', 
        concept2: 'key concepts'
      };
    }

    const words = text.toLowerCase().split(/\s+/).slice(0, 50);
    const commonWords = new Set(['the', 'and', 'is', 'in', 'to', 'of', 'a', 'for', 'on', 'with', 'as', 'by', 'this', 'that']);
    
    const keywords = words.filter(word => 
      word.length > 4 && !commonWords.has(word)
    ).slice(0, 3);

    return {
      topic: keywords[0] ? this.capitalizeFirst(keywords[0]) : 'the subject',
      concept1: keywords[1] ? this.capitalizeFirst(keywords[1]) : 'fundamental principles', 
      concept2: keywords[2] ? this.capitalizeFirst(keywords[2]) : 'key concepts'
    };
  }

  capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  async evaluateQuiz(quizId, userAnswers) {
    try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      let score = 0;
      const results = [];

      quiz.questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        let isCorrect = false;

        if (question.type === 'mcq') {
          isCorrect = userAnswer === question.correctAnswer;
        } else {
          isCorrect = userAnswer && userAnswer.trim().length > 0;
        }
        
        if (isCorrect) score++;

        results.push({
          question: question.question,
          userAnswer,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          isCorrect
        });
      });

      const finalScore = (score / quiz.questions.length) * 100;
      
      quiz.score = finalScore;
      quiz.completedAt = new Date();
      await quiz.save();

      await this.updateProgress(quiz.bookId, finalScore);

      return {
        score: finalScore,
        results,
        totalQuestions: quiz.questions.length,
        correctAnswers: score
      };
    } catch (error) {
      console.error('Quiz evaluation error:', error);
      throw new Error('Failed to evaluate quiz');
    }
  }

  async updateProgress(bookId, score) {
    try {
      let progress = await Progress.findOne({ bookId });
      
      if (!progress) {
        progress = new Progress({ bookId });
      }

      progress.totalQuizzes += 1;
      progress.totalScore += score;
      progress.averageScore = progress.totalScore / progress.totalQuizzes;
      progress.lastActivity = new Date();

      if (score < 70) {
        progress.weakAreas = ['Concept Understanding', 'Application Skills'];
      } else {
        progress.weakAreas = [];
      }

      await progress.save();
    } catch (error) {
      console.error('Progress update error:', error);
    }
  }
}