import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';
    const [copiedContent, setCopiedContent] = useState(false);

    const handleCopy = (content) => {
        navigator.clipboard.writeText(content);
        setCopiedContent(true);
        setTimeout(() => setCopiedContent(false), 2000);
    };

    return (
        <div className={`message-wrapper ${isUser ? 'user' : 'assistant'}`}>
            <div className="message-avatar">
                {isUser ? 'U' : 'Ω'}
            </div>
            <div className="message-content">
                {isUser ? (
                    <p>{message.content}</p>
                ) : (
                    <ReactMarkdown
                        components={{
                            code({node, inline, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '')
                                const codeContent = String(children).replace(/\n$/, '');
                                
                                return !inline && match ? (
                                    <div className="code-block-container">
                                        <div className="code-block-header">
                                            <span className="lang-label">{match[1]}</span>
                                            <button 
                                                className="copy-code-btn" 
                                                onClick={() => handleCopy(codeContent)}
                                                title="Copy code"
                                            >
                                                {copiedContent ? <Check size={14} /> : <Copy size={14} />}
                                                {copiedContent ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                        <SyntaxHighlighter
                                            {...props}
                                            children={codeContent}
                                            style={vscDarkPlus}
                                            language={match[1]}
                                            PreTag="div"
                                            customStyle={{
                                                margin: 0,
                                                borderTopLeftRadius: 0,
                                                borderTopRightRadius: 0,
                                                borderBottomLeftRadius: '8px',
                                                borderBottomRightRadius: '8px',
                                                background: '#1e1e1e'
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <code {...props} className={className}>
                                        {children}
                                    </code>
                                )
                            }
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
