import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

class AIService {
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.baseURL = "https://api.perplexity.ai";
    this.lastRequestTime = 0;
    this.minRequestInterval = 2000;
    console.log("✅ Perplexity AI service initialized");
  }

  async generateContent(prompt) {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();

    try {
      console.log("🤖 Sending to Perplexity...");

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          // CORRECT Perplexity models:
          model: "sonar-pro", // ✅ Correct model name
          // Other available models:
          // "sonar-small-chat" - without web search
          // "sonar-medium-online" - with web search (more capable)
          // "sonar-medium-chat" - without web search
          // "sonar-reasoning-online" - for complex reasoning
          messages: [
            {
              role: "system",
              content:
                "You are an educational assistant specializing in creating quizzes and learning materials. Always return valid JSON format when requested. Be accurate and educational.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 45000,
        }
      );

      if (
        !response.data ||
        !response.data.choices ||
        !response.data.choices[0] ||
        !response.data.choices[0].message
      ) {
        throw new Error("Invalid response structure from AI service");
      }

      const result = response.data.choices[0].message.content;

      if (!result || result.trim() === "") {
        throw new Error("Empty response from AI service");
      }

      console.log("✅ Perplexity response received");
      return result;
    } catch (error) {
      console.error("❌ Perplexity API error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        code: error.code,
      });

      let errorMessage = "AI service failed";

      if (error.response?.status === 400) {
        if (error.response?.data?.error?.type === "invalid_model") {
          errorMessage =
            "Invalid AI model configuration. Please contact support.";
        } else {
          errorMessage = "Bad request to AI service. Please check your input.";
        }
      } else if (error.response?.status === 429) {
        errorMessage =
          "AI service rate limit exceeded. Please try again in a few moments.";
      } else if (error.response?.status === 401) {
        errorMessage =
          "Perplexity API key invalid or missing. Please check your API configuration.";
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "AI service request timeout. Please try again.";
      } else if (error.response?.status >= 500) {
        errorMessage =
          "AI service is currently overloaded. Please try again later.";
      } else if (error.message.includes("Invalid response structure")) {
        errorMessage = "AI service returned invalid response format.";
      } else if (error.message.includes("Empty response")) {
        errorMessage = "AI service returned empty response.";
      }

      throw new Error(errorMessage);
    }
  }
}

export default new AIService();
