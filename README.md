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

## 🤖 Available AI Agents

| Agent Name | Category | Description | Use Cases | Complexity |
|------------|----------|-------------|-----------|------------|
| **Cloud Cost Auditor** | DevOps | Analyze AWS/Azure billing CSVs to find idle resources and wasted spend with CLI fix commands | Cloud cost optimization, resource analysis, billing review | Medium |
| **CI/CD Pipeline Generator** | DevOps | Generate GitHub Actions workflows for any tech stack with build, test, and deploy stages | Automated deployment, CI/CD setup, workflow generation | Medium |
| **Log Anomaly Detective** | DevOps | Analyze server logs to detect anomalies, identify root causes, and suggest fixes | Log analysis, error detection, system monitoring | Medium |
| **Terraform Architect** | DevOps | Generate production-ready Terraform code for cloud infrastructure with best practices | Infrastructure as code, cloud provisioning, IaC generation | High |
| **Dockerizer Agent** | DevOps | Generate production-ready Dockerfiles and docker-compose.yml for any application | Containerization, deployment configuration, microservices setup | Medium |
| **Trading Strategy Backtester** | Finance | Backtest trading strategies with historical data, calculate ROI, drawdown, and win rates | Trading analysis, strategy validation, risk assessment | High |
| **Crypto Sentiment Scout** | Finance | Analyze news headlines and social media to gauge cryptocurrency market sentiment | Crypto trading, market analysis, sentiment tracking | Medium |
| **Auto EDA (Exploratory Data Analysis)** | Data Science | Automated exploratory data analysis with interactive charts and data quality scoring | Data exploration, statistical analysis, visualization | High |
| **Smart SQL Generator** | Data Science | Convert natural language questions to optimized SQL queries with explanations | Database querying, data extraction, query optimization | Medium |
| **Financial Report Simplifier** | Finance | Extract key insights from earnings calls, 10-Ks, and financial reports | Financial analysis, report summarization, investment research | Medium |
| **Code Doctor (Debugger + Security)** | Development | Debug code, fix bugs, and perform security vulnerability checks | Code review, debugging, security analysis | Medium |
| **API Documentation Generator** | Development | Generate OpenAPI/Swagger specs and markdown documentation from code | API documentation, specification generation, developer tools | Medium |
| **Readme.md Architect** | Development | Generate professional README files with badges, installation, and documentation | Project documentation, README generation, open source setup | Low |
| **Regex Generator & Explainer** | Development | Create regular expressions with detailed explanations and test cases | Pattern matching, data validation, text processing | Low |
| **Legal Contract Auditor** | Enterprise | Audit contracts for unfair clauses, non-standard terms, and negotiation points | Contract review, legal analysis, compliance checking | High |
| **Cold Outreach Writer** | Marketing | Generate personalized cold emails by analyzing company websites and your offerings | Sales outreach, email marketing, personalization | Medium |
| **Meeting Scribe (Voice Notes)** | Productivity | Transcribe audio recordings and extract action items, decisions, and summaries | Meeting notes, transcription, productivity tools | High |
| **Resume ATS Optimizer** | Career | Optimize resumes for ATS systems and specific job descriptions | Job applications, resume optimization, career development | Medium |
| **YouTube Lecture Finder** | Education | Find highly-rated educational videos and lecture segments for any topic | Learning resources, educational content discovery | Medium |
| **Knowledge Base Chat (RAG)** | Enterprise | Upload documents and chat with an AI that only answers based on your files | Document Q&A, knowledge management, research assistance | High |
| **n8n Architect & Auto-Debugger** | Automation | Generates valid, error-checked n8n workflows with autonomous validation and visual preview | Workflow automation, process automation, no-code solutions | High |

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
