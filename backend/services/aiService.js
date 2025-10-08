import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

class AIService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.baseURL = 'https://openrouter.ai/api/v1';
    this.lastRequestTime = 0;
    this.minRequestInterval = 2000; // 2 seconds between requests
    console.log('✅ OpenRouter AI service initialized');
  }

  async generateContent(prompt) {
    // Rate limiting: wait if we're making requests too fast
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();

    try {
      console.log('🤖 Sending to OpenRouter...');
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: "qwen/qwen3-235b-a22b:free",
          messages: [
            { 
              role: "system", 
              content: "You are an educational assistant. For quiz generation, return ONLY valid JSON format." 
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Study Assistant App'
          },
          timeout: 45000 // Increased timeout to 45 seconds
        }
      );

      // Check if response structure is valid
      if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
        throw new Error('Invalid response structure from AI service');
      }

      const result = response.data.choices[0].message.content;
      
      if (!result || result.trim() === '') {
        throw new Error('Empty response from AI service');
      }

      console.log('✅ OpenRouter response received');
      return result;
      
    } catch (error) {
      console.error('❌ OpenRouter error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        code: error.code
      });
      
      let errorMessage = 'AI service failed';
      
      if (error.response?.status === 429) {
        errorMessage = 'AI service rate limit exceeded. Please try again in a few moments.';
      } else if (error.response?.status === 401) {
        errorMessage = 'AI service authentication failed. Please check API configuration.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'AI service request timeout. Please try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'AI service is currently overloaded. Please try again later.';
      } else if (error.message.includes('Invalid response structure')) {
        errorMessage = 'AI service returned invalid response format.';
      } else if (error.message.includes('Empty response')) {
        errorMessage = 'AI service returned empty response.';
      }
      
      throw new Error(errorMessage);
    }
  }
}

export default new AIService();