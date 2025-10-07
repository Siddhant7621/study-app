import dotenv from 'dotenv';
dotenv.config();

console.log('🔧 Testing Environment Variables:');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY || 'NOT FOUND');
console.log('MONGODB_URI:', process.env.MONGODB_URI || 'NOT FOUND');