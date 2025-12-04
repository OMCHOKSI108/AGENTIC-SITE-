// API endpoints
export const API_ENDPOINTS = {
  AGENTS: '/agents',
  AGENT_DETAILS: (id) => `/agents/${id}`,
  RUN_AGENT: (id) => `/agents/${id}/run`,
};

// Agent categories with display names
export const AGENT_CATEGORIES = [
  { value: 'All', label: 'All Agents' },
  { value: 'content', label: 'Content' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'data', label: 'Data & Analytics' },
  { value: 'devtools', label: 'Developer Tools' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'creative', label: 'Creative' },
  { value: 'finance', label: 'Finance' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'automation', label: 'Automation' },
  { value: 'career', label: 'Career' },
  { value: 'design', label: 'Design' },
  { value: 'assistant', label: 'Assistant' }
];

// Animation variants for Framer Motion
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 },
  },
  slideIn: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.5 },
  },
};

// Color palette
export const COLORS = {
  primary: '#FF9900',
  darkGray: '#232F3E',
  lightGray: '#F2F3F3',
};