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
  deleteMessagesFromAPI,
} from "../services/chatService";
import ReactMarkdown from "react-markdown";

function ChatPage() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { conversations, currentConversation, messages } = useSelector(
    (state: RootState) => state.chat
  );

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
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
        "New Conversation"
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
    if (!input.trim() || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");
    try {
      let conversationId = currentConversation?._id;

      if (!conversationId) {
        const newConv = await createConversationAPI(
          token as string,
          "New Conversation"
        );
        dispatch(addConversation(newConv));
        dispatch(setCurrentConversation(newConv));
        dispatch(setMessages([]));
        conversationId = newConv._id;
        navigate(`/chat/${newConv._id}`);
      }

      const data = await sendMessageAPI(
        token as string,
        conversationId as string,
        content
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

  const handleRetry = async (messageId: string, content: string) => {
    if (!currentConversation || sending) return;
    setSending(true);
    try {
      await deleteMessagesFromAPI(
        token as string,
        currentConversation._id,
        messageId
      );
      const freshMessages = await getMessagesAPI(
        token as string,
        currentConversation._id
      );
      dispatch(setMessages(freshMessages));

      const data = await sendMessageAPI(
        token as string,
        currentConversation._id,
        content
      );
      dispatch(addMessage(data.userMessage));
      dispatch(addMessage(data.aiMessage));
      await loadConversations();
    } catch (err) {
      console.error("Failed to retry message");
    } finally {
      setSending(false);
    }
  };

  const handleEditStart = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
  };

  const handleEditConfirm = async () => {
    if (!editingMessageId || !editingContent.trim() || !currentConversation || sending) return;
    setSending(true);
    const content = editingContent.trim();
    setEditingMessageId(null);
    setEditingContent("");
    try {
      await deleteMessagesFromAPI(
        token as string,
        currentConversation._id,
        editingMessageId
      );
      const freshMessages = await getMessagesAPI(
        token as string,
        currentConversation._id
      );
      dispatch(setMessages(freshMessages));

      const data = await sendMessageAPI(
        token as string,
        currentConversation._id,
        content
      );
      dispatch(addMessage(data.userMessage));
      dispatch(addMessage(data.aiMessage));
      await loadConversations();
    } catch (err) {
      console.error("Failed to edit message");
    } finally {
      setSending(false);
    }
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditingContent("");
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
                Ask anything to start your interview preparation.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`message-row ${msg.role}`}
              onMouseEnter={() => setHoveredMessageId(msg._id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              {msg.role === "user" ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", maxWidth: "70%" }}>
                  {editingMessageId === msg._id ? (
                    <div style={{ width: "100%" }}>
                      <textarea
                        className="chat-input"
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        style={{
                          background: "rgba(255,255,255,0.1)",
                          border: "1px solid rgba(139,92,246,0.5)",
                          borderRadius: "12px",
                          padding: "10px 14px",
                          color: "white",
                          width: "100%",
                          minHeight: "60px",
                          marginBottom: "8px",
                        }}
                        autoFocus
                      />
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button
                          onClick={handleEditCancel}
                          style={{
                            background: "rgba(255,255,255,0.1)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            color: "white",
                            padding: "6px 14px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleEditConfirm}
                          style={{
                            background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                            border: "none",
                            color: "white",
                            padding: "6px 14px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                          }}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="message-bubble user">
                        {msg.content}
                      </div>
                      {hoveredMessageId === msg._id && (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => handleEditStart(msg._id, msg.content)}
                            style={{
                              background: "rgba(255,255,255,0.1)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              color: "rgba(255,255,255,0.7)",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleRetry(msg._id, msg.content)}
                            style={{
                              background: "rgba(255,255,255,0.1)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              color: "rgba(255,255,255,0.7)",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            🔄 Retry
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="message-bubble assistant">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
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
              disabled={sending}
            />
            <button
              className="btn-send"
              onClick={handleSend}
              disabled={sending || !input.trim()}
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