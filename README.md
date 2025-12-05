# AI Agents Platform

A comprehensive platform for AI-powered agents built with React, Express.js, and MongoDB. This platform provides specialized AI agents across multiple domains including data analysis, development tools, finance, content creation, and automation.

## 🎯 Domain Coverage

This AI agent platform covers the following key domains:

- **Data Science & Analytics**: Automated exploratory data analysis, SQL query generation, data visualization, statistical analysis
- **Software Development**: Code debugging, security analysis, Docker containerization, regex pattern generation, API documentation, README generation
- **DevOps & Infrastructure**: CI/CD pipeline generation, Terraform infrastructure code, Docker configuration, log analysis, cloud cost optimization
- **Finance & Trading**: Financial report analysis, cryptocurrency sentiment analysis, trading strategy backtesting, market insights
- **Enterprise & Productivity**: Document Q&A systems, knowledge base management, meeting transcription, contract auditing, resume optimization
- **Content & Education**: Educational video discovery, content creation, research assistance, learning resources
- **Marketing & Sales**: Cold outreach email generation, personalized communication, sales automation
- **Automation & Workflow**: n8n workflow generation, process automation, business workflow optimization

## 🤖 Available AI Agents (status)

The project includes 21 backend agents (see `backend/seedAgents.js`). The table below shows which agents currently have a dedicated frontend interface component in `frontend/src/agents/interfaces/` and the backend AI integration status.

| Agent Name | Slug | Frontend Interface | Backend AI Integration |
|---|---:|:---:|:---|
| Cloud Cost Auditor | `cloud_cost_agent` | Missing (no dedicated interface) | Backend implemented (requires API keys)
| CI/CD Pipeline Generator | `cicd_agent` | Missing | Backend implemented (requires API keys)
| Log Anomaly Detective | `log_anomaly_agent` | Missing | Backend implemented (requires API keys)
| Terraform Architect | `terraform_agent` | Missing | Backend implemented (requires API keys)
| Dockerizer Agent | `dockerizer_agent` | Implemented (`DockerizerInterface.jsx`) | Backend implemented (LLM calls require API keys)
| Trading Strategy Backtester | `trading_backtester` | Missing | Backend implemented (requires data & keys)
| Crypto Sentiment Scout | `crypto_sentiment_agent` | Implemented (`CryptoSentimentInterface.jsx`) | Backend implemented (external APIs + LLM keys)
| Auto EDA (Exploratory Data Analysis) | `eda_agent` | Implemented (`EDAAgentInterface.jsx`) | Backend implemented (async workers; requires libraries & keys)
| Smart SQL Generator | `sql_generator` | Implemented (`SQLGeneratorInterface.jsx`) | Backend implemented (ephemeral; uses LLM)
| Financial Report Simplifier | `financial_report_agent` | Implemented (`FinancialReportInterface.jsx`) | Backend implemented (PDF parsing + LLM)
| Code Doctor (Debugger + Security) | `code_fix_agent` | Implemented (`CodeFixAgentInterface.jsx` / `CodeFixInterface.jsx`) | Backend implemented (sandboxed for some agents)
| API Documentation Generator | `api_docs_agent` | Missing | Backend implemented (generates OpenAPI/Markdown)
| Readme.md Architect | `readme_architect` | Missing | Backend implemented (README generation)
| Regex Generator & Explainer | `regex_generator` | Implemented (`RegexGeneratorInterface.jsx`) | Backend implemented (LLM)
| Legal Contract Auditor | `contract_auditor` | Missing | Backend implemented (document analysis + LLM)
| Cold Outreach Writer | `cold_outreach_agent` | Implemented (`EmailComposerInterface.jsx`) | Backend implemented (LLM + web scraping optional)
| Meeting Scribe (Voice Notes) | `meet_scribe` | Implemented (`MeetingScribeInterface.jsx`) | Backend implemented (speech-to-text + LLM)
| Resume ATS Optimizer | `resume_opt` | Implemented (`ResumeOptimizerInterface.jsx`) | Backend implemented (LLM)
| YouTube Lecture Finder | `youtube_finder` | Implemented (`YouTubeFinderInterface.jsx`) | Backend implemented (YouTube API + LLM)
| Knowledge Base Chat (RAG) | `kb_agent` | Implemented (`KnowledgeBaseInterface.jsx`) | Backend implemented (embeddings + vector DB + LLM)
| n8n Architect & Auto-Debugger | `n8n_architect` | Implemented (`WorkflowBuilderInterface.jsx`) | Backend implemented (workflow generation + validation)

Notes:
- "Implemented" means a dedicated React component exists in `frontend/src/agents/interfaces/` that provides a tailored UI. If an agent is marked "Missing", a backend agent definition exists but there is no dedicated frontend file — those agents fall back to the generic agent runner UI.
- Backend AI Integration indicates the backend agent implementation exists under `backend/agents/` (seeded in `backend/seedAgents.js`) and will call configured LLMs or external APIs — you must set API keys in `backend/.env` for full functionality.

If you'd like, I can:
- create placeholder interface components for the missing 8 agents so each agent has a unique UI scaffold, or
- implement full UIs and wire them to the backend one-by-one (I can propose an implementation order).

## 🏗️ Architecture

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: TailwindCSS with custom dark/light theme system
- **Icons**: Heroicons (no emojis)
- **Animations**: Framer Motion
- **State Management**: React Context API

### Backend
- **Framework**: Express.js with Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT-based auth system
- **AI Integration**: Gemini, Groq, and OpenAI APIs
- **File Handling**: Multer for file uploads

### Key Features
- **Theme System**: CSS variables for consistent dark/light mode
- **Authentication**: User registration, login, and protected routes
- **Agent Gallery**: Public browsing with SaaS-style previews
- **Agent Execution**: Interactive panels for running agents
- **Database Logging**: User activity tracking and token consumption monitoring
- **User Settings**: Token usage statistics and account management
- **Responsive Design**: Mobile-first approach with accessibility

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/omchoksi108/agentic-site-.git
   cd agentic-site-
   ```

2. **Backend Setup**
   ```bash
   cd backend

   # Install dependencies
   npm install

   # Set up environment variables
   cp .env.example .env
   # Edit .env with your MongoDB connection string and API keys

   # Seed the database with agents
   npm run seed

   # Start the backend server
   npm run dev
   ```
   The backend will start on `http://localhost:5000`

3. **Frontend Setup** (in a new terminal)
   ```bash
   cd frontend

   # Install dependencies
   npm install

   # Set up environment variables (if needed)
   cp .env.example .env

   # Start the development server
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

### Environment Configuration

Create `.env` files in both `backend/` and `frontend/` directories:

**Backend (.env):**
```env
MONGODB_URI=mongodb://localhost:27017/agentic-site
JWT_SECRET=your-jwt-secret-key
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key
PORT=5000
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🧪 Testing the Platform

1. **Register/Login**: Create an account or login to access agents
2. **Browse Agents**: Visit the dashboard to see all available agents
3. **Try an Agent**: Click on any agent to access its specialized interface
4. **Monitor Usage**: Check your settings page for token usage statistics

## 📊 Agent Usage Examples

### Data Analysis with EDA Agent
1. Upload a CSV file containing sales data
2. Get automated insights, correlations, and visualizations
3. Download processed results with statistical analysis

### Code Debugging with Code Doctor
1. Paste problematic code or provide repository URL
2. Receive bug fixes, security recommendations, and code improvements
3. Apply suggested changes directly in your development environment

### Financial Analysis with Financial Report Simplifier
1. Upload financial reports or earnings PDFs
2. Extract key metrics, trends, and business insights
3. Get simplified summaries for quick decision making

### Infrastructure Automation with Terraform Architect
1. Describe your cloud infrastructure requirements
2. Generate production-ready Terraform code
3. Deploy infrastructure with best practices and security

### Workflow Automation with n8n Architect
1. Describe your business process or automation need
2. Get validated n8n workflow with error checking
3. Deploy automated workflows with visual preview

### Educational Content Discovery with YouTube Lecture Finder
1. Search for specific topics or subjects
2. Get ranked educational video recommendations
3. Access high-quality learning resources and lectures

## 🔧 Development

### Agent Development
Each agent follows a standardized structure:
- **Specification**: JSON config with inputs, outputs, tooling requirements
- **Implementation**: Backend controller with API endpoints
- **UI Components**: Frontend panels for specialized interactions
- **Testing**: Unit and integration tests

### Adding New Agents
1. Define agent specification in `backend/seedAgents.js`
2. Implement backend logic in `backend/agents/`
3. Create frontend interface in `frontend/src/agents/interfaces/`
4. Update routing in `backend/routes/agents.js`

## 🚢 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Production Considerations
- Environment-specific configurations
- Secure API key management
- Database connection pooling
- Rate limiting and security middleware

## 🤝 Contributing

1. Follow the established code style and architecture
2. Add tests for new features
3. Update documentation for agent specifications
4. Ensure theme compatibility and accessibility
5. Test agents thoroughly before submitting

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For questions or issues, please check the GitHub repository or create an issue.
