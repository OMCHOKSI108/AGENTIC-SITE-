import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AiOutlineUser, AiOutlineKey, AiOutlineBell, AiOutlineSafety, AiOutlineMoon, AiOutlineSun, AiOutlineGlobal, AiOutlineSetting, AiOutlineBarChart } from 'react-icons/ai';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || '',
    number: user?.number || ''
  });
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    agentCompletions: true,
    weeklyReports: false,
    marketingEmails: false
  });
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [userLogs, setUserLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      alert('Profile updated successfully!');
    }, 1000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully!');
    }, 1000);
  };

  const handleNotificationUpdate = async () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      alert('Notification preferences updated!');
    }, 1000);
  };

  const fetchUserLogs = async () => {
    if (!isAuthenticated()) return;
    
    setLogsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch user logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'usage' && isAuthenticated()) {
      fetchUserLogs();
    }
  }, [activeTab, isAuthenticated]);

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <AiOutlineUser className="w-24 h-24 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
            Please sign in to access settings
          </h2>
          <Button onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: AiOutlineUser },
    { id: 'usage', label: 'Usage & Tokens', icon: AiOutlineBarChart },
    { id: 'security', label: 'Security', icon: AiOutlineSafety },
    { id: 'notifications', label: 'Notifications', icon: AiOutlineBell },
    { id: 'appearance', label: 'Appearance', icon: theme === 'dark' ? AiOutlineMoon : AiOutlineSun },
    { id: 'api', label: 'API Keys', icon: AiOutlineKey }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-[var(--text)] mb-2">
            Settings
          </h1>
          <p className="text-[var(--text)] text-lg">
            Manage your account preferences and settings
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-[var(--surface)] rounded-xl shadow-lg p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-[var(--text)] hover:bg-[var(--muted)]'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-[var(--surface)] rounded-xl shadow-lg p-8">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
                    Profile Information
                  </h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Full Name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                      <Input
                        label="Username"
                        value={profileData.username}
                        onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                        required
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                      <Input
                        label="Phone Number"
                        value={profileData.number}
                        onChange={(e) => setProfileData(prev => ({ ...prev, number: e.target.value }))}
                      />
                    </div>
                    <Button type="submit" variant="primary" loading={saving}>
                      Save Changes
                    </Button>
                  </form>
                </div>
              )}

              {/* Usage & Tokens Settings */}
              {activeTab === 'usage' && (
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
                    Usage Statistics & Token Consumption
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3 mb-2">
                        <AiOutlineBarChart className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">Total Tokens Used</h3>
                      </div>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                        {user?.tokensUsed?.toLocaleString() || '0'}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        Lifetime consumption
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3 mb-2">
                        <AiOutlineSetting className="w-6 h-6 text-green-600" />
                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">Total Runs</h3>
                      </div>
                      <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                        {user?.totalRuns?.toLocaleString() || '0'}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Agent executions
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-3 mb-2">
                        <AiOutlineUser className="w-6 h-6 text-purple-600" />
                        <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">Member Since</h3>
                      </div>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                        {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
                      </p>
                      <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                        Account created
                      </p>
                    </div>
                  </div>

                  <div className="bg-[var(--bg)] rounded-lg p-6 border border-[var(--muted)]">
                    <h3 className="text-lg font-semibold text-[var(--text)] mb-4">
                      Recent Activity
                    </h3>
                    {logsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-[var(--muted)]">Loading activity...</p>
                      </div>
                    ) : userLogs.length > 0 ? (
                      <div className="space-y-3">
                        {userLogs.slice(0, 5).map((log, index) => (
                          <div key={index} className="flex items-center justify-between py-3 border-b border-[var(--muted)] last:border-b-0">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <AiOutlineSetting className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-[var(--text)]">Agent Execution</p>
                                <p className="text-sm text-[var(--muted)]">
                                  {log.agentName} • {new Date(log.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-[var(--text)]">{log.tokensUsed} tokens</p>
                              <p className={`text-sm ${log.success ? 'text-green-600' : 'text-red-600'}`}>
                                {log.success ? 'Success' : 'Failed'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AiOutlineBarChart className="w-12 h-12 mx-auto mb-4 text-[var(--muted)]" />
                        <p className="text-[var(--muted)]">No activity yet</p>
                        <p className="text-sm text-[var(--muted)] mt-1">Start using agents to see your activity here</p>
                      </div>
                    )}
                    
                    {userLogs.length > 5 && (
                      <div className="mt-6 text-center">
                        <p className="text-sm text-[var(--muted)]">
                          Showing 5 of {userLogs.length} activities • View all in dashboard
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
                    Change Password
                  </h2>
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <Input
                      label="Current Password"
                      type="password"
                      value={security.currentPassword}
                      onChange={(e) => setSecurity(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                    />
                    <Input
                      label="New Password"
                      type="password"
                      value={security.newPassword}
                      onChange={(e) => setSecurity(prev => ({ ...prev, newPassword: e.target.value }))}
                      required
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={security.confirmPassword}
                      onChange={(e) => setSecurity(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                    <Button type="submit" variant="primary" loading={saving}>
                      Change Password
                    </Button>
                  </form>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
                    Notification Preferences
                  </h2>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-[var(--bg)] rounded-lg">
                        <div>
                          <h3 className="font-medium text-[var(--text)]">Email Updates</h3>
                          <p className="text-sm text-[var(--muted)]">Receive updates about new features and improvements</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.emailUpdates}
                            onChange={(e) => setNotifications(prev => ({ ...prev, emailUpdates: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-[var(--bg)] rounded-lg">
                        <div>
                          <h3 className="font-medium text-[var(--text)]">Agent Completions</h3>
                          <p className="text-sm text-[var(--muted)]">Get notified when your agent runs complete</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.agentCompletions}
                            onChange={(e) => setNotifications(prev => ({ ...prev, agentCompletions: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-[var(--bg)] rounded-lg">
                        <div>
                          <h3 className="font-medium text-[var(--text)]">Weekly Reports</h3>
                          <p className="text-sm text-[var(--muted)]">Receive weekly usage reports and insights</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.weeklyReports}
                            onChange={(e) => setNotifications(prev => ({ ...prev, weeklyReports: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-[var(--bg)] rounded-lg">
                        <div>
                          <h3 className="font-medium text-[var(--text)]">Marketing Emails</h3>
                          <p className="text-sm text-[var(--muted)]">Receive promotional emails and special offers</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.marketingEmails}
                            onChange={(e) => setNotifications(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                    <Button onClick={handleNotificationUpdate} variant="primary" loading={saving}>
                      Save Preferences
                    </Button>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
                    Appearance Settings
                  </h2>
                  <div className="space-y-6">
                    <div className="p-6 bg-[var(--bg)] rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-[var(--text)] mb-1">Theme</h3>
                          <p className="text-sm text-[var(--muted)]">Choose your preferred theme</p>
                        </div>
                        <Button
                          onClick={toggleTheme}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          {theme === 'dark' ? (
                            <>
                              <AiOutlineSun className="w-4 h-4" />
                              Light Mode
                            </>
                          ) : (
                            <>
                              <AiOutlineMoon className="w-4 h-4" />
                              Dark Mode
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* API Keys Settings */}
              {activeTab === 'api' && (
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
                    API Keys & Integrations
                  </h2>
                  <div className="space-y-6">
                    <div className="p-6 bg-[var(--bg)] rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-[var(--text)]">Personal API Key</h3>
                          <p className="text-sm text-[var(--muted)]">Use this key to access the Agentic API</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Generate New Key
                        </Button>
                      </div>
                      <div className="bg-[var(--surface)] p-3 rounded border font-mono text-sm text-[var(--text)]">
                        agt_••••••••••••••••••••••••••••••••
                      </div>
                      <p className="text-xs text-[var(--muted)] mt-2">
                        Keep this key secure and never share it publicly
                      </p>
                    </div>

                    <div className="p-6 bg-[var(--bg)] rounded-lg">
                      <h3 className="font-medium text-[var(--text)] mb-4">Connected Services</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-[var(--surface)] rounded">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                              <AiOutlineGlobal className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-[var(--text)]">Google Gemini</span>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Connected
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[var(--surface)] rounded">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
                              <AiOutlineKey className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-[var(--text)]">Groq AI</span>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Connected
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;