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

      const result = response.data.choices[0].message.content;
      console.log('✅ OpenRouter response received');
      return result;
      
    } catch (error) {
      console.error('❌ OpenRouter error:', error.message);
      
      if (error.response?.status === 429) {
        console.log('💡 Rate limit hit. Consider upgrading or using a different model.');
      }
      
      throw new Error('AI service failed');
    }
  }
}

export default new AIService();