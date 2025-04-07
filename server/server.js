const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const PDFParser = require('pdf-parse');
const mammoth = require('mammoth');
require('dotenv').config();
const STATS_FILE = path.join(__dirname, 'usage_stats.json');


//-----------stats--------------
let stats = {
  totalUsers: 0,
  dailyUsers: {},
  lastReset: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  recentUploads: [] // Store recent resume uploads with timestamp and score
};


try {
  if (fs.existsSync(STATS_FILE)) {
    stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
    
    // Check if we need to reset daily counts
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastReset !== today) {
      stats.dailyUsers[today] = 0;
      stats.lastReset = today;
      // Save the updated stats
      fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
    }
  } else {
    // Initialize with today's date
    const today = new Date().toISOString().split('T')[0];
    stats.dailyUsers[today] = 0;
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  }
} catch (error) {
  console.error('Error loading stats file:', error);
}


const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
   origin: '*',  //'https://resume-ats-scorer-3upgmehmy-dharmateja03s-projects.vercel.app', 
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Please upload a PDF or Word document.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Extract text from uploaded resume
async function extractTextFromFile(filePath, fileType) {
  try {
    if (fileType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await PDFParser(dataBuffer);
      return data.text;
    } else if (
      fileType === 'application/msword' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }
    return '';
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error('Failed to extract text from file');
  }
}
function updateStats(score, fileInfo) {
  const today = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString();
  
  // Increment total users
  stats.totalUsers += 1;
  
  // Increment today's users
  if (!stats.dailyUsers[today]) {
    stats.dailyUsers[today] = 0;
  }
  stats.dailyUsers[today] += 1;
  
  // Add to recent uploads (keep only last 50)
  stats.recentUploads.unshift({
    timestamp,
    score: typeof score === 'object' ? score.score : score,
    fileType: fileInfo.mimetype,
    fileName: fileInfo.originalname
  });
  
  // Keep only last 50 uploads
  if (stats.recentUploads.length > 50) {
    stats.recentUploads = stats.recentUploads.slice(0, 50);
  }
  
  // Save the updated stats
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  
  //console.log(`Stats updated: Total: ${stats.totalUsers}, Today: ${stats.dailyUsers[today]}`);
}
// Analyze resume using Claude API
async function analyzeResumeWithClaude(resumeText) {
  try {
    //console.log("Beginning Claude API analysis, resume length:", resumeText.length); //-- for debug bro
    
    // Truncate the resume text to avoid exceeding token limits
    const truncatedText = resumeText.substring(0, 10000);
    //console.log("Truncated resume length:", truncatedText.length);
    
    const requestData = {
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Analyze this resume for ATS compatibility with strict criteria. Give it a score from 0-100 based on:
    1. Formatting (0-20 points): No tables, headers/footers, complex formatting, or non-standard fonts. Deduct points for any complex elements.
    2. Keyword optimization (0-25 points): Must contain industry-specific keywords matching common job descriptions. Deduct points for generic terms.
    3. Section clarity (0-20 points): Must have clear, standard section headings (Experience, Education, Skills) in expected order.
    4. Contact information (0-15 points): Must include complete contact details (name, phone, email, location, LinkedIn).
    5. Content quality (0-20 points): Achievements should be quantified, roles clearly described, and skills relevant to industry standards. Deduct points if words are used more than 2 times. Deduct points if bullet points are not quantified.
    
    Be highly critical and only award points when criteria are fully met.
    
    Here's the resume text:
    ${truncatedText}
    
    Respond with ONLY valid JSON in this exact format with no additional text or explanation:
    {
      "score": 75,
      "analysis": {
        "formatting": "Good/Fair/Poor - detailed critical explanation",
        "keywords": "Good/Fair/Poor - detailed critical explanation",
        "structure": "Good/Fair/Poor - detailed critical explanation",
        "contact_info": "Good/Fair/Poor - detailed critical explanation",
        "content_quality": "Good/Fair/Poor - detailed critical explanation"
      },
      "improvement_areas": ["specific suggestion 1", "specific suggestion 2", "specific suggestion 3", "specific suggestion 4"]
    }`
        }
      ]
    };
    
    //console.log("Sending request to Claude API..."); //for debug 
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    
    
    // Extract and parse the JSON response
    const content = response.data.content[0].text;
    
    try {
      const parsedData = JSON.parse(content);
      return parsedData;
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      
      throw new Error("Failed to parse Claude API response as JSON");
    }
  } catch (error) {
    console.error('Error analyzing resume with Claude:', error.message);
    
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", JSON.stringify(error.response.data, null, 2));
    }
    
    // Return a more strict fallback score
    return {
      score: 45, // Lower default score to show strictness
      analysis: {
        formatting: "Poor - Unable to verify ATS-friendly formatting",
        keywords: "Poor - Insufficient industry-specific terminology",
        structure: "Fair - Structure could not be fully analyzed",
        contact_info: "Fair - Contact information appears incomplete",
        content_quality: "Poor - Content lacks specificity and measurable achievements"
      },
      improvement_areas: [
        "Eliminate all complex formatting elements including tables and graphics",
        "Incorporate more specific industry keywords from target job descriptions",
        "Ensure all section headings match standard ATS expectations (Experience, Education, Skills)",
        "Include complete contact information with LinkedIn profile",
        "Quantify achievements with specific metrics and outcomes"
      ]
    };
  }
}
// Add this to your server.js file

// Job Match API endpoint
app.post('/api/job-match', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    if (!req.body.jobDescription) {
      return res.status(400).json({ error: 'No job description provided' });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;
    const jobDescription = req.body.jobDescription;

    // Extract text from the resume
    const resumeText = await extractTextFromFile(filePath, fileType);
    
    // Analyze the job match using Claude API
    const analysis = await analyzeJobMatch(resumeText, jobDescription);
    
    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    res.json(analysis);
  } catch (error) {
    console.error('Error processing job match:', error);
    res.status(500).json({ error: 'Failed to process job match request' });
  }
});

// Function to analyze job match using Claude API
async function analyzeJobMatch(resumeText, jobDescription) {
  try {
    // Truncate texts to avoid exceeding token limits
    const truncatedResume = resumeText.substring(0, 8000);
    const truncatedJobDesc = jobDescription.substring(0, 4000);
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: `I need to compare a resume with a job description to determine how well they match. I'll provide both the resume text and job description. I need you to:

1. Extract important keywords from the job description
2. Check which of these keywords appear in the resume
3. Calculate a match percentage (0-100%)
4. Generate a list of missing keywords that should be added to the resume
5. Provide 3-5 specific recommendations for improving the resume

Resume:
${truncatedResume}

Job Description:
${truncatedJobDesc}

Respond with ONLY valid JSON in this exact format with no additional text:
{
  "matchPercentage": 65,
  "matchedKeywords": ["keyword1", "keyword2", "keyword3"],
  "missingKeywords": ["keyword4", "keyword5", "keyword6"],
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2",
    "Specific recommendation 3"
  ]
}`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    // Extract and parse the JSON response
    const content = response.data.content[0].text;
    
    try {
      // Try to extract just the JSON part from the response
      let jsonContent = content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }
      
      const parsedData = JSON.parse(jsonContent);
      return parsedData;
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Raw response content:", content);
      throw new Error("Failed to parse Claude API response as JSON");
    }
  } catch (error) {
    console.error('Error analyzing job match with Claude:', error);
    
    // Return a fallback response if the API call fails
    return {
      matchPercentage: 50,
      matchedKeywords: ["skill", "experience", "education"],
      missingKeywords: ["specific skill", "technical requirement", "tool"],
      recommendations: [
        "Add more specific keywords from the job description",
        "Quantify your achievements with metrics and results",
        "Include technical skills that are explicitly mentioned in the job post",
        "Tailor your resume summary to match the job requirements"
      ]
    };
  }
}
//testing
// Add this near your other routes
// app.get('/api/test-claude', async (req, res) => {
//   try {
//     console.log("Testing Claude API connection...");
    
//     const response = await axios.post(
//       'https://api.anthropic.com/v1/messages',
//       {
//         model: 'claude-3-haiku-20240307', // Using a more accessible model
//         max_tokens: 100,
//         messages: [
//           {
//             role: 'user',
//             content: 'Respond with the text "API connection successful" if you can read this message.'
//           }
//         ]
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'x-api-key': process.env.ANTHROPIC_API_KEY,
//           'anthropic-version': '2023-06-01'
//         }
//       }
//     );
    
//     console.log("Claude API test response:", response.data);
    
//     res.json({ 
//       success: true, 
//       message: "Claude API connection successful",
//       response: response.data
//     });
//   } catch (error) {
//     console.error("Claude API test error:", error.message);
    
//     // Add more detailed error information
//     let errorDetails = {
//       message: error.message
//     };
    
//     if (error.response) {
//       // The request was made and the server responded with a status code
//       // that falls out of the range of 2xx
//       errorDetails.status = error.response.status;
//       errorDetails.data = error.response.data;
//       errorDetails.headers = error.response.headers;
//     } else if (error.request) {
//       // The request was made but no response was received
//       errorDetails.request = "Request was made but no response received";
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       message: "Claude API connection failed",
//       error: errorDetails
//     });
//   }
// });

// Also modify your original endpoint for better logging
// app.post('/api/analyze-resume', upload.single('resume'), async (req, res) => {
//   console.log("----- RESUME UPLOAD RECEIVED -----");
//   try {
//     console.log("Resume upload received");
//     // ... existing code ...
//   } catch (error) {
//     console.error('Error processing resume:', error.message);
    
//     let errorDetails = {
//       message: error.message
//     };
    
//     if (error.response) {
//       errorDetails.status = error.response.status;
//       errorDetails.data = error.response.data;
//     }
    
//     res.status(500).json({ 
//       error: 'Failed to analyze resume. Please try again.', 
//       details: errorDetails 
//     });
//   }
// });
//----------------------------------------------------------------------------------------
//API endpoint to analyze resume
app.post('/api/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      console.log("Error: No file uploaded");
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    // Extract text from the resume
    const resumeText = await extractTextFromFile(filePath, fileType);
    
    // Analyze the resume using Claude API
    const analysis = await analyzeResumeWithClaude(resumeText);
    

    updateStats(analysis, req.file);
    
    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    res.json(analysis);
  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({ error: 'Failed to process resume' });
  }
});
//-----------api for stats----------
app.get('/api/stats', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayCount = stats.dailyUsers[today] || 0;
    
    // Generate last 30 days data
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last30Days.push({
        date: dateStr,
        count: stats.dailyUsers[dateStr] || 0
      });
    }
    
    // Calculate average score from recent uploads
    let avgScore = 0;
    if (stats.recentUploads.length > 0) {
      avgScore = stats.recentUploads.reduce((sum, upload) => sum + upload.score, 0) / stats.recentUploads.length;
      avgScore = Math.round(avgScore * 10) / 10; // Round to 1 decimal place
    }
    
    res.json({
      success: true,
      stats: {
        totalUsers: stats.totalUsers,
        todayUsers: todayCount,
        last30Days: last30Days,
        averageScore: avgScore,
        recentUploads: stats.recentUploads.slice(0, 10) // Send only the 10 most recent
      }
    });
  } catch (error) {
    console.error('Error retrieving stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve usage statistics'
    });
  }
});
// Function to update stats when a resume is analyzed
function updateStats(score, fileInfo) {
  const today = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString();
  
  // Increment total users
  stats.totalUsers += 1;
  
  // Increment today's users
  if (!stats.dailyUsers[today]) {
    stats.dailyUsers[today] = 0;
  }
  stats.dailyUsers[today] += 1;
  
  // Add to recent uploads (keep only last 50)
  stats.recentUploads.unshift({
    timestamp,
    score: typeof score === 'object' ? score.score : score,
    fileType: fileInfo.mimetype,
    fileName: fileInfo.originalname
  });
  
  // Keep only last 50 uploads
  if (stats.recentUploads.length > 50) {
    stats.recentUploads = stats.recentUploads.slice(0, 50);
  }
  
  // Save the updated stats
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));

  //console.log(`Stats updated: Total: ${stats.totalUsers}, Today: ${stats.dailyUsers[today]}`);
}
// Start the server
app.listen(port, () => {
  //console.log(`Server running on port ${port}`);
});