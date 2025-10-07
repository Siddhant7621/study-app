import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

async function testOpenRouter() {
  console.log('🧪 Testing OpenRouter with your example...');
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.log('❌ OPENROUTER_API_KEY not found in environment');
    console.log('💡 Get free key from: https://openrouter.ai/');
    return;
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "qwen/qwen3-235b-a22b:free",
        messages: [
          {
            "role": "user",
            "content": "What is the meaning of life?"
          }
        ],
        max_tokens: 100,
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
    console.log('✅ OpenRouter Response:');
    console.log(result);
    console.log('🎯 OpenRouter is WORKING!');
    
  } catch (error) {
    console.error('❌ OpenRouter Test Failed:');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('💡 Invalid API key');
      } else if (error.response.status === 429) {
        console.log('💡 Rate limit exceeded');
      }
    } else {
      console.log('Error:', error.message);
    }
  }
}

testOpenRouter();