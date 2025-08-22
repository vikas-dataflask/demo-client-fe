import { SendHorizonal, Sparkles, Loader2, Bot, User, Heart, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  useChatMutation,
  useLoginMutation,
} from "../../../redux/features/api/aiApi";

export default function AiSidebar() {
  const [login] = useLoginMutation();
  const [chat] = useChatMutation();

  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [likedMessages, setLikedMessages] = useState(new Set());
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Auto-login setup
  useEffect(() => {
    const autoLogin = async () => {
      try {
        await login({ username: "manas", password: "Dataflask@123" }).unwrap();
      } catch (err) {
        console.error("Auto-login failed", err);
      }
    };

    autoLogin();
    const intervalId = setInterval(autoLogin, 25 * 60 * 1000); // every 30 minutes
    return () => clearInterval(intervalId);
  }, [login]);

  // Send message handler
  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setIsTyping(true);

    // Add user's message to history
    setChatHistory((prev) => [...prev, { role: "user", text: message }]);

    try {
      const response = await chat({ message, memory_length: 0 }).unwrap();
      setChatHistory((prev) => [
        ...prev,
        { role: "bot", text: response.response },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatHistory((prev) => [
        ...prev,
        { role: "bot", text: "Something went wrong. Please try again." },
      ]);
    }

    setMessage(""); // Clear input
    setIsLoading(false);
    setIsTyping(false);
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle like on message
  const toggleLike = (messageIndex) => {
    setLikedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageIndex)) {
        newSet.delete(messageIndex);
      } else {
        newSet.add(messageIndex);
      }
      return newSet;
    });
  };

  return (
    <>
      {/* Sidebar - Always Visible */}
      <div 
        className="fixed top-18 right-0 h-screen w-[400px] bg-white shadow-2xl z-40"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 30%, #F1F5F9 70%, #E2E8F0 100%)',
          borderLeft: '1px solid rgba(226, 232, 240, 0.8)',
          maxHeight: '100vh',
          minHeight: '100vh',
          boxShadow: '-25px 0 50px -12px rgba(0, 0, 0, 0.15), -10px 0 20px -5px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Header */}
        <div 
          className="relative p-5 border-b"
          style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 40%, #1D4ED8 70%, #1E40AF 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            height: '70px'
          }}
        >
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-white animate-pulse shadow-lg"></div>
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 animate-ping shadow-md"></div>
              </div>
              <div>
                <div className="font-bold text-white text-xl mb-1">AI Assistant</div>
                <div className="text-blue-100 text-xs font-medium flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                  Ready to help • Online
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full overflow-hidden" style={{ height: 'calc(100vh - 70px)' }}>
          {/* Quick Stats */}
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="group bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-102 active:scale-98">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform duration-300"></div>
                  <div className="text-blue-700 text-xs font-bold group-hover:translate-x-1 transition-transform duration-300">Dimensions</div>
                </div>
                <div className="text-blue-600 text-xs space-y-0.5">
                  <div className="flex items-center gap-1.5 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                    Area calculations
                  </div>
                  <div className="flex items-center gap-1.5 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                    Wall measurements
                  </div>
                </div>
              </div>
              
              <div className="group bg-gradient-to-br from-cream-50 to-cream-100 p-3 rounded-xl border border-cream-200 hover:border-cream-300 hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-102 active:scale-98">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-cream-500 group-hover:scale-125 transition-transform duration-300"></div>
                  <div className="text-cream-700 text-xs font-bold group-hover:translate-x-1 transition-transform duration-300">Project</div>
                </div>
                <div className="text-blue-600 text-xs space-y-0.5">
                  <div className="flex items-center gap-1.5 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="w-1 h-1 rounded-full bg-cream-400"></div>
                    Specifications
                  </div>
                  <div className="flex items-center gap-1.5 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="w-1 h-1 rounded-full bg-cream-400"></div>
                    Requirements
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="flex-1 flex flex-col px-4 pb-4 mb-20">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 flex flex-col flex-1 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
              <div className="p-3 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-sm"></div>
                    {isTyping && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                    )}
                  </div>
                  <div className="text-gray-700 text-sm font-bold">Chat with AI</div>
                  <div className="flex-1"></div>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      Active
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat history area */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
                style={{ 
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)',
                  minHeight: '180px'
                }}
              >
                {chatHistory.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-300 cursor-pointer">
                      <Sparkles className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="text-base font-bold mb-1 text-gray-700">Start a conversation</div>
                    <div className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                      Ask about design, calculations, or project details. I'm here to help you with any questions!
                    </div>
                  </div>
                )}
                
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    } animate-fade-in group`}
                    style={{
                      animation: 'fadeIn 0.5s ease-in-out'
                    }}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white group-hover:scale-102"
                          : "bg-gradient-to-br from-white to-gray-50 text-gray-800 border border-gray-200 group-hover:scale-102"
                      }`}
                      style={{
                        background: msg.role === "user" 
                          ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                          : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                        boxShadow: msg.role === "user"
                          ? '0 4px 12px -2px rgba(37, 99, 235, 0.2)'
                          : '0 2px 8px -1px rgba(0, 0, 0, 0.08)'
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`p-1.5 rounded-full ${msg.role === "user" ? "bg-white/20" : "bg-blue-100"} group-hover:scale-110 transition-transform duration-300`}>
                          {msg.role === "user" ? (
                            <User className="h-3 w-3 text-white" />
                          ) : (
                            <Bot className="h-3 w-3 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs leading-relaxed">{msg.text}</div>
                        </div>
                      </div>
                      
                      {/* Interactive buttons for bot messages */}
                      {msg.role === "bot" && (
                        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => toggleLike(idx)}
                            className={`p-1 rounded-full transition-all duration-200 hover:scale-110 ${
                              likedMessages.has(idx) 
                                ? 'bg-red-100 text-red-500' 
                                : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500'
                            }`}
                          >
                            <Heart className={`h-2.5 w-2.5 ${likedMessages.has(idx) ? 'fill-current' : ''}`} />
                          </button>
                          <button className="p-1 rounded-full bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-500 transition-all duration-200 hover:scale-110">
                            <Star className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="max-w-[80%] p-3 rounded-2xl shadow-sm bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:scale-102 transition-transform duration-300">
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 rounded-full bg-blue-100 animate-pulse">
                          <Bot className="h-3 w-3 text-blue-600" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
                          <span className="text-xs text-gray-600">AI is typing...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input box */}
              <div className="p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 relative group">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message..."
                      disabled={isLoading}
                      className="w-full p-3 pr-12 text-xs appearance-none outline-none border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all duration-300 bg-gray-50 focus:bg-white group-hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'
                      }}
                    />
                    <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs bg-gray-100 px-1.5 py-0.5 rounded-md group-hover:bg-gray-200 transition-colors duration-200">
                      Enter
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isLoading}
                    className="p-3 rounded-xl shadow-md transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 group hover:shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                      boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.3), 0 4px 6px -2px rgba(37, 99, 235, 0.2)'
                    }}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    ) : (
                      <SendHorizonal className="h-4 w-4 text-white group-hover:translate-x-0.5 transition-transform duration-200" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }

        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 2px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 2px;
          transition: background 0.2s ease;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </>
  );
}
