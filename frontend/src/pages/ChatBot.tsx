import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from "../config"; 

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

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clear chat history
  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Chat cleared! 🧹 How can I help you today?",
        timestamp: new Date().toISOString(),
      },
    ]);
    setInput('');
  };

  // Render message content with clickable links
  const renderMessageContent = (content: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {content.substring(lastIndex, match.index)}
          </span>
        );
      }

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
      // LOGIN DETECTION
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
1 Go to the Login page
2 Enter your email and password
3 Click "Login" button

**Forgot your password?** Use the "Forgot Password" link on the login page.

Need more help? Just ask! 😊`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, loginResponse]);
        setLoading(false);
        return;
      }

      // SIGNUP DETECTION
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
1 Enter your name and email
2 Choose a password
3 Verify your email (we'll send a code)
4 Start shopping!

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

      // SELLER DETECTION
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

      // ORDERS DETECTION
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

      // CONTACT/SUPPORT DETECTION
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

      // PRODUCT SEARCH (DEFAULT)
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
          style={{
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
          }}
          onClick={() => setIsOpen(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          💬
          <span style={{
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
          }}>Ask Emma!</span>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
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
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}>🤖</div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '600',
                }}>Saarthi - Shopping Assistant</h3>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  opacity: 0.9,
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    background: '#4ade80',
                    borderRadius: '50%',
                  }}></span> Online
                </span>
              </div>
            </div>
            
            {/* Header Buttons */}
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}>
              {/* Clear Button */}
              <button
                onClick={clearChat}
                title="Clear Chat"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '18px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'background 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                🗑️
              </button>
              
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '18px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'background 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            background: '#f8f9fa',
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    wordWrap: 'break-word',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    background: msg.role === 'user' 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'white',
                    color: msg.role === 'user' ? 'white' : '#333',
                    borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                    borderBottomLeftRadius: msg.role === 'user' ? '16px' : '4px',
                  }}
                >
                  <div style={{
                    marginBottom: '4px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {renderMessageContent(msg.content)}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    opacity: 0.7,
                    textAlign: 'right',
                  }}>{formatTime(msg.timestamp)}</div>
                </div>

                {/* Product Cards */}
                {msg.products && msg.products.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginTop: '12px',
                    maxWidth: '85%',
                  }}>
                    {msg.products.map((product, pIdx) => (
                      <div
                        key={pIdx}
                        style={{
                          background: 'white',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          transition: 'transform 0.3s, box-shadow 0.3s',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                        }}
                      >
                        <img
                          src={product.image}
                          alt={product.title}
                          style={{
                            width: '100%',
                            height: '150px',
                            objectFit: 'cover',
                          }}
                        />
                        <div style={{ padding: '12px' }}>
                          <h4 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            margin: '0 0 8px 0',
                            color: '#333',
                          }}>{product.title}</h4>
                          <p style={{
                            fontSize: '12px',
                            color: '#666',
                            margin: '0 0 12px 0',
                          }}>📂 {product.category}</p>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                            <span style={{
                              fontSize: '18px',
                              fontWeight: 'bold',
                              color: '#667eea',
                            }}>${product.price.toFixed(2)}</span>
                            <button style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              cursor: 'pointer',
                            }}>View Details →</button>
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
              <div style={{
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  maxWidth: '75%',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      background: '#999',
                      borderRadius: '50%',
                    }}></span>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      background: '#999',
                      borderRadius: '50%',
                    }}></span>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      background: '#999',
                      borderRadius: '50%',
                    }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              padding: '0 20px 12px',
              background: '#f8f9fa',
            }}>
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action.message)}
                  style={{
                    background: 'white',
                    border: '1px solid #ddd',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    color: '#333',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#667eea';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = '#667eea';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#333';
                    e.currentTarget.style.borderColor = '#ddd';
                  }}
                >
                  {action.text}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '16px',
            background: 'white',
            borderTop: '1px solid #e5e7eb',
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '24px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '18px',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !input.trim() ? 0.5 : 1,
                transition: 'transform 0.3s',
              }}
              onMouseEnter={(e) => {
                if (!loading && input.trim()) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {loading ? '⏳' : '📤'}
            </button>
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            padding: '8px',
            fontSize: '11px',
            color: '#999',
            background: 'white',
            borderTop: '1px solid #e5e7eb',
          }}>Powered by MyStore AI ✨</div>
        </div>
      )}
    </>
  );
};

export default ChatBot;