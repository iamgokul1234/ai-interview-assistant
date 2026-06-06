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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (id) {
      loadMessages(id);
    }
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
      if (id === conversationId) {
        navigate("/chat");
      }
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

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <div
        className="d-flex flex-column bg-dark text-white p-3"
        style={{ width: "260px", minWidth: "260px" }}
      >
        <h6 className="mb-3">AI Interview Assistant</h6>

        <button
          className="btn btn-outline-light btn-sm mb-3"
          onClick={handleNewChat}
        >
          + New Chat
        </button>

        <div className="flex-grow-1 overflow-auto">
          {conversations.map((conv) => (
            <div
              key={conv._id}
              className={`d-flex align-items-center justify-content-between p-2 mb-1 rounded cursor-pointer ${
                currentConversation?._id === conv._id
                  ? "bg-secondary"
                  : "hover-bg"
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/chat/${conv._id}`)}
            >
              <span
                className="text-truncate small"
                style={{ maxWidth: "180px" }}
              >
                {conv.title}
              </span>
              <button
                className="btn btn-sm text-danger p-0 ms-1"
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

        <div className="mt-3 border-top pt-3">
          <small className="text-muted d-block mb-2">{user?.name}</small>
          <button
            className="btn btn-outline-danger btn-sm w-100"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="d-flex flex-column flex-grow-1">
        {/* Header */}
        <div className="border-bottom p-3 bg-white">
          <h6 className="mb-0">
            {currentConversation
              ? currentConversation.title
              : "Select or start a new chat"}
          </h6>
        </div>

        {/* Messages */}
        <div className="flex-grow-1 overflow-auto p-3 bg-light">
          {!currentConversation && (
            <div className="text-center text-muted mt-5">
              <h5>Welcome, {user?.name}!</h5>
              <p>Start a new chat or select an existing one.</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`d-flex mb-3 ${
                msg.role === "user"
                  ? "justify-content-end"
                  : "justify-content-start"
              }`}
            >
              <div
                className={`p-3 rounded ${
                  msg.role === "user"
                    ? "bg-primary text-white"
                    : "bg-white border"
                }`}
                style={{ maxWidth: "70%", whiteSpace: "pre-wrap" }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="d-flex justify-content-start mb-3">
              <div className="p-3 rounded bg-white border">
                <span className="text-muted">AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-top p-3 bg-white">
          <div className="d-flex gap-2">
            <textarea
              className="form-control"
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask an interview question... (Enter to send)"
              disabled={!currentConversation || sending}
            />
            <button
              className="btn btn-primary"
              onClick={handleSend}
              disabled={!currentConversation || sending || !input.trim()}
            >
              {sending ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
