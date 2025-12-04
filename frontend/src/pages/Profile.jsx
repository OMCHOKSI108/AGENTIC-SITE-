import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AiOutlineUser, AiOutlineCalendar, AiOutlineMail, AiOutlinePhone, AiOutlineCheckCircle, AiOutlineBarChart, AiOutlineCloud, AiOutlineClockCircle } from 'react-icons/ai';
import Button from '../components/ui/Button.jsx';
import Loader from '../components/ui/Loader.jsx';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalRuns: 0,
    favoriteAgents: [],
    joinDate: null,
    lastActive: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      // Simulate loading user stats - in real app, this would come from API
      setTimeout(() => {
        setStats({
          totalRuns: 47,
          favoriteAgents: ['content-summarizer', 'code-generator', 'data-analyzer'],
          joinDate: user?.createdAt || new Date('2024-01-15'),
          lastActive: new Date()
        });
        setLoading(false);
      }, 1000);
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <AiOutlineUser className="w-24 h-24 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
            Please sign in to view your profile
          </h2>
          <Button onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Loader size="lg" text="Loading your profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="bg-[var(--surface)] rounded-xl shadow-lg p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-3xl">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[var(--text)] mb-2">
                Welcome back, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-[var(--text)] text-lg">
                Manage your account and explore your AI agent usage
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <motion.div
            className="lg:col-span-2 space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Personal Information */}
            <div className="bg-[var(--surface)] rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[var(--text)] mb-6 flex items-center gap-2">
                <AiOutlineUser className="w-6 h-6" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">
                      Full Name
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-lg">
                      <AiOutlineCheckCircle className="w-5 h-5 text-primary" />
                      <span className="text-[var(--text)]">{user?.name}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">
                      Username
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-lg">
                      <AiOutlineUser className="w-5 h-5 text-primary" />
                      <span className="text-[var(--text)]">@{user?.username}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-lg">
                      <AiOutlineMail className="w-5 h-5 text-primary" />
                      <span className="text-[var(--text)]">{user?.email}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1">
                      Phone Number
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-lg">
                      <AiOutlinePhone className="w-5 h-5 text-primary" />
                      <span className="text-[var(--text)]">{user?.number || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Activity */}
            <div className="bg-[var(--surface)] rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[var(--text)] mb-6 flex items-center gap-2">
                <AiOutlineBarChart className="w-6 h-6" />
                Account Activity
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-[var(--bg)] rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stats.totalRuns}
                  </div>
                  <div className="text-sm text-[var(--muted)]">
                    Total Agent Runs
                  </div>
                </div>
                <div className="text-center p-4 bg-[var(--bg)] rounded-lg">
                  <div className="text-3xl font-bold text-green-500 mb-2">
                    {stats.favoriteAgents.length}
                  </div>
                  <div className="text-sm text-[var(--muted)]">
                    Favorite Agents
                  </div>
                </div>
                <div className="text-center p-4 bg-[var(--bg)] rounded-lg">
                  <div className="text-3xl font-bold text-blue-500 mb-2">
                    {Math.floor(stats.totalRuns / 7)}
                  </div>
                  <div className="text-sm text-[var(--muted)]">
                    Weekly Average
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Account Status */}
            <div className="bg-[var(--surface)] rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-[var(--text)] mb-4">
                Account Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text)]">Plan</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    Free
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text)]">Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text)]">Member Since</span>
                  <span className="text-[var(--text)] text-sm">
                    {stats.joinDate?.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Favorite Agents */}
            <div className="bg-[var(--surface)] rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2">
                <AiOutlineCloud className="w-5 h-5" />
                Favorite Agents
              </h3>
              {stats.favoriteAgents.length > 0 ? (
                <div className="space-y-3">
                  {stats.favoriteAgents.map((agent, index) => (
                    <motion.div
                      key={agent}
                      className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-lg hover:bg-[var(--muted)] cursor-pointer transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => window.location.href = `/agents/${agent}`}
                    >
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {agent.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[var(--text)] capitalize">
                        {agent.replace('-', ' ')}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--muted)] text-sm">
                  No favorite agents yet. Start using agents to build your favorites!
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-[var(--surface)] rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-[var(--text)] mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/settings'}
                >
                  <AiOutlineUser className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/agents'}
                >
                  <AiOutlineCloud className="w-4 h-4 mr-2" />
                  Browse Agents
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;