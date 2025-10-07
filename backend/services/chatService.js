import aiService from './aiService.js';

export class ChatService {
  constructor(bookText) {
    this.bookText = bookText;
  }

  async askQuestion(question) {
    try {
      const prompt = this.buildPrompt(question);
      
      try {
        const response = await aiService.generateContent(prompt);
        return response;
      } catch (aiError) {
        console.log('AI service failed, using fallback response');
        return this.getEnhancedFallbackResponse(question, this.bookText);
      }
      
    } catch (error) {
      console.error('Chat service error:', error);
      return this.getEnhancedFallbackResponse(question, this.bookText);
    }
  }

  buildPrompt(question) {
    const limitedText = this.bookText.substring(0, 2000);
    
    return `
      You are an AI tutor helping a student understand their textbook. 
      Use ONLY the following textbook content to answer questions. 
      If the answer isn't in the book, say so and offer general knowledge.

      Textbook Content:
      ${limitedText}

      Student Question: ${question}

      Guidelines:
      1. Answer based strictly on the textbook content
      2. Provide page citations if possible (format as "According to the text...")
      3. Keep answers clear and educational
      4. If unsure, admit it and suggest reviewing the material

      Answer:
    `;
  }

  getEnhancedFallbackResponse(question, bookText) {
    const responses = [
      `I'd love to help you with "${question}". Based on the textbook content, I recommend focusing on the key concepts and main arguments presented.`,
      `That's a thoughtful question about your study material. To find the answer, look for sections that discuss related concepts.`,
      `Excellent question! This shows you're engaging deeply with the material. I suggest reviewing the chapter summaries.`,
      `I understand you're seeking clarification on this topic. The textbook provides foundational knowledge you can build upon.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}