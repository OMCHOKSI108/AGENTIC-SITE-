const mongoose = require('mongoose');
const Agent = require('./models/Agent');
require('dotenv').config();

const agents = [
  // Cloud & DevOps Agents
  {
    name: "Cloud Cost Auditor",
    slug: "cloud_cost_agent",
    description: "Analyze AWS/Azure billing CSVs to find idle resources and wasted spend with CLI fix commands.",
    category: "automation",
    tags: ["cloud", "aws", "azure", "cost", "optimization", "billing"],
    ui_card: {
      title: "Cloud Cost Audit",
      short: "Upload billing CSV, get savings report with fix commands",
      inputs: [
        { name: "billing_file", type: "file", required: true }
      ],
      outputs: [
        { type: "text", preview: true }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: ["s3"],
        external_api: []
      },
      async_workers: false,
      queue: null
    },
    endpoints: {
      api: [
        { route: "/api/agents/cloud_cost_agent/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: true,
      memory_type: "persistent",
      retention_days: 365
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 5
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["file-upload", "cost-analysis", "cli-commands"],
      realtime: false
    },
    sample_prompt: "Analyze this AWS billing CSV and identify the top 3 cost optimization opportunities.",
    notes: {
      complexity_estimate: "medium",
      extra_steps: "Requires CSV parsing and cost analysis algorithms"
    }
  },
  {
    name: "CI/CD Pipeline Generator",
    slug: "cicd_agent",
    description: "Generate GitHub Actions workflows for any tech stack with build, test, and deploy stages.",
    category: "automation",
    tags: ["ci/cd", "github-actions", "deployment", "automation", "devops"],
    ui_card: {
      title: "CI/CD Generator",
      short: "Describe your stack, get complete workflow YAML",
      inputs: [
        { name: "project_description", type: "text", required: true }
      ],
      outputs: [
        { type: "text", preview: true }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: [],
        external_api: []
      },
      async_workers: false,
      queue: null
    },
    endpoints: {
      api: [
        { route: "/api/agents/cicd_agent/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: true,
      memory_type: "persistent",
      retention_days: 365
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 10
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["text-editor", "yaml-preview", "download"],
      realtime: false
    },
    sample_prompt: "Create a GitHub Actions workflow for a React app with Node.js backend deployed to AWS.",
    notes: {
      complexity_estimate: "medium",
      extra_steps: "Supports multiple CI/CD platforms and cloud providers"
    }
  },
  {
    name: "Log Anomaly Detective",
    slug: "log_anomaly_agent",
    description: "Analyze server logs to detect anomalies, identify root causes, and suggest fixes.",
    category: "automation",
    tags: ["logs", "monitoring", "debugging", "errors", "analysis"],
    ui_card: {
      title: "Log Analysis",
      short: "Paste error logs, get root cause analysis and fixes",
      inputs: [
        { name: "log_text", type: "text", required: true }
      ],
      outputs: [
        { type: "text", preview: true }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: [],
        external_api: []
      },
      async_workers: false,
      queue: null
    },
    endpoints: {
      api: [
        { route: "/api/agents/log_anomaly_agent/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: true,
      memory_type: "persistent",
      retention_days: 30
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 15
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["text-editor", "error-highlights", "fix-suggestions"],
      realtime: false
    },
    sample_prompt: "Analyze these server error logs and identify the root cause of the database connection issues.",
    notes: {
      complexity_estimate: "medium",
      extra_steps: "Supports multiple log formats and error patterns"
    }
  },
  {
    name: "Terraform Architect",
    slug: "terraform_agent",
    description: "Generate production-ready Terraform code for cloud infrastructure with best practices.",
    category: "automation",
    tags: ["terraform", "infrastructure", "cloud", "iac", "aws", "automation"],
    ui_card: {
      title: "Terraform Generator",
      short: "Describe infrastructure, get complete Terraform code",
      inputs: [
        { name: "infrastructure_description", type: "text", required: true }
      ],
      outputs: [
        { type: "text", preview: true }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: [],
        external_api: []
      },
      async_workers: false,
      queue: null
    },
    endpoints: {
      api: [
        { route: "/api/agents/terraform_agent/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: true,
      memory_type: "persistent",
      retention_days: 365
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 5
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["text-editor", "terraform-preview", "download"],
      realtime: false
    },
    sample_prompt: "Create Terraform code for a VPC with public/private subnets, security groups, and an RDS instance.",
    notes: {
      complexity_estimate: "high",
      extra_steps: "Supports AWS, Azure, and GCP with security best practices"
    }
  },
  {
    name: "Dockerizer Agent",
    slug: "dockerizer_agent",
    description: "Generate production-ready Dockerfiles and docker-compose.yml for any application.",
    category: "automation",
    tags: ["docker", "containerization", "deployment", "devops", "microservices"],
    ui_card: {
      title: "Docker Config Generator",
      short: "Input code/repo, get Dockerfile + docker-compose.yml",
      inputs: [
        { name: "repo_url", type: "text", required: false },
        { name: "code_snippet", type: "text", required: false }
      ],
      outputs: [
        { type: "text", preview: true }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: [],
        external_api: []
      },
      async_workers: false,
      queue: null
    },
    endpoints: {
      api: [
        { route: "/api/agents/dockerizer_agent/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: true,
      memory_type: "persistent",
      retention_days: 365
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 10
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["text-editor", "dockerfile-preview", "download"],
      realtime: false
    },
    sample_prompt: "Generate Docker configuration for a Node.js Express API with PostgreSQL database.",
    notes: {
      complexity_estimate: "medium",
      extra_steps: "Creates multi-stage builds with security best practices"
    }
  },

  // FinTech & Data Agents
  {
    name: "Trading Strategy Backtester",
    slug: "trading_backtester",
    description: "Backtest trading strategies with historical data, calculate ROI, drawdown, and win rates.",
    category: "finance",
    tags: ["trading", "backtesting", "finance", "analysis", "algorithms"],
    ui_card: {
      title: "Strategy Backtester",
      short: "Upload strategy + data, get performance metrics & simulation",
      inputs: [
        { name: "strategy_logic", type: "text", required: true },
        { name: "csv_data", type: "file", required: true }
      ],
      outputs: [
        { type: "text", preview: true }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: ["s3"],
        external_api: []
      },
      async_workers: true,
      queue: "redis"
    },
    endpoints: {
      api: [
        { route: "/api/agents/trading_backtester/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: true,
      memory_type: "persistent",
      retention_days: 365
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 3
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["text-editor", "file-upload", "performance-charts", "metrics"],
      realtime: false
    },
    sample_prompt: "Backtest a moving average crossover strategy on this historical stock data.",
    notes: {
      complexity_estimate: "high",
      extra_steps: "Requires pandas and technical analysis libraries"
    }
  },
  {
    name: "Crypto Sentiment Scout",
    slug: "crypto_sentiment_agent",
    description: "Analyze news headlines and social media to gauge cryptocurrency market sentiment.",
    category: "finance",
    tags: ["crypto", "sentiment", "news", "social-media", "trading"],
    ui_card: {
      title: "Crypto Sentiment Analysis",
      short: "Enter coin symbol, get sentiment analysis from news & Reddit",
      inputs: [
        { name: "coin_symbol", type: "text", required: true }
      ],
      outputs: [
        { type: "text", preview: true }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: [],
        external_api: ["news_api", "reddit_api"]
      },
      async_workers: true,
      queue: "redis"
    },
    endpoints: {
      api: [
        { route: "/api/agents/crypto_sentiment_agent/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: true,
      memory_type: "persistent",
      retention_days: 7
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 20
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["coin-input", "sentiment-gauge", "news-feed", "social-metrics"],
      realtime: true
    },
    sample_prompt: "Analyze sentiment for BTC in the last 24 hours across news and social media.",
    notes: {
      complexity_estimate: "medium",
      extra_steps: "Requires news API and social media monitoring"
    }
  },
  {
    name: "Auto EDA (Exploratory Data Analysis)",
    slug: "eda_agent",
    description: "Automated exploratory data analysis with interactive charts and data quality scoring.",
    category: "data",
    tags: ["data-analysis", "eda", "visualization", "statistics", "pandas"],
    ui_card: {
      title: "Auto EDA",
      short: "Upload CSV, get charts, correlations, and insights",
      inputs: [
        { name: "csv_upload", type: "file", required: true }
      ],
      outputs: [
        { type: "file", preview: true }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: ["s3"],
        external_api: []
      },
      async_workers: true,
      queue: "celery"
    },
    endpoints: {
      api: [
        { route: "/api/agents/eda_agent/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: true,
      memory_type: "persistent",
      retention_days: 365
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 5
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["file-upload", "chart-grid", "statistics-panel", "insights"],
      realtime: false
    },
    sample_prompt: "Perform exploratory data analysis on this dataset and identify key patterns and anomalies.",
    notes: {
      complexity_estimate: "high",
      extra_steps: "Requires pandas, matplotlib, seaborn, and plotly libraries"
    }
  },
  {
    name: "Smart SQL Generator",
    slug: "sql_generator",
    description: "Convert natural language questions to optimized SQL queries with explanations.",
    category: "data",
    tags: ["sql", "database", "query", "natural-language", "optimization"],
    ui_card: {
      title: "SQL Query Generator",
      short: "Describe what you need, get optimized SQL with explanation",
      inputs: [
        { name: "question", type: "text", required: true },
        { name: "schema", type: "text", required: true }
      ],
      outputs: [
        { type: "text", preview: true }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: [],
        external_api: []
      },
      async_workers: false,
      queue: null
    },
    endpoints: {
      api: [
        { route: "/api/agents/sql_generator/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: false,
      memory_type: "ephemeral",
      retention_days: 0
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 30
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["query-editor", "schema-input", "sql-preview", "explanation"],
      realtime: false
    },
    sample_prompt: "Generate SQL to find customers who spent more than $1000 in the last month.",
    notes: {
      complexity_estimate: "medium",
      extra_steps: "Supports PostgreSQL, MySQL, and SQL Server dialects"
    }
  },
  {
    name: "Financial Report Simplifier",
    slug: "financial_report_agent",
    description: "Extract key insights from earnings calls, 10-Ks, and financial reports.",
    category: "finance",
    tags: ["finance", "reports", "earnings", "analysis", "summarization"],
    ui_card: {
      title: "Financial Report Analyzer",
      short: "Upload PDF report, get key insights and simplified summary",
      inputs: [
        { name: "pdf_content", type: "text", required: true }
      ],
      outputs: [
        { type: "text", preview: true }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: ["s3"],
        external_api: []
      },
      async_workers: true,
      queue: "redis"
    },
    endpoints: {
      api: [
        { route: "/api/agents/financial_report_agent/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: true,
      memory_type: "persistent",
      retention_days: 365
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 5
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["file-upload", "report-summary", "key-metrics", "insights"],
      realtime: false
    },
    sample_prompt: "Analyze this earnings report and extract the key financial metrics and business highlights.",
    notes: {
      complexity_estimate: "medium",
      extra_steps: "Requires PDF parsing and financial document understanding"
    }
  },

  // Developer Tools Agents
  {
    name: "Code Doctor (Debugger + Security)",
    slug: "code_fix_agent",
    description: "Debug code, fix bugs, and perform security vulnerability checks.",
    category: "devtools",
    tags: ["debugging", "security", "code-review", "vulnerabilities", "fixing"],
    ui_card: {
      title: "Code Doctor",
      short: "Paste code, get bug fixes + security analysis",
      inputs: [
        { name: "code_snippet", type: "text", required: true },
        { name: "repo_url", type: "text", required: false }
      ],
      outputs: [
        { type: "text", preview: true }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: [],
        external_api: []
      },
      async_workers: false,
      queue: null
    },
    endpoints: {
      api: [
        { route: "/api/agents/code_fix_agent/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: false,
      memory_type: "ephemeral",
      retention_days: 0
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 15
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["code-editor", "issue-list", "security-alerts", "fix-suggestions"],
      realtime: false
    },
    sample_prompt: "Debug this Python function and check for security vulnerabilities like SQL injection.",
    notes: {
      complexity_estimate: "medium",
      extra_steps: "Supports multiple programming languages and security frameworks"
    }
  },
  {
    name: "API Documentation Generator",
    slug: "api_docs_agent",
    description: "Generate OpenAPI/Swagger specs and markdown documentation from code.",
    category: "devtools",
    tags: ["api", "documentation", "swagger", "openapi", "rest"],
    ui_card: {
      title: "API Docs Generator",
      short: "Upload code, get OpenAPI spec + documentation",
      inputs: [
        { name: "code_file", type: "text", required: true }
      ],
      outputs: [
        { type: "json", preview: true },
        { type: "text", preview: false }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: [],
        external_api: []
      },
      async_workers: false,
      queue: null
    },
    endpoints: {
      api: [
        { route: "/api/agents/api_docs_agent/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: true,
      memory_type: "persistent",
      retention_days: 365
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 10
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["code-editor", "openapi-preview", "markdown-docs", "download"],
      realtime: false
    },
    sample_prompt: "Generate OpenAPI specification and documentation for this Express.js API.",
    notes: {
      complexity_estimate: "medium",
      extra_steps: "Supports REST APIs, GraphQL, and WebSocket documentation"
    }
  },
  {
    name: "Readme.md Architect",
    slug: "readme_architect",
    description: "Generate professional README files with badges, installation, and documentation.",
    category: "devtools",
    tags: ["readme", "documentation", "github", "markdown", "project-setup"],
    ui_card: {
      title: "README Generator",
      short: "Enter repo URL, get professional README.md",
      inputs: [
        { name: "repo_url", type: "text", required: true }
      ],
      outputs: [
        { type: "text", preview: true }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: [],
        external_api: ["github_api"]
      },
      async_workers: false,
      queue: null
    },
    endpoints: {
      api: [
        { route: "/api/agents/readme_architect/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: true,
      memory_type: "persistent",
      retention_days: 365
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 10
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["url-input", "readme-preview", "download"],
      realtime: false
    },
    sample_prompt: "Generate a comprehensive README for this React project on GitHub.",
    notes: {
      complexity_estimate: "low",
      extra_steps: "Analyzes repository structure and tech stack automatically"
    }
  },
  {
    name: "Regex Generator & Explainer",
    slug: "regex_generator",
    description: "Create regular expressions with detailed explanations and test cases.",
    category: "devtools",
    tags: ["regex", "regular-expressions", "pattern-matching", "validation"],
    ui_card: {
      title: "Regex Generator",
      short: "Describe pattern, get regex + explanation + tests",
      inputs: [
        { name: "requirement", type: "text", required: true }
      ],
      outputs: [
        { type: "text", preview: true }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: [],
        external_api: []
      },
      async_workers: false,
      queue: null
    },
    endpoints: {
      api: [
        { route: "/api/agents/regex_generator/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: false,
      memory_type: "ephemeral",
      retention_days: 0
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 20
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["text-editor", "regex-preview", "test-cases", "explanation"],
      realtime: false
    },
    sample_prompt: "Create a regex to match email addresses but exclude Gmail addresses.",
    notes: {
      complexity_estimate: "low",
      extra_steps: "Provides examples in multiple programming languages"
    }
  },

  // Productivity Agents
  {
    name: "Legal Contract Auditor",
    slug: "contract_auditor",
    description: "Audit contracts for unfair clauses, non-standard terms, and negotiation points.",
    category: "enterprise",
    tags: ["legal", "contracts", "audit", "compliance", "negotiation"],
    ui_card: {
      title: "Contract Auditor",
      short: "Upload contract PDF, get clause analysis and red flags",
      inputs: [
        { name: "contract_content", type: "text", required: true }
      ],
      outputs: [
        { type: "text", preview: true }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: ["s3"],
        external_api: []
      },
      async_workers: true,
      queue: "redis"
    },
    endpoints: {
      api: [
        { route: "/api/agents/contract_auditor/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: true,
      memory_type: "persistent",
      retention_days: 365
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 3
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["file-upload", "clause-analysis", "risk-flags", "recommendations"],
      realtime: false
    },
    sample_prompt: "Audit this service agreement for unfair terms and suggest negotiation points.",
    notes: {
      complexity_estimate: "high",
      extra_steps: "Requires legal document analysis and contract law knowledge"
    }
  },
  {
    name: "Cold Outreach Writer",
    slug: "cold_outreach_agent",
    description: "Generate personalized cold emails by analyzing company websites and your offerings.",
    category: "marketing",
    tags: ["email", "outreach", "personalization", "sales", "marketing"],
    ui_card: {
      title: "Cold Email Generator",
      short: "Enter company URL + offer, get personalized outreach email",
      inputs: [
        { name: "company_url", type: "text", required: true },
        { name: "offer", type: "text", required: true }
      ],
      outputs: [
        { type: "text", preview: true }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: [],
        external_api: []
      },
      async_workers: false,
      queue: null
    },
    endpoints: {
      api: [
        { route: "/api/agents/cold_outreach_agent/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: true,
      memory_type: "persistent",
      retention_days: 30
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 15
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["url-input", "offer-editor", "email-preview", "personalization-notes"],
      realtime: false
    },
    sample_prompt: "Write a personalized cold email to this SaaS company about our API integration service.",
    notes: {
      complexity_estimate: "medium",
      extra_steps: "Analyzes company websites for personalization insights"
    }
  },
  {
    name: "Meeting Scribe (Voice Notes)",
    slug: "meet_scribe",
    description: "Transcribe audio recordings and extract action items, decisions, and summaries.",
    category: "productivity",
    tags: ["meetings", "transcription", "audio", "notes", "productivity"],
    ui_card: {
      title: "Meeting Scribe",
      short: "Upload audio, get transcript + action items + summary",
      inputs: [
        { name: "audio_file", type: "file", required: true }
      ],
      outputs: [
        { type: "text", preview: true }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: [],
        external_api: ["speech_to_text"]
      },
      async_workers: true,
      queue: "redis"
    },
    endpoints: {
      api: [
        { route: "/api/agents/meet_scribe/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: true,
      memory_type: "persistent",
      retention_days: 180
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 2
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["audio-player", "transcript", "action-items", "summary"],
      realtime: false
    },
    sample_prompt: "Transcribe this meeting recording and extract key decisions and action items.",
    notes: {
      complexity_estimate: "high",
      extra_steps: "Requires speech-to-text API and audio processing"
    }
  },
  {
    name: "Resume ATS Optimizer",
    slug: "resume_opt",
    description: "Optimize resumes for ATS systems and specific job descriptions.",
    category: "career",
    tags: ["resume", "ats", "job-search", "optimization", "career"],
    ui_card: {
      title: "Resume Optimizer",
      short: "Upload resume + JD, get ATS-optimized version",
      inputs: [
        { name: "resume_file", type: "file", required: true },
        { name: "job_description", type: "text", required: true }
      ],
      outputs: [
        { type: "file", preview: true }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: [],
        external_api: []
      },
      async_workers: false,
      queue: null
    },
    endpoints: {
      api: [
        { route: "/api/agents/resume_opt/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: true,
      memory_type: "persistent",
      retention_days: 365
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 5
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["file-upload", "jd-input", "optimized-preview", "ats-score"],
      realtime: false
    },
    sample_prompt: "Optimize this resume for a Senior Software Engineer position at Google.",
    notes: {
      complexity_estimate: "medium",
      extra_steps: "Includes keyword optimization and ATS compatibility analysis"
    }
  },
  {
    name: "YouTube Lecture Finder",
    slug: "youtube_finder",
    description: "Find highly-rated educational videos and lecture segments for any topic.",
    category: "content",
    tags: ["youtube", "education", "videos", "learning", "search"],
    ui_card: {
      title: "Lecture Finder",
      short: "Search topic, get top-rated educational video segments",
      inputs: [
        { name: "query", type: "text", required: true },
        { name: "limit", type: "number", required: false }
      ],
      outputs: [
        { type: "json", preview: true }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: [],
        external_api: ["youtube_api"]
      },
      async_workers: true,
      queue: "redis"
    },
    endpoints: {
      api: [
        { route: "/api/agents/youtube_finder/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: true,
      memory_type: "persistent",
      retention_days: 90
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 10
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["search-input", "video-results", "quality-filters", "download"],
      realtime: false
    },
    sample_prompt: "Find the best video lectures on dynamic programming for coding interviews.",
    notes: {
      complexity_estimate: "medium",
      extra_steps: "Requires YouTube API and video quality assessment algorithms"
    }
  },
  {
    name: "Knowledge Base Chat (RAG)",
    slug: "kb_agent",
    description: "Upload documents and chat with an AI that only answers based on your files.",
    category: "enterprise",
    tags: ["rag", "knowledge-base", "documents", "chat", "embeddings"],
    ui_card: {
      title: "Document Q&A",
      short: "Upload PDFs, ask questions answered only from your docs",
      inputs: [
        { name: "documents", type: "file", required: true }
      ],
      outputs: [
        { type: "text", preview: true }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: [],
        external_api: []
      },
      async_workers: true,
      queue: null
    },
    endpoints: {
      api: [
        { route: "/api/agents/kb_agent/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: true,
      memory_type: "persistent",
      retention_days: 365
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 20
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["file-upload", "chat-interface", "source-citations"],
      realtime: true
    },
    sample_prompt: "Based on these uploaded documents, what are our company policies on remote work?",
    notes: {
      complexity_estimate: "high",
      extra_steps: "Requires vector database and embedding models for RAG implementation"
    }
  },

  // The Flagship Agent
  {
    name: "n8n Architect & Auto-Debugger",
    slug: "n8n_architect",
    description: "Generates valid, error-checked n8n workflows with autonomous validation and visual preview.",
    category: "automation",
    tags: ["n8n", "workflow", "automation", "json", "validation", "low-code"],
    ui_card: {
      title: "n8n Workflow Builder",
      short: "AI-powered n8n workflow generator with auto-validation and visual preview",
      inputs: [
        { name: "goal", type: "text", required: true }
      ],
      outputs: [
        { type: "json", preview: true },
        { type: "file", preview: false }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4-turbo"],
        storage: ["s3"],
        external_api: []
      },
      async_workers: true,
      queue: "redis"
    },
    endpoints: {
      api: [
        { route: "/api/agents/n8n_architect/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: true,
      memory_type: "persistent",
      retention_days: 365
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 5
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["text-editor", "workflow-visualizer", "json-viewer", "download"],
      realtime: false
    },
    sample_prompt: "Create a workflow that monitors a Gmail inbox for invoice emails, extracts PDF attachments, uploads them to Google Drive, and sends a Slack notification with the file link.",
    notes: {
      complexity_estimate: "high",
      extra_steps: "Implements autonomous validation loop with up to 3 auto-fix retries"
    }
  },
  {
    name: "Code Fix Agent",
    slug: "code_fix_agent",
    description: "Analyze code for bugs, security issues, and optimization opportunities with detailed fixes.",
    category: "devtools",
    tags: ["code", "debugging", "security", "optimization", "review"],
    ui_card: {
      title: "Code Analyzer & Fixer",
      short: "Paste code or repo URL, get bug fixes and security recommendations",
      inputs: [
        { name: "code_snippet", type: "text", required: false },
        { name: "repo_url", type: "text", required: false }
      ],
      outputs: [
        { type: "text", preview: true }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: [],
        external_api: ["github_api"]
      },
      async_workers: false,
      queue: null
    },
    endpoints: {
      api: [
        { route: "/api/agents/code_fix_agent/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: true,
      memory_type: "persistent",
      retention_days: 180
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 10
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["code-editor", "issue-highlights", "fix-suggestions", "security-scan"],
      realtime: false
    },
    sample_prompt: "Analyze this JavaScript code for bugs and suggest improvements.",
    notes: {
      complexity_estimate: "medium",
      extra_steps: "Supports multiple programming languages and frameworks"
    }
  },
  {
    name: "Crypto Sentiment Scout",
    slug: "crypto_sentiment_agent",
    description: "Analyze cryptocurrency sentiment from news, social media, and market data.",
    category: "finance",
    tags: ["crypto", "sentiment", "analysis", "social-media", "trading"],
    ui_card: {
      title: "Crypto Sentiment Analyzer",
      short: "Enter crypto symbol, get sentiment analysis and trading insights",
      inputs: [
        { name: "coin_symbol", type: "text", required: true },
        { name: "timeframe", type: "select", required: false }
      ],
      outputs: [
        { type: "text", preview: true }
      ]
    },
    tooling: {
      tools_required: {
        llm: ["gpt-4o"],
        storage: [],
        external_api: ["crypto_apis", "social_media_apis"]
      },
      async_workers: true,
      queue: "redis"
    },
    endpoints: {
      api: [
        { route: "/api/agents/crypto_sentiment_agent/run", method: "POST", auth: "user" }
      ],
      websocket: false
    },
    persistence: {
      save_results: true,
      memory_type: "persistent",
      retention_days: 30
    },
    security: {
      auth_required: true,
      scopes: [],
      rate_limit_per_min: 20
    },
    ui_interactions: {
      page: "agent-detail",
      widgets: ["symbol-input", "sentiment-gauge", "news-feed", "trading-signals"],
      realtime: true
    },
    sample_prompt: "Analyze sentiment for Bitcoin over the last 24 hours.",
    notes: {
      complexity_estimate: "high",
      extra_steps: "Requires real-time data aggregation from multiple sources"
    }
  }
];

async function seedAgents() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/agentic-site', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing agents
    await Agent.deleteMany({});
    console.log('Cleared existing agents');

    // Insert new agents
    const insertedAgents = await Agent.insertMany(agents);
    console.log(`Seeded ${insertedAgents.length} agents`);

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding agents:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedAgents();