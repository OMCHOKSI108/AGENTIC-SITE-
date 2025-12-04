import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineDatabase, AiOutlineCode, AiOutlineCheckCircle, AiOutlineCopy, AiOutlinePlayCircle } from 'react-icons/ai';
import { FiDatabase, FiCode, FiCopy, FiPlay } from 'react-icons/fi';
import Button from '../../components/ui/Button';

const SQLGeneratorInterface = ({ agent, onRun }) => {
  const [question, setQuestion] = useState('');
  const [schema, setSchema] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const sampleSchemas = [
    {
      name: 'E-commerce Database',
      schema: `users (id, name, email, created_at)
orders (id, user_id, total_amount, status, created_at)
products (id, name, price, category, stock_quantity)
order_items (id, order_id, product_id, quantity, price)`
    },
    {
      name: 'Employee Management',
      schema: `employees (id, name, department, salary, hire_date)
departments (id, name, manager_id)
projects (id, name, budget, start_date, end_date)
employee_projects (employee_id, project_id, hours_worked)`
    },
    {
      name: 'Student Records',
      schema: `students (id, name, email, enrollment_year)
courses (id, name, credits, department)
enrollments (student_id, course_id, grade, semester)
professors (id, name, department, email)`
    }
  ];

  const sampleQuestions = [
    'Find all customers who spent more than $1000 in the last month',
    'Show me the top 5 best-selling products by revenue',
    'List all employees in the Engineering department with their project assignments',
    'Find students who failed more than 2 courses',
    'Calculate the average order value by month for the past year'
  ];

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleRun = async () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }
    if (!schema.trim()) {
      setError('Please provide a database schema');
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('question', question.trim());
      formData.append('schema', schema.trim());

      const response = await onRun(formData);
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const formatSQLResult = (result) => {
    if (!result || !result.output) return null;

    const data = result.output;

    if (!data.success) {
      return (
        <div className="text-center text-red-500">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">SQL Generation Failed</h3>
          <p className="text-[var(--text)]">{data.error || result.output.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Success Message */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
            <AiOutlineCheckCircle className="w-4 h-4" />
            <span className="font-semibold">SQL Query Generated Successfully</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400">
            Optimized SQL query created for your natural language question
          </p>
        </div>

        {/* Generated SQL */}
        {data.sql && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text)] flex items-center gap-2">
                <FiCode className="w-5 h-5 text-blue-500" />
                Generated SQL Query
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(data.sql)}
                  className="flex items-center gap-1"
                >
                  <FiCopy className="w-3 h-3" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                {data.sql}
              </pre>
            </div>
          </div>
        )}

        {/* Explanation */}
        {data.explanation && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineDatabase className="w-5 h-5 text-purple-500" />
              Query Explanation
            </h3>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="text-[var(--text)] leading-relaxed whitespace-pre-wrap">
                {data.explanation}
              </div>
            </div>
          </div>
        )}

        {/* Alternative Approaches */}
        {data.alternatives && data.alternatives.length > 0 && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineCode className="w-5 h-5 text-orange-500" />
              Alternative Approaches ({data.alternatives.length})
            </h3>
            <div className="space-y-4">
              {data.alternatives.map((alt, index) => (
                <motion.div
                  key={index}
                  className="border border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-[var(--text)]">{alt.approach}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(alt.sql)}
                      className="text-xs"
                    >
                      Copy SQL
                    </Button>
                  </div>
                  <div className="bg-gray-900 rounded p-3 mb-2 overflow-x-auto">
                    <pre className="text-green-400 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                      {alt.sql}
                    </pre>
                  </div>
                  <p className="text-sm text-[var(--muted)]">{alt.explanation}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Notes */}
        {data.performance_notes && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
              <span>⚡</span>
              Performance Considerations
            </h3>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap">
              {data.performance_notes}
            </div>
          </div>
        )}

        {/* Test Data */}
        {data.sample_data && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlinePlayCircle className="w-5 h-5 text-green-500" />
              Sample Query Results
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                {data.sample_data}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Input Panel */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <FiDatabase className="w-7 h-7 text-blue-500" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Convert natural language questions to optimized SQL queries
          </p>
        </div>

        {/* Question Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Your Question *
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Find all customers who spent more than $1000 in the last month"
            rows={3}
            className="w-full p-4 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.slice(0, 3).map((sample, index) => (
              <button
                key={index}
                onClick={() => setQuestion(sample)}
                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Schema Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Database Schema *
          </label>
          <textarea
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            placeholder={`users (id, name, email, created_at)
orders (id, user_id, total_amount, status, created_at)
products (id, name, price, category, stock_quantity)`}
            rows={8}
            className="w-full p-4 bg-[var(--surface)] border border-[var(--muted)] rounded-lg text-[var(--text)] focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
          />
          <p className="text-xs text-[var(--muted)]">
            Describe your database tables and columns. Include table names and their column definitions.
          </p>

          {/* Sample Schemas */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--text)]">Quick Start Templates:</p>
            <div className="flex flex-wrap gap-2">
              {sampleSchemas.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => setSchema(sample.schema)}
                  className="text-xs px-3 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/30 transition-colors"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Run Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={handleRun}
            loading={running}
            disabled={running || !question.trim() || !schema.trim()}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {running ? (
              <div className="flex items-center gap-3">
                <FiCode className="w-5 h-5 animate-spin" />
                <span>Generating SQL...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <FiCode className="w-5 h-5" />
                <span>Generate SQL Query</span>
              </div>
            )}
          </Button>
        </motion.div>
      </motion.div>

      {/* Output Panel */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--text)] flex items-center gap-3">
            <AiOutlineCode className="w-7 h-7 text-blue-500" />
            SQL Query Results
          </h2>
          {result && result.output?.success && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const sql = result.output.sql || '';
                  const explanation = result.output.explanation || '';
                  const combined = sql + '\n\n/* ' + explanation + ' */';
                  copyToClipboard(combined);
                }}
              >
                Copy All
              </Button>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] rounded-xl p-6 min-h-96 border border-blue-500/10 shadow-lg overflow-y-auto">
          {running ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <FiDatabase className="w-16 h-16 text-blue-500" />
              </motion.div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[var(--text)] mb-2">
                  Analyzing your question...
                </div>
                <div className="flex justify-center gap-1 mb-4">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                  />
                </div>
                <p className="text-sm text-[var(--muted)] text-center">
                  AI is understanding your natural language question and generating optimized SQL with explanations
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">SQL Generation Failed</h3>
              <p className="text-[var(--text)] mb-4">{error}</p>
              <Button onClick={handleRun} variant="outline">
                Try Again
              </Button>
            </div>
          ) : result ? (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                  <AiOutlineCheckCircle className="w-4 h-4" />
                  <span className="font-semibold">SQL Query Ready</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Optimized SQL query generated for your question
                </p>
              </div>
              {formatSQLResult(result)}
            </motion.div>
          ) : (
            <div className="text-center text-[var(--muted)] flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <FiDatabase className="w-20 h-20 text-blue-500/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                Ready to Generate SQL
              </h3>
              <p className="text-lg mb-4 max-w-sm">
                Ask questions in plain English and get optimized SQL queries with detailed explanations
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  🔍 Natural Language
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  ⚡ Optimized Queries
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  📚 Multiple Dialects
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  🎯 Performance Tips
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SQLGeneratorInterface;