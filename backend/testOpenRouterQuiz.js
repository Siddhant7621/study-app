import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

async function testOpenRouterQuiz() {
  console.log('🧪 Testing OpenRouter Quiz Generation...');
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  const textbookContent = `
    Physics is the study of matter, energy, and their interactions. 
    Newton's laws of motion describe how objects move.
    First law: Objects at rest stay at rest, objects in motion stay in motion.
    Second law: Force equals mass times acceleration (F=ma).
    Third law: For every action, there is an equal and opposite reaction.
  `;

  const prompt = `
    Create a quiz with 3 multiple choice questions based on this textbook content.
    
    Textbook Content:
    ${textbookContent}
    
    Return ONLY valid JSON in this exact format:
    {
      "questions": [
        {
          "type": "mcq",
          "question": "Question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "A",
          "explanation": "Explanation text"
        }
      ]
    }
  `;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "qwen/qwen3-235b-a22b:free",
        messages: [
          { 
            role: "system", 
            content: "You are an educational assistant. Always return valid JSON for quizzes." 
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Study Assistant App'
        },
        timeout: 30000
      }
    );

    const result = response.data.choices[0].message.content;
    console.log('✅ OpenRouter Response Received!');
    console.log('Raw response:', result);
    
    // Try to parse JSON
    try {
      const quizData = JSON.parse(result);
      console.log(`\n🎯 Generated ${quizData.questions.length} questions:`);
      
      quizData.questions.forEach((q, i) => {
        console.log(`\n${i + 1}. [${q.type}] ${q.question}`);
        if (q.options) {
          q.options.forEach((opt, j) => {
            console.log(`   ${String.fromCharCode(65 + j)}) ${opt}`);
          });
        }
        console.log(`   ✅ Correct: ${q.correctAnswer}`);
        console.log(`   💡 Explanation: ${q.explanation}`);
      });
    } catch (parseError) {
      console.log('⚠️ Response is not valid JSON, but OpenRouter is working!');
      console.log('First 500 chars:', result.substring(0, 500));
    }
    
  } catch (error) {
    console.error('❌ Quiz generation failed:', error.message);
  }
}

testOpenRouterQuiz();