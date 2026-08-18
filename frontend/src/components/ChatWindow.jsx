import { useContext, useState, useRef, useEffect } from 'react';
import { ChatContext } from '../context/ChatContext';
import MessageBubble from './MessageBubble';
import OmegaLogo from './OmegaLogo';
import { Send, Menu, Eraser, Settings2 } from 'lucide-react';
import { ScaleLoader } from 'react-spinners';

const ChatWindow = () => {
    const { 
        messages, setMessages, currentThreadId, fetchThreads, 
        sidebarOpen, setSidebarOpen, API_URL, clearMessages, systemPrompt, setSystemPrompt
    } = useContext(ChatContext);
    
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isStreaming]);

    const handleSend = async () => {
        if (!input.trim() || !currentThreadId) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsStreaming(true);

        // Add a temporary assistant message that will be populated via stream
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        try {
            const token = localStorage.getItem('omegagpt_token');
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ message: userMessage.content, threadId: currentThreadId })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let assistantReply = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '');
                        if (dataStr === '[DONE]') {
                            break;
                        }
                        try {
                            const data = JSON.parse(dataStr);
                            assistantReply += data.content;
                            
                            // Update the last message (the assistant's reply)
                            setMessages(prev => {
                                const newMessages = [...prev];
                                newMessages[newMessages.length - 1].content = assistantReply;
                                return newMessages;
                            });
                        } catch (err) {
                            console.error('Error parsing SSE data', err);
                        }
                    }
                }
            }
            fetchThreads(); // Refresh thread titles if it's a new chat
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = 'Error generating response. Please try again.';
                return newMessages;
            });
        } finally {
            setIsStreaming(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-window">
            <div className="chat-header">
                <button className="toggle-sidebar-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <Menu size={24} />
                </button>
                <h2>OmegaGPT</h2>
                <div className="header-actions">
                    <button className="action-btn" onClick={clearMessages} title="Clear Messages">
                        <Eraser size={20} />
                    </button>
                    <button className="action-btn" onClick={() => setShowSettings(!showSettings)} title="Thread Settings">
                        <Settings2 size={20} />
                    </button>
                </div>
            </div>

            {showSettings && (
                <div className="thread-settings">
                    <label>System Prompt (Persona):</label>
                    <textarea 
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        placeholder="e.g., You are a senior React developer."
                    />
                </div>
            )}

            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <OmegaLogo size={80} />
                        <h1>How can I help you today?</h1>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <MessageBubble key={index} message={msg} />
                    ))
                )}
                {isStreaming && messages.length > 0 && messages[messages.length - 1].content === '' && (
                     <div className="loading-indicator">
                        <ScaleLoader color="#8b5cf6" height={15} />
                     </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
                <div className="input-wrapper">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Message OmegaGPT..."
                        rows="1"
                    />
                    <button 
                        className={`send-btn ${input.trim() ? 'active' : ''}`} 
                        onClick={handleSend}
                        disabled={!input.trim() || isStreaming}
                    >
                        <Send size={18} />
                    </button>
                </div>
                <p className="footer-text">OmegaGPT can make mistakes. Consider verifying important information.</p>
            </div>
        </div>
    );
};

export default ChatWindow;
