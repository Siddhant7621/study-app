// Complete JSON parsing test with all helper methods included
class JSONParserTester {
  constructor() {
    // Include all the helper methods directly in the test class
  }

  fixAnalysisJsonIssues(jsonString) {
    let fixed = jsonString;
    
    // Fix unquoted property names
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g, '$1"$2"$3');
    
    // Fix single quotes to double quotes
    fixed = fixed.replace(/'/g, '"');
    
    // Fix trailing commas
    fixed = fixed.replace(/,\s*}/g, '}');
    fixed = fixed.replace(/,\s*]/g, ']');
    
    // Fix missing commas between objects in arrays
    fixed = fixed.replace(/\}\s*\{/g, '},{');
    
    // Fix unescaped quotes in strings - be more careful with this
    // Only fix quotes that are likely to be unescaped in string values
    fixed = fixed.replace(/(:\s*"([^"\\]|\\.)*")/g, (match) => {
      return match.replace(/([^\\])"/g, '$1\\"');
    });
    
    // Fix missing commas in arrays
    fixed = fixed.replace(/"\s*"/g, '","');
    
    return fixed;
  }

  tryExtractAnalysisJson(response) {
    try {
      console.log('🔄 Attempting JSON extraction...');
      
      // First, try to clean the response
      let cleaned = response
        .replace(/<think>[\s\S]*?<\/think>/g, '')
        .replace(/Thinking:[\s\S]*?(?={)/i, '')
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      // Try to find JSON object
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        let extracted = cleaned.substring(jsonStart, jsonEnd);
        
        // Fix common issues
        extracted = this.fixAnalysisJsonIssues(extracted);
        
        console.log('📦 Extracted JSON:', extracted.substring(0, 200) + '...');
        
        const parsed = JSON.parse(extracted);
        
        // Ensure all required fields
        const defaultAnalysis = {
          strengths: ["Basic understanding demonstrated"],
          weaknesses: ["Need more practice with core concepts"],
          recommendations: ["Review the material and try again"],
          keyInsights: ["Keep practicing to improve your score"]
        };
        
        return {
          ...defaultAnalysis,
          ...parsed
        };
      }
      
      return null;
    } catch (error) {
      console.log('❌ Extraction failed:', error.message);
      return null;
    }
  }

  parseAnalysisResponse(response) {
    try {
      console.log("🔧 Parsing AI analysis response...");
      
      // More robust cleaning
      let cleanedResponse = response
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .replace(/^JSON:\s*/i, '')
        .replace(/<think>[\s\S]*?<\/think>/g, '')
        .replace(/Thinking:[\s\S]*?(?={)/i, '')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .trim();

      console.log("🧹 After initial cleaning:", cleanedResponse.substring(0, 100) + "...");

      // Try to find JSON object
      const jsonStartIndex = cleanedResponse.indexOf('{');
      const jsonEndIndex = cleanedResponse.lastIndexOf('}') + 1;
      
      if (jsonStartIndex !== -1 && jsonEndIndex > jsonStartIndex) {
        cleanedResponse = cleanedResponse.substring(jsonStartIndex, jsonEndIndex);
        console.log("📦 Extracted JSON:", cleanedResponse.substring(0, 100) + "...");
      } else {
        throw new Error("No valid JSON structure found in AI response");
      }

      // Fix JSON issues
      cleanedResponse = this.fixAnalysisJsonIssues(cleanedResponse);
      console.log("🔧 After fixing:", cleanedResponse.substring(0, 100) + "...");

      const analysisData = JSON.parse(cleanedResponse);
      
      // Validate structure
      const requiredFields = ['strengths', 'weaknesses', 'recommendations', 'keyInsights'];
      for (const field of requiredFields) {
        if (!analysisData[field] || !Array.isArray(analysisData[field])) {
          throw new Error(`Invalid analysis structure: missing or invalid ${field} array`);
        }
      }

      console.log(`✅ Parsed analysis with ${analysisData.strengths.length} strengths`);
      return analysisData;
    } catch (error) {
      console.error("❌ Failed to parse analysis response:", error.message);
      console.log("Raw response sample:", response.substring(0, 200) + "...");
      
      // Try extraction as fallback
      const extracted = this.tryExtractAnalysisJson(response);
      if (extracted) {
        console.log("✅ Recovered via extraction");
        return extracted;
      }
      
      throw new Error(`AI returned invalid format: ${error.message}`);
    }
  }
}

// Mock AI responses for testing
const mockAIResponses = {
  perfectJson: `{
    "strengths": [
      "Good understanding of basic concepts",
      "Strong analytical skills"
    ],
    "weaknesses": [
      "Need more practice with advanced topics",
      "Time management needs improvement"
    ],
    "recommendations": [
      "Review chapter 3 thoroughly",
      "Practice more MCQs"
    ],
    "keyInsights": [
      "Performs well under pressure",
      "Needs to read questions carefully"
    ]
  }`,

  withThinking: `<think>We are given quiz performance data and must analyze it...
{
  "strengths": [
    "Understanding of basic physics concepts",
    "Good memory recall"
  ],
  "weaknesses": [
    "Application of Newton's Laws",
    "Circular motion concepts"
  ],
  "recommendations": [
    "Practice more application-based questions",
    "Review Newton's Laws of Motion"
  ],
  "keyInsights": [
    "Struggles with multi-step problems",
    "Good at memorization but needs conceptual understanding"
  ]
}`,

  malformedJson: `{
    strengths: [
      "Basic concepts clear",
      "Good effort shown"
    ],
    weaknesses: [
      "Advanced topics unclear",
      "Calculation errors"
    ],
    recommendations: [
      "Practice more problems",
      "Focus on weak areas"
    ],
    keyInsights: [
      "Needs consistent practice",
      "Shows improvement potential"
    ]
  }`,

  incompleteJson: `{
    "strengths": [
      "Good foundation"
    ],
    "weaknesses": [
      "Needs more practice"
    `,

  withSpecialChars: `{
    "strengths": [
      "Understanding of complex concepts",
      "Good analytical skills"
    ],
    "weaknesses": [
      "Needs more practice",
      "Time management"
    ],
    "recommendations": [
      "Review key concepts",
      "Practice regularly"
    ],
    "keyInsights": [
      "Shows potential",
      "Needs consistency"
    ]
  }`,

  // Your specific problematic case
  yourProblemCase: `<think>We are given quiz performance data and must analyze it to provide insights about the student's strengths and weaknesses.
 The quiz has 6 questions. The overall score is 16.67% (which is 1 out of 6 questions correct, since 1/6 ≈ 16.67%).

 Let's break down the questions:

 1. MCQ: displacement - user got it correct (C)
 2. MCQ: type of motion (circular) - user answered C (but correct was D) -> incorrect
 3. MCQ: Newton's First Law - user answered B (correct was D) -> incorrect
 4. SAQ: dif...
{
  "strengths": [
    "Specific strength area 1",
    "Specific strength area 2"
  ],
  "weaknesses": [
    "Specific weakness area 1 with explanation",
    "Specific weakness area 2 with explanation"
  ],
  "recommendations": [
    "Specific study recommendation 1",
    "Specific study recommendation 2"
  ],
  "keyInsights": [
    "Key insight about learning patterns",
    "Another key insight"
  ]
}`
};

async function runAllTests() {
  const tester = new JSONParserTester();
  
  console.log('🚀 Starting JSON Parsing Tests\n');
  console.log('='.repeat(60));

  for (const [scenarioName, mockResponse] of Object.entries(mockAIResponses)) {
    console.log(`\n📋 Testing: ${scenarioName}`);
    console.log('─'.repeat(50));
    console.log('Input sample:', mockResponse.substring(0, 100).replace(/\n/g, ' ') + '...');
    
    try {
      const result = await tester.parseAnalysisResponse(mockResponse);
      console.log('✅ SUCCESS:');
      console.log(`   Strengths: ${result.strengths.length} items`);
      console.log(`   Weaknesses: ${result.weaknesses.length} items`);
      console.log(`   First strength: "${result.strengths[0]}"`);
      
    } catch (error) {
      console.log('❌ FAILED:');
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔧 Testing JSON Fixing Function\n');

  const fixTestCases = [
    `{strengths: ["test"], weaknesses: ["test"]}`,
    `{'strengths': ['test'], 'weaknesses': ['test']}`,
    `{strengths: ["test"], weaknesses: ["test"],}`,
    `{strengths: ["test" "another"], weaknesses: ["test"]}`,
  ];

  fixTestCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}:`);
    console.log(`   Input:  ${testCase}`);
    
    try {
      const fixed = tester.fixAnalysisJsonIssues(testCase);
      console.log(`   Fixed:  ${fixed}`);
      
      JSON.parse(fixed);
      console.log('   ✅ Parse successful');
    } catch (error) {
      console.log(`   ❌ Parse failed: ${error.message}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('🏁 All tests completed');
}

// Run the tests
runAllTests().catch(console.error);