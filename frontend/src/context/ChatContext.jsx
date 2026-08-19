import { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from './AuthContext';

export const ChatContext = createContext();

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export const ChatProvider = ({ children }) => {
    const [threads, setThreads] = useState([]);
    const [currentThreadId, setCurrentThreadId] = useState('');
    const [messages, setMessages] = useState([]);
    const [systemPrompt, setSystemPrompt] = useState('You are a helpful and intelligent assistant.');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [threadsLoaded, setThreadsLoaded] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const { token } = useContext(AuthContext);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('omegagpt_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const fetchThreads = async () => {
        try {
            const res = await fetch(`${API_URL}/threads`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setThreads(data);
            } else {
                setThreads([]);
            }
        } catch (error) {
            console.error('Failed to fetch threads:', error);
        } finally {
            setThreadsLoaded(true);
        }
    };

    useEffect(() => {
        if (token) {
            setThreadsLoaded(false);
            fetchThreads();
        } else {
            setThreads([]);
            setThreadsLoaded(false);
        }
    }, [token]);

    const fetchThreadMessages = async (threadId) => {
        try {
            const res = await fetch(`${API_URL}/threads/${threadId}`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            setMessages(data.messages || []);
            if (data.systemPrompt) setSystemPrompt(data.systemPrompt);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const createNewChat = () => {
        setCurrentThreadId(uuidv4());
        setMessages([]);
        setSystemPrompt('You are a helpful and intelligent assistant.');
    };

    const selectThread = (threadId) => {
        setCurrentThreadId(threadId);
        fetchThreadMessages(threadId);
    };

    const deleteThread = async (threadId) => {
        try {
            await fetch(`${API_URL}/threads/${threadId}`, { 
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            setThreads(prev => prev.filter(t => t.threadId !== threadId));
            if (currentThreadId === threadId) {
                createNewChat();
            }
        } catch (error) {
            console.error('Failed to delete thread:', error);
        }
    };

    const clearMessages = async () => {
        if (!currentThreadId) return;
        try {
            await fetch(`${API_URL}/threads/${currentThreadId}/messages`, { 
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            setMessages([]);
        } catch (error) {
            console.error('Failed to clear messages:', error);
        }
    };

    return (
        <ChatContext.Provider value={{
            threads, currentThreadId, setCurrentThreadId, messages, setMessages,
            systemPrompt, setSystemPrompt, loading, setLoading,
            fetchThreads, createNewChat, selectThread, deleteThread, clearMessages,
            sidebarOpen, setSidebarOpen, API_URL, threadsLoaded
        }}>
            {children}
        </ChatContext.Provider>
    );
};
