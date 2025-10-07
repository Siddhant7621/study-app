import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

class AIService {
  constructor() {
    this.apiKey = process.env.HF_TOKEN;
    this.baseURL = 'https://router.huggingface.co/v1/chat/completions';
    console.log('✅ Hugging Face Router service initialized');
  }

  async generateContent(prompt) {
    try {
      console.log('🤖 Sending to Hugging Face...');
      
      const response = await axios.post(
        this.baseURL,
        {
          model: "moonshotai/Kimi-K2-Instruct-0905",
          messages: [
            { 
              role: "system", 
              content: "You are an educational assistant. For quiz generation, return ONLY valid JSON format." 
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 1500,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const result = response.data.choices[0].message.content;
      console.log('✅ Hugging Face response received');
      return result;
      
    } catch (error) {
      console.error('❌ Hugging Face error:', error.message);
      throw new Error('AI service failed');
    }
  }
}

export default new AIService();