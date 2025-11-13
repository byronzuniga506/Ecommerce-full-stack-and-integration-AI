import { useState, useRef, useEffect, CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// ==================== TYPESCRIPT INTERFACES ====================
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  products?: Product[];
}

interface Product {
  title: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  seller?: string;
}

interface QuickAction {
  text: string;
  message: string;
}

// ==================== MAIN COMPONENT ====================
const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Emma, your shopping assistant! 👋 How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = 'http://localhost:5000';

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Render message content with clickable links
  const renderMessageContent = (content: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      // Add text before link
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {content.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Add link
      const linkText = match[1];
      const linkPath = match[2];

      parts.push(
        <Link
          key={`link-${match.index}`}
          to={linkPath}
          style={{
            color: '#667eea',
            fontWeight: 'bold',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
          onClick={() => setIsOpen(false)}
        >
          {linkText}
        </Link>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>{content.substring(lastIndex)}</span>
      );
    }

    return parts.length > 0 ? <>{parts}</> : content;
  };

  // Send message with smart detection
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.toLowerCase();
    const originalInput = input;
    setInput('');
    setLoading(true);

    try {
      // ========================
      // 🔐 LOGIN DETECTION
      // ========================
      if (
        currentInput.includes('login') ||
        currentInput.includes('log in') ||
        currentInput.includes('sign in') ||
        currentInput.includes('signin')
      ) {
        const loginResponse: Message = {
          role: 'assistant',
          content: `🔐 **To Login to MyStore:**

**Already have an account?**
👉 [Click here to Login](/login)

**Don't have an account yet?**
👉 [Sign up here](/signup) - It only takes 2 minutes!

**Steps to Login:**
1️⃣ Go to the Login page
2️⃣ Enter your email and password
3️⃣ Click "Login" button

**Forgot your password?** Use the "Forgot Password" link on the login page.

Need more help? Just ask! 😊`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, loginResponse]);
        setLoading(false);
        return;
      }

      // ========================
      // 📝 SIGNUP DETECTION
      // ========================
      if (
        currentInput.includes('signup') ||
        currentInput.includes('sign up') ||
        currentInput.includes('register') ||
        currentInput.includes('create account') ||
        currentInput.includes('new account') ||
        currentInput.includes('join')
      ) {
        const signupResponse: Message = {
          role: 'assistant',
          content: `📝 **Create Your MyStore Account:**

**Ready to join us?** 🎉
👉 [Create your account here](/signup)

**Quick Signup Steps:**
1️⃣ Enter your name and email
2️⃣ Choose a password
3️⃣ Verify your email (we'll send a code)
4️⃣ Start shopping!

**Why create an account?**
✅ Track your orders
✅ Save your favorites
✅ Faster checkout
✅ Exclusive deals & offers

**Already have an account?**
👉 [Login here](/login)

Questions? I'm here to help! 💙`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, signupResponse]);
        setLoading(false);
        return;
      }

      // ========================
      // 🏪 SELLER DETECTION
      // ========================
      if (
        currentInput.includes('sell') ||
        currentInput.includes('seller') ||
        currentInput.includes('become a seller') ||
        currentInput.includes('start selling') ||
        currentInput.includes('merchant')
      ) {
        const sellerResponse: Message = {
          role: 'assistant',
          content: `🏪 **Become a Seller on MyStore:**

**Want to sell your products?** Great!
👉 [Apply to become a seller](/seller-signup)

**How it works:**
1 Submit your seller application
2 Wait for admin approval (24-48 hours)
3 Once approved, add your products
4 Start earning!

**Already a seller?**
👉 [Seller Login](/seller-login)

**Questions about selling?**
👉 [Contact Support](/contactus)

I'm here if you need help! 🚀`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, sellerResponse]);
        setLoading(false);
        return;
      }

      // ========================
      // 📦 ORDERS DETECTION
      // ========================
      if (
        currentInput.includes('my orders') ||
        currentInput.includes('my order') ||
        currentInput.includes('track order') ||
        currentInput.includes('order history') ||
        currentInput.includes('view orders')
      ) {
        const ordersResponse: Message = {
          role: 'assistant',
          content: `📦 **View Your Orders:**

**To see your order history:**
👉 [My Orders Page](/my-orders)

**Note:** You must be logged in to view your orders.

**Not logged in?**
👉 [Login here](/login)

**New customer?**
👉 [Create account](/signup)

Need help with a specific order? Let me know! 📋`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, ordersResponse]);
        setLoading(false);
        return;
      }

      // ========================
      // 📞 CONTACT/SUPPORT DETECTION
      // ========================
      if (
        currentInput.includes('contact') ||
        currentInput.includes('support') ||
        currentInput.includes('help') ||
        currentInput.includes('customer service')
      ) {
        const contactResponse: Message = {
          role: 'assistant',
          content: `📞 **Contact MyStore Support:**

**Need direct assistance?**
👉 [Contact Us Form](/contactus)

**Email Us:**
📧 support@mystore.com

**Call Us:**
📱 1-800-MYSTORE

**Operating Hours:**
🕐 Monday - Friday: 9 AM - 6 PM
🕐 Saturday: 10 AM - 4 PM
🕐 Sunday: Closed

I can also help you right here! What do you need? 😊`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, contactResponse]);
        setLoading(false);
        return;
      }

      // ========================
      // 🛍️ PRODUCT SEARCH (DEFAULT)
      // ========================
      const response = await axios.post(`${API_URL}/chat-product-search`, {
        message: originalInput,
      });

      const botMessage: Message = {
        role: 'assistant',
        content: response.data.reply || "I'm here to help!",
        products: response.data.products || [],
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);

      const errorMessage: Message = {
        role: 'assistant',
        content:
          "Sorry, I'm having trouble right now. Please try again or contact support@mystore.com 😊",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading && input.trim()) {
      sendMessage();
    }
  };

  // Quick actions
  const quickActions: QuickAction[] = [
    { text: '🔐 How to Login', message: 'How do I login?' },
    { text: '📝 Create Account', message: 'How do I sign up?' },
    { text: '🛍️ Show Products', message: 'What products do you have?' },
    { text: '📦 Shipping Info', message: 'Tell me about shipping' },
  ];

  const handleQuickAction = (message: string) => {
    setInput(message);
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ==================== RENDER ====================
  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div
          style={styles.chatButton}
          onClick={() => setIsOpen(true)}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          }}
        >
          💬
          <span style={styles.chatBadge}>Ask Emma!</span>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={styles.chatbotContainer}>
          {/* Header */}
          <div style={styles.chatHeader}>
            <div style={styles.headerContent}>
              <div style={styles.botAvatar}>🤖</div>
              <div style={styles.botInfo}>
                <h3 style={styles.botName}>Emma - Shopping Assistant</h3>
                <span style={styles.status}>
                  <span style={styles.statusDot}></span> Online
                </span>
              </div>
            </div>
            <button
              style={styles.closeButton}
              onClick={() => setIsOpen(false)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  'rgba(255, 255, 255, 0.2)';
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div style={styles.chatMessages}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.messageWrapper,
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    ...styles.message,
                    ...(msg.role === 'user'
                      ? styles.messageUser
                      : styles.messageAssistant),
                  }}
                >
                  <div style={styles.messageContent}>
                    {renderMessageContent(msg.content)}
                  </div>
                  <div style={styles.messageTime}>{formatTime(msg.timestamp)}</div>
                </div>

                {/* Product Cards */}
                {msg.products && msg.products.length > 0 && (
                  <div style={styles.productsContainer}>
                    {msg.products.map((product, pIdx) => (
                      <div
                        key={pIdx}
                        style={styles.productCard}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.transform =
                            'translateY(-4px)';
                          (e.currentTarget as HTMLElement).style.boxShadow =
                            '0 4px 16px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.transform =
                            'translateY(0)';
                          (e.currentTarget as HTMLElement).style.boxShadow =
                            '0 2px 8px rgba(0, 0, 0, 0.1)';
                        }}
                      >
                        <img
                          src={product.image}
                          alt={product.title}
                          style={styles.productImage}
                        />
                        <div style={styles.productInfo}>
                          <h4 style={styles.productTitle}>{product.title}</h4>
                          <p style={styles.productCategory}>
                            📂 {product.category}
                          </p>
                          <div style={styles.productFooter}>
                            <span style={styles.productPrice}>
                              ${product.price.toFixed(2)}
                            </span>
                            <button
                              style={styles.viewProductBtn}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.opacity =
                                  '0.9';
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.opacity = '1';
                              }}
                            >
                              View Details →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div style={{ ...styles.messageWrapper, alignItems: 'flex-start' }}>
                <div style={{ ...styles.message, ...styles.messageAssistant }}>
                  <div style={styles.typingContainer}>
                    <span
                      style={{ ...styles.typingDot, animationDelay: '0s' }}
                    ></span>
                    <span
                      style={{ ...styles.typingDot, animationDelay: '0.2s' }}
                    ></span>
                    <span
                      style={{ ...styles.typingDot, animationDelay: '0.4s' }}
                    ></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div style={styles.quickActions}>
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  style={styles.quickActionBtn}
                  onClick={() => handleQuickAction(action.message)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#667eea';
                    (e.currentTarget as HTMLElement).style.color = 'white';
                    (e.currentTarget as HTMLElement).style.borderColor = '#667eea';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'white';
                    (e.currentTarget as HTMLElement).style.color = '#333';
                    (e.currentTarget as HTMLElement).style.borderColor = '#ddd';
                  }}
                >
                  {action.text}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div style={styles.chatInputContainer}>
            <input
              type="text"
              style={styles.chatInput}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={loading}
              onFocus={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#667eea';
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb';
              }}
            />
            <button
              style={{
                ...styles.sendButton,
                opacity: loading || !input.trim() ? 0.5 : 1,
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              }}
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              onMouseEnter={(e) => {
                if (!loading && input.trim()) {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              }}
            >
              {loading ? '⏳' : '📤'}
            </button>
          </div>

          {/* Footer */}
          <div style={styles.chatFooter}>Powered by MyStore AI ✨</div>
        </div>
      )}

      {/* Inject CSS Animation Keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 480px) {
          .chatbot-container {
            width: 100% !important;
            height: 100% !important;
            bottom: 0 !important;
            right: 0 !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </>
  );
};

// ==================== STYLES ====================
const styles: { [key: string]: CSSProperties } = {
  chatButton: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '28px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.3s ease',
    zIndex: 1000,
  },

  chatBadge: {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    background: '#ff4757',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },

  chatbotContainer: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '400px',
    height: '564px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 1000,
    animation: 'slideUp 0.3s ease',
  },

  chatHeader: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  botAvatar: {
    width: '40px',
    height: '40px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },

  botInfo: {
    display: 'flex',
    flexDirection: 'column',
  },

  botName: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
  },

  status: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    opacity: 0.9,
  },

  statusDot: {
    width: '8px',
    height: '8px',
    background: '#4ade80',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
  },

  closeButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },

  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    background: '#f8f9fa',
  },

  messageWrapper: {
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
  },

  message: {
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: '16px',
    wordWrap: 'break-word',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },

  messageUser: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderBottomRightRadius: '4px',
  },

  messageAssistant: {
    background: 'white',
    color: '#333',
    borderBottomLeftRadius: '4px',
  },

  messageContent: {
    marginBottom: '4px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
  },

  messageTime: {
    fontSize: '10px',
    opacity: 0.7,
    textAlign: 'right',
  },

  typingContainer: {
    display: 'flex',
    gap: '4px',
  },

  typingDot: {
    width: '8px',
    height: '8px',
    background: '#999',
    borderRadius: '50%',
    animation: 'typing 1.4s infinite',
  },

  productsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '12px',
    maxWidth: '85%',
  },

  productCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
  },

  productImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
  },

  productInfo: {
    padding: '12px',
  },

  productTitle: {
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    color: '#333',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },

  productCategory: {
    fontSize: '12px',
    color: '#666',
    margin: '0 0 12px 0',
  },

  productFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  productPrice: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#667eea',
  },

  viewProductBtn: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'opacity 0.3s',
  },

  quickActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '0 20px 12px',
    background: '#f8f9fa',
  },

  quickActionBtn: {
    background: 'white',
    border: '1px solid #ddd',
    padding: '8px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    color: '#333',
  },

  chatInputContainer: {
    display: 'flex',
    gap: '8px',
    padding: '16px',
    background: 'white',
    borderTop: '1px solid #e5e7eb',
  },

  chatInput: {
    flex: 1,
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '24px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },

  sendButton: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'transform 0.3s',
  },

  chatFooter: {
    textAlign: 'center',
    padding: '8px',
    fontSize: '11px',
    color: '#999',
    background: 'white',
    borderTop: '1px solid #e5e7eb',
  },
};

export default ChatBot;