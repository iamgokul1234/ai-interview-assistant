import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "../redux/store";
import { logout } from "../redux/slices/authSlice";
import {
  setConversations,
  addConversation,
  setCurrentConversation,
  setMessages,
  addMessage,
  deleteConversationFromStore,
} from "../redux/slices/chatSlice";
import {
  createConversationAPI,
  getConversationsAPI,
  getMessagesAPI,
  sendMessageAPI,
  deleteConversationAPI,
} from "../services/chatService";
import ReactMarkdown from "react-markdown";

function ChatPage() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { conversations, currentConversation, messages } = useSelector(
    (state: RootState) => state.chat,
  );

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (id) loadMessages(id);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const data = await getConversationsAPI(token as string);
      dispatch(setConversations(data));
    } catch (err) {
      console.error("Failed to load conversations");
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const conv = conversations.find((c) => c._id === conversationId);
      if (conv) dispatch(setCurrentConversation(conv));
      const data = await getMessagesAPI(token as string, conversationId);
      dispatch(setMessages(data));
    } catch (err) {
      console.error("Failed to load messages");
    }
  };

  const handleNewChat = async () => {
    try {
      const data = await createConversationAPI(
        token as string,
        "New Conversation",
      );
      dispatch(addConversation(data));
      dispatch(setCurrentConversation(data));
      dispatch(setMessages([]));
      navigate(`/chat/${data._id}`);
      setSidebarOpen(false);
    } catch (err) {
      console.error("Failed to create conversation");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !currentConversation || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");
    try {
      const data = await sendMessageAPI(
        token as string,
        currentConversation._id,
        content,
      );
      dispatch(addMessage(data.userMessage));
      dispatch(addMessage(data.aiMessage));
      await loadConversations();
    } catch (err) {
      console.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (conversationId: string) => {
    try {
      await deleteConversationAPI(token as string, conversationId);
      dispatch(deleteConversationFromStore(conversationId));
      if (id === conversationId) navigate("/chat");
    } catch (err) {
      console.error("Failed to delete conversation");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
    setSidebarOpen(false);
  };

  return (
    <div className="chat-container">
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <p className="sidebar-title">AI Interview Assistant</p>

        <button className="btn-new-chat" onClick={handleNewChat}>
          + New Chat
        </button>

        <div className="conversations-list">
          {conversations.map((conv) => (
            <div
              key={conv._id}
              className={`conversation-item ${currentConversation?._id === conv._id ? "active" : ""}`}
              onClick={() => handleConversationClick(conv._id)}
            >
              <span className="conversation-title">{conv.title}</span>
              <button
                className="btn-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(conv._id);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <span className="user-name">{user?.name}</span>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Header */}
        <div className="chat-header">
          <button className="btn-menu" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <h6 className="chat-header-title">
            {currentConversation
              ? currentConversation.title
              : "AI Interview Assistant"}
          </h6>
        </div>

        {/* Messages */}
        <div className="messages-container">
          {!currentConversation && (
            <div className="welcome-screen">
              <h2 className="welcome-title">Welcome, {user?.name}!</h2>
              <p className="welcome-subtitle">
                Start a new chat to begin your interview preparation.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg._id} className={`message-row ${msg.role}`}>
              <div className={`message-bubble ${msg.role}`}>
                {msg.role === "user" ? (
                  msg.content
                ) : (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                )}
              </div>
            </div>
          ))}

          {sending && (
            <div className="message-row assistant">
              <div className="typing-indicator">AI is thinking...</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              className="chat-input"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask an interview question..."
              disabled={!currentConversation || sending}
            />
            <button
              className="btn-send"
              onClick={handleSend}
              disabled={!currentConversation || sending || !input.trim()}
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
