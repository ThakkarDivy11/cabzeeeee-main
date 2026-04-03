import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactDOM from "react-dom";

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hi! 👋 I'm CabZee AI Assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const location = useLocation();

    // The hiddenRoutes array
    const hiddenRoutes = ['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password', '/admin-login', '/admin/verification', '/'];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput("");
        
        // Add user message
        const updatedMessages = [...messages, { role: "user", content: userMessage }];
        setMessages(updatedMessages);
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
            
            const response = await fetch(`${apiUrl}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: userMessage,
                    history: updatedMessages.slice(-10) // Send last 10 messages for context
                })
            });

            const data = await response.json();

            if (data.success) {
                setMessages(prev => [...prev, { role: "assistant", content: data.data.reply }]);
            } else {
                setMessages(prev => [...prev, { 
                    role: "assistant", 
                    content: data.message || "Sorry, I'm having trouble responding right now. Please try again." 
                }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { 
                role: "assistant", 
                content: "⚠️ Cannot connect to AI service. Make sure the server and Ollama are running." 
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Hide chatbot on authentication pages (placed after all hooks to prevent React hook order errors)
    if (hiddenRoutes.includes(location.pathname)) {
        return null;
    }

    // Floating button + chat window rendered via portal
    return ReactDOM.createPortal(
        <>
            {/* Chat Window */}
            {isOpen && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "90px",
                        right: "24px",
                        width: "380px",
                        maxHeight: "520px",
                        zIndex: 99999,
                        borderRadius: "24px",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.25), 0 8px 20px rgba(0,0,0,0.15)",
                        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            background: "linear-gradient(135deg, #001F3F 0%, #003366 100%)",
                            padding: "18px 20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "14px",
                                    background: "rgba(255,255,255,0.15)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "18px",
                                }}
                            >
                                🤖
                            </div>
                            <div>
                                <div style={{ color: "white", fontWeight: 800, fontSize: "15px", letterSpacing: "-0.01em" }}>
                                    CabZee AI
                                </div>
                                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                    Powered by Mistral
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: "rgba(255,255,255,0.1)",
                                border: "none",
                                color: "white",
                                width: "32px",
                                height: "32px",
                                borderRadius: "10px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "18px",
                                transition: "background 0.2s",
                            }}
                            onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.2)"}
                            onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.1)"}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "16px",
                            background: "#F8F7F4",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                            maxHeight: "350px",
                            minHeight: "280px",
                        }}
                    >
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: "80%",
                                        padding: "12px 16px",
                                        borderRadius: msg.role === "user"
                                            ? "18px 18px 4px 18px"
                                            : "18px 18px 18px 4px",
                                        background: msg.role === "user"
                                            ? "linear-gradient(135deg, #001F3F, #003366)"
                                            : "white",
                                        color: msg.role === "user" ? "white" : "#001F3F",
                                        fontSize: "13.5px",
                                        lineHeight: "1.5",
                                        fontWeight: 500,
                                        boxShadow: msg.role === "user"
                                            ? "0 2px 8px rgba(0,31,63,0.2)"
                                            : "0 1px 4px rgba(0,0,0,0.08)",
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                    }}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                <div
                                    style={{
                                        background: "white",
                                        padding: "14px 20px",
                                        borderRadius: "18px 18px 18px 4px",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                                        display: "flex",
                                        gap: "6px",
                                        alignItems: "center",
                                    }}
                                >
                                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#001F3F", opacity: 0.3, animation: "chatDot 1.4s infinite ease-in-out", animationDelay: "0s" }}></span>
                                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#001F3F", opacity: 0.3, animation: "chatDot 1.4s infinite ease-in-out", animationDelay: "0.2s" }}></span>
                                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#001F3F", opacity: 0.3, animation: "chatDot 1.4s infinite ease-in-out", animationDelay: "0.4s" }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div
                        style={{
                            padding: "12px 16px",
                            background: "white",
                            borderTop: "1px solid rgba(0,31,63,0.06)",
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                        }}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: "12px 16px",
                                border: "2px solid rgba(0,31,63,0.08)",
                                borderRadius: "16px",
                                fontSize: "13.5px",
                                fontWeight: 500,
                                fontFamily: "inherit",
                                outline: "none",
                                background: "#F8F7F4",
                                color: "#001F3F",
                                transition: "border-color 0.2s, background 0.2s",
                            }}
                            onFocus={e => { e.target.style.borderColor = "#001F3F"; e.target.style.background = "white"; }}
                            onBlur={e => { e.target.style.borderColor = "rgba(0,31,63,0.08)"; e.target.style.background = "#F8F7F4"; }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            style={{
                                width: "44px",
                                height: "44px",
                                borderRadius: "14px",
                                border: "none",
                                background: loading || !input.trim() ? "rgba(0,31,63,0.1)" : "#001F3F",
                                color: "white",
                                cursor: loading || !input.trim() ? "default" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.2s",
                                flexShrink: 0,
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: "fixed",
                    bottom: "24px",
                    right: "24px",
                    width: "60px",
                    height: "60px",
                    borderRadius: "20px",
                    border: "none",
                    background: "linear-gradient(135deg, #001F3F 0%, #003366 100%)",
                    color: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                    zIndex: 99999,
                    boxShadow: "0 8px 32px rgba(0,31,63,0.35)",
                    transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s",
                    transform: isOpen ? "rotate(180deg) scale(0.9)" : "rotate(0) scale(1)",
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,31,63,0.5)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,31,63,0.35)"}
            >
                {isOpen ? "✕" : "💬"}
            </button>

            {/* Keyframe animation for typing dots */}
            <style>{`
                @keyframes chatDot {
                    0%, 80%, 100% { opacity: 0.3; transform: scale(1); }
                    40% { opacity: 1; transform: scale(1.2); }
                }
            `}</style>
        </>,
        document.body
    );
};

export default ChatBot;