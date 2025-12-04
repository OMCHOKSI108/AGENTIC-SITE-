import { useState, useEffect } from 'react';
import { agentApi } from '../utils/api';

export const useAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const response = await agentApi.getAgents();
        setAgents(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch agents');
        console.error('Error fetching agents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  return { agents, loading, error, refetch: () => fetchAgents() };
};

export const useAgent = (id) => {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchAgent = async () => {
      try {
        setLoading(true);
        const response = await agentApi.getAgent(id);
        setAgent(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch agent details');
        console.error('Error fetching agent:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id]);

  return { agent, loading, error };
};

export const useRunAgent = () => {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runAgent = async (id, data) => {
    try {
      setRunning(true);
      setError(null);
      const response = await agentApi.runAgent(id, data);
      setResult(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to run agent');
      console.error('Error running agent:', err);
      throw err;
    } finally {
      setRunning(false);
    }
  };

  return { runAgent, running, result, error };
};