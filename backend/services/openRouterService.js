import axios from "axios";

class OpenRouterService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.baseURL = "https://openrouter.ai/api/v1";
    console.log("✅ OpenRouter service initialized");
  }

  async generateContent(prompt) {
    try {
      console.log("🤖 Sending to OpenRouter...");

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: "meituan/longcat-flash-chat:free", // Free model from your example
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 1500,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Study Assistant App",
          },
          timeout: 30000,
        }
      );

      const result = response.data.choices[0].message.content;
      console.log("✅ OpenRouter response received");
      return result;
    } catch (error) {
      console.error("❌ OpenRouter error:", error.message);
      throw new Error("OpenRouter service failed");
    }
  }
}

export default new OpenRouterService();
