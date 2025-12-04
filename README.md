# AI Agents Platform

A comprehensive platform for AI-powered agents built with React, Express.js, and MongoDB.

## Available Agents

| Agent Name | Slug | Category | Description | Complexity | Folder Location |
|------------|------|----------|-------------|------------|-----------------|
| Content Summarizer | news_summarizer | content | Summarize long articles / PDFs into short TL;DR, bullets and key quotes | low | `backend/agents/news_summarizer/` |
| YouTube Video Finder | youtube_finder | content | Find, rank and download lecture videos from playlists or search queries | medium | `backend/agents/youtube_finder/` |
| Email Composer | email_gen | productivity | Generate professional emails: meeting notes, supplier invites, follow-ups | low | `backend/agents/email_gen/` |
| EDA & Insights | eda_agent | data | Run automated exploratory data analysis from CSV or DB table | high | `backend/agents/eda_agent/` |
| Code Assistant | code_fix_agent | devtools | Explain, debug, and propose fixes for code snippets or repos | medium | `backend/agents/code_fix_agent/` |
| Meeting Scribe | meet_scribe | productivity | Transcribe audio/zoom recordings, summarize action items, create tasks | high | `backend/agents/meet_scribe/` |
| SEO Writer | seo_writer | marketing | Generate blog posts optimized for given keyword and meta tags | medium | `backend/agents/seo_writer/` |
| Image Designer | image_gen_agent | creative | Generate or edit images from prompts and user-uploaded images | medium | `backend/agents/image_gen_agent/` |
| Market Watch | market_watch | finance | Fetch live market data, compute indicators, and send signals/alerts | high | `backend/agents/market_watch/` |
| Knowledge Base | kb_agent | enterprise | Ingest docs, create embeddings, answer queries and cite source pages | high | `backend/agents/kb_agent/` |
| Workflow Builder | workflow_builder | automation | Automate sequences: trigger->action chains (e.g., email on new file) | high | `backend/agents/workflow_builder/` |
| Resume Optimizer | resume_opt | career | Rewrite resume for a target job description and output ATS-friendly format | medium | `backend/agents/resume_opt/` |
| UX Audit | ux_audit | design | Analyze UI screenshots or URLs for accessibility, layout, and heuristics | medium | `backend/agents/ux_audit/` |
| Personal Assistant | personal_agent | assistant | Multi-purpose assistant: calendar, notes, reminders, small workflows | high | `backend/agents/personal_agent/` |

## Architecture

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
- **API**: RESTful endpoints for agent operations

### Key Features
- **Theme System**: CSS variables for consistent dark/light mode
- **Authentication**: User registration, login, and protected routes
- **Agent Gallery**: Public browsing with SaaS-style previews
- **Agent Execution**: Interactive panels for running agents
- **Responsive Design**: Mobile-first approach with accessibility

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agentic-site
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Set up environment variables**
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Configure MongoDB connection, JWT secrets, and API keys

5. **Start the development servers**
   ```bash
   # Backend (from backend directory)
   npm run dev

   # Frontend (from frontend directory)
   npm run dev
   ```

## Development

### Frontend Development
- Uses Vite for fast development and building
- TailwindCSS for styling with custom theme variables
- ESLint for code quality
- Component-based architecture with reusable UI components

### Backend Development
- Express.js server with middleware
- MongoDB for data persistence
- JWT authentication
- Modular agent implementations

### Agent Development
Each agent follows a standardized structure:
- **Specification**: YAML/JSON config with inputs, outputs, tooling
- **Implementation**: Backend controller with API endpoints
- **UI Components**: Frontend panels for interaction
- **Testing**: Unit and integration tests

## Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Environment Configuration
- Production builds optimize for performance
- Environment-specific configurations
- Secure API key management

## Contributing

1. Follow the established code style and architecture
2. Add tests for new features
3. Update documentation for agent specifications
4. Ensure theme compatibility and accessibility

## License

This project is licensed under the MIT License.
