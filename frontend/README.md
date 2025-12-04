# Agentic Frontend

A modern React frontend for the Agentic AI platform, built with cutting-edge web technologies.

## 🚀 Features

- **Modern UI/UX**: Clean, professional design with Amazon-inspired color scheme
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Mode**: Theme toggle with system preference detection
- **Smooth Animations**: Framer Motion powered micro-interactions
- **Agent Management**: Browse, filter, and run AI agents
- **Real-time Streaming**: Live output from agent executions

## 🛠 Tech Stack

- **React 19** - Latest React with modern hooks
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

## 🎨 Design System

### Colors
- Primary: `#FF9900` (Amazon Orange)
- Dark Gray: `#232F3E` (Amazon Dark)
- Light Gray: `#F2F3F3` (Amazon Light)

### Typography
- Font: Inter (Google Fonts)
- Responsive text scaling
- Consistent spacing and hierarchy

## 📁 Project Structure

```
frontend/
  src/
    components/
      layout/          # Header, Sidebar, Footer
      ui/              # Reusable UI components
    pages/             # Route components
    agents/            # Agent-specific components
    context/           # React context providers
    hooks/             # Custom React hooks
    utils/             # Helper functions and constants
    App.jsx            # Main app component
    main.jsx           # App entry point
```

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend root:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### TailwindCSS
Custom configuration in `tailwind.config.js` with:
- Amazon color palette
- Inter font family
- Responsive breakpoints

## 📱 Pages & Components

### Pages
- **Home**: Landing page with hero section and features
- **Agents**: Agent discovery with filtering and search
- **AgentDetails**: Individual agent interface with run panel

### Key Components
- **Header**: Navigation with theme toggle
- **Sidebar**: Category filtering (mobile responsive)
- **AgentCard**: Agent preview with hover animations
- **AgentRunPanel**: Full agent execution interface
- **Button/Input/Loader**: Reusable UI primitives

## 🎭 Animations

- **Framer Motion** for smooth transitions
- **Staggered animations** for lists and grids
- **Hover effects** on interactive elements
- **Loading states** with skeleton screens
- **Page transitions** between routes

## 🔌 API Integration

- **Axios** for HTTP requests
- **JWT authentication** with automatic token handling
- **Error boundaries** for graceful error handling
- **Loading states** for better UX

## 📱 Responsive Design

- **Mobile-first** approach
- **Breakpoint system**: sm/md/lg/xl
- **Flexible layouts** with CSS Grid and Flexbox
- **Touch-friendly** interactions

## 🌙 Theme System

- **Context-based** theme management
- **localStorage** persistence
- **System preference** detection
- **CSS custom properties** for dynamic theming

## 🚀 Performance

- **Code splitting** with React.lazy
- **Image optimization** with modern formats
- **Bundle analysis** for optimization
- **Lazy loading** for components

## 🧪 Development

- **ESLint** for code quality
- **Hot reload** during development
- **TypeScript ready** (optional migration)
- **Component library** approach for reusability

## 📈 Future Enhancements

- Real-time agent status updates
- Advanced filtering and sorting
- Agent comparison tools
- User dashboard and history
- Collaborative features
- Plugin system for custom agents

---

Built with ❤️ for the AI-powered future.
