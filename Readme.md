# Resume ATS Scorer

A minimalist web application that allows users to upload their resumes and receive an ATS (Applicant Tracking System) compatibility score.

## Features

- Resume upload (PDF, DOC, DOCX formats)
- ATS compatibility scoring
- Visual score representation with color-coded indicators
- Resume preview
- Detailed recommendations for improvement

## Tech Stack

- **Frontend**: React.js with a minimalist design
- **Backend**: Node.js with Express
- **File Processing**: pdf-parse for PDFs, mammoth for Word documents
- **AI Integration**: Claude API for resume analysis

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Claude API key

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd resume-ats-scorer
   ```

2. Install backend dependencies
   ```
   cd server
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   ANTHROPIC_API_KEY=your_claude_api_key_here
   PORT=5000
   ```

4. Install frontend dependencies
   ```
   cd ../client
   npm install
   ```

### Running the Application

1. Start the backend server
   ```
   cd server
   npm start
   ```

2. In a new terminal, start the frontend development server
   ```
   cd client
   npm start
   ```

3. Open your browser and navigate to http://localhost:3000

## Usage

1. Upload your resume using the drag-and-drop interface or file selector
2. Wait for the analysis to complete
3. View your ATS compatibility score and recommendations
4. Make improvements to your resume based on the suggestions

## License

MIT

## Acknowledgements

- Claude API by Anthropic for AI-powered resume analysis
- React.js for the frontend framework
- Express.js for the backend API