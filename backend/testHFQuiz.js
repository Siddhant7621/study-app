import dotenv from 'dotenv';
dotenv.config();

import aiService from './services/aiService.js';

async function testHFQuiz() {
  console.log('🧪 Testing Hugging Face Quiz Generation...');

  const textbookContent = `
    Physics is the study of matter, energy, and their interactions. 
    Newton's laws of motion:
    1. First Law: Objects at rest stay at rest, objects in motion stay in motion
    2. Second Law: Force = mass × acceleration (F=ma)
    3. Third Law: For every action, there is an equal and opposite reaction
  `;

  const prompt = `
    Create a quiz based on this textbook content. Return ONLY valid JSON:

    {
      "questions": [
        {
          "type": "mcq",
          "question": "Question based on the text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "A",
          "explanation": "Explanation based on the text"
        }
      ]
    }

    Textbook Content: ${textbookContent}
  `;

  try {
    console.log('📝 Generating quiz...');
    const result = await aiService.generateContent(prompt);
    
    console.log('✅ Quiz generated successfully!');
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
      console.log('⚠️ Response is not valid JSON, but API is working!');
      console.log('First 500 chars:', result.substring(0, 500));
    }
    
  } catch (error) {
    console.error('❌ Quiz generation failed:', error.message);
  }
}

testHFQuiz();