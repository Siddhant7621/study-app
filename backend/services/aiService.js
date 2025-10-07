import { GoogleGenerativeAI } from '@google/generative-ai';

class AIService {
  constructor() {
    this.initialized = false;
    this.geminiModel = null;
    this.openAIClient = null;
    this.activeService = null;
  }

  async initialize() {
    if (this.initialized) return this.activeService;

    // Try Gemini first
    if (process.env.GEMINI_API_KEY) {
      const geminiModel = await this.initializeGemini();
      if (geminiModel) {
        this.geminiModel = geminiModel;
        this.activeService = 'gemini';
        console.log('✅ Using Gemini as AI service');
        this.initialized = true;
        return this.activeService;
      }
    }

    // Fallback to OpenAI
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 20) {
      const openAIClient = await this.initializeOpenAI();
      
      if (openAIClient) {
        this.openAIClient = openAIClient;
        this.activeService = 'openai';
        console.log('✅ Using OpenAI as AI service');
        this.initialized = true;
        return this.activeService;
      }
    }

    console.log('⚠️  No AI service available');
    this.activeService = 'fallback';
    this.initialized = true;
    return this.activeService;
  }

  async initializeGemini() {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      
      // Use the working model names from your API test
      const modelNames = [
        'models/gemini-2.5-flash',      // Fast and capable
        'models/gemini-2.0-flash',      // Good balance
        'models/gemini-pro-latest',     // Legacy reliable
        'models/gemini-2.5-pro'         // Most powerful
      ];

      for (const modelName of modelNames) {
        try {
          console.log(`🔧 Testing Gemini model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          
          // Test with a simple request
          const result = await model.generateContent('Say "Hello" in one word');
          const response = await result.response;
          
          if (response.text().toLowerCase().includes('hello')) {
            console.log(`✅ Gemini model working: ${modelName}`);
            return model;
          }
        } catch (error) {
          console.log(`   ❌ ${modelName}: ${error.message.split('\n')[0]}`);
          continue;
        }
      }
      
      throw new Error('No working Gemini model found');
      
    } catch (error) {
      console.error('❌ Gemini initialization failed:', error.message);
      return null;
    }
  }

  async initializeOpenAI() {
    try {
      const { OpenAI } = await import('openai');
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      // Test the client
      await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Say hello" }],
        max_tokens: 5
      });
      
      return client;
    } catch (error) {
      console.error('❌ OpenAI initialization failed:', error.message);
      return null;
    }
  }

  async generateContent(prompt, serviceType = null) {
    await this.initialize();
    
    const service = serviceType || this.activeService;
    
    try {
      if (service === 'gemini' && this.geminiModel) {
        const result = await this.geminiModel.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } else if (service === 'openai' && this.openAIClient) {
        const response = await this.openAIClient.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 2000
        });
        return response.choices[0].message.content;
      } else {
        throw new Error('No AI service available');
      }
    } catch (error) {
      console.error(`AI generation error (${service}):`, error.message);
      throw error;
    }
  }
}

// Create singleton instance
const aiService = new AIService();
export default aiService;