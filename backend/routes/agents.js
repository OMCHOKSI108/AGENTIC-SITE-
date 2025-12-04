const express = require('express');
const Agent = require('../models/Agent');
const User = require('../models/User');
const AgentLog = require('../models/AgentLog');
const auth = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow CSV, PDF, and other common file types
    const allowedTypes = [
      'text/csv',
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'audio/mpeg',
      'audio/wav',
      'audio/m4a'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
  }
});

// Get all agents (public)
router.get('/', async (req, res) => {
  try {
    const agents = await Agent.find({ isActive: true })
      .select('name slug description category tags ui_card rating usageCount responseTime')
      .sort({ usageCount: -1 });
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single agent by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const agent = await Agent.findOne({ slug: req.params.slug, isActive: true });
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Optional auth middleware (for logged in users)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId);
      
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};

// Run agent (with optional auth and rate limiting)
router.post('/:slug/run', optionalAuth, rateLimit, upload.any(), async (req, res) => {
  try {
    const agent = await Agent.findOne({ slug: req.params.slug, isActive: true });
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Sandbox mode: Allow 1 free run for top 3 agents without login
    const sandboxAgents = ['resume_opt', 'code_fix_agent', 'sql_generator'];
    const isSandboxMode = !req.user && sandboxAgents.includes(req.params.slug);

    if (!req.user && !isSandboxMode) {
      return res.status(401).json({
        message: 'Authentication required',
        sandbox_available: sandboxAgents
      });
    }

    // Load the actual agent implementation
    let agentInstance;
    try {
      agentInstance = require(`../agents/${req.params.slug}`);
    } catch (error) {
      console.error(`Agent ${req.params.slug} not implemented yet:`, error);
      return res.status(501).json({
        message: 'Agent implementation not available yet',
        error: 'This agent is still under development'
      });
    }

    // Prepare input data, including uploaded files
    const input = { ...req.body };
    
    // Add uploaded files to input, grouping by fieldname
    if (req.files && req.files.length > 0) {
      const fileGroups = {};
      req.files.forEach(file => {
        if (!fileGroups[file.fieldname]) {
          fileGroups[file.fieldname] = [];
        }
        fileGroups[file.fieldname].push(file.path);
      });
      
      // For fields with single file, keep as string; for multiple, keep as array
      Object.entries(fileGroups).forEach(([fieldname, paths]) => {
        input[fieldname] = paths.length === 1 ? paths[0] : paths;
      });
    }

    // Execute the agent with the provided input
    const startTime = Date.now();
    const result = await agentInstance.run(input);
    const executionTime = Date.now() - startTime;

    // Update agent usage statistics and user token count (only for authenticated users)
    if (req.user) {
      // Update user token usage
      const tokensUsed = Math.ceil(result.cost * 1000) || 1; // Convert cost to token count
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { tokensUsed: tokensUsed, totalRuns: 1 },
        $set: { lastActivity: new Date() }
      });

      // Update agent usage count
      await Agent.findOneAndUpdate(
        { slug: req.params.slug },
        {
          $inc: { usageCount: 1 },
          lastUsed: new Date()
        }
      );

      // Log the agent usage
      await AgentLog.create({
        userId: req.user._id,
        agentSlug: req.params.slug,
        agentName: agent.name,
        input: input,
        output: result.output,
        tokensUsed: tokensUsed,
        cost: result.cost || 0,
        executionTime: executionTime,
        success: result.success,
        error: result.error,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });
    }

    // Standardize response format for all agents
    const standardizedResponse = {
      status: result.success ? 'success' : 'error',
      output: result.output || result.markdown || '',
      files: result.files || [],
      meta: {
        cost: result.cost || 0,
        time_ms: result.time_ms || Date.now() - new Date().getTime(),
        agent_slug: req.params.slug,
        timestamp: new Date().toISOString()
      }
    };

    // Include error details if failed
    if (!result.success) {
      standardizedResponse.error = result.error || 'Unknown error occurred';
    }

    // For sandbox mode, limit output to first 50% or show preview
    if (isSandboxMode && result.success) {
      const fullOutput = standardizedResponse.output;
      const previewLength = Math.floor(fullOutput.length * 0.5);
      standardizedResponse.output = fullOutput.substring(0, previewLength) + '\n\n---\n*Login to see full results*';
      standardizedResponse.sandbox_mode = true;
      standardizedResponse.upgrade_prompt = 'Create an account to unlock unlimited access to all agents!';
    }

    res.json(standardizedResponse);
  } catch (error) {
    console.error('Agent execution error:', error);
    res.status(500).json({
      message: 'Agent execution failed',
      error: error.message
    });
  }
});

// Admin routes (protected with admin scope)
router.post('/', auth, async (req, res) => {
  try {
    const agent = new Agent(req.body);
    await agent.save();
    res.status(201).json(agent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:slug', auth, async (req, res) => {
  try {
    const agent = await Agent.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true }
    );
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:slug', auth, async (req, res) => {
  try {
    const agent = await Agent.findOneAndDelete({ slug: req.params.slug });
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json({ message: 'Agent deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;