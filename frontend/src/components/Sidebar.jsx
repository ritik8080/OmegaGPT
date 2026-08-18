import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import OmegaLogo from './OmegaLogo';
import { PlusCircle, MessageSquare, Trash2, Settings, Menu, LogOut } from 'lucide-react';

const Sidebar = () => {
    const { threads, currentThreadId, selectThread, deleteThread, createNewChat, sidebarOpen, setSidebarOpen } = useContext(ChatContext);
    const { user, logout } = useContext(AuthContext);

    return (
        <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-brand">
                <OmegaLogo size={28} />
                <h2>OmegaGPT</h2>
            </div>
            
            <div className="sidebar-header">
                <button className="new-chat-btn" onClick={createNewChat}>
                    <PlusCircle size={20} />
                    <span>New Chat</span>
                </button>
                <button className="toggle-btn-mobile" onClick={() => setSidebarOpen(false)}>
                    <Menu size={20} />
                </button>
            </div>

            <div className="threads-list">
                {threads.map((thread) => (
                    <div 
                        key={thread.threadId} 
                        className={`thread-item ${currentThreadId === thread.threadId ? 'active' : ''}`}
                        onClick={() => selectThread(thread.threadId)}
                    >
                        <MessageSquare size={18} className="thread-icon" />
                        <span className="thread-title">{thread.title || 'New Chat'}</span>
                        <button 
                            className="delete-thread-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteThread(thread.threadId);
                            }}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="sidebar-footer">
                <div className="footer-item" style={{ flex: 1 }}>
                    <Settings size={18} />
                    <span>{user?.username || 'Settings'}</span>
                </div>
                <div className="footer-item" onClick={logout} style={{ color: '#ef4444' }}>
                    <LogOut size={18} />
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
