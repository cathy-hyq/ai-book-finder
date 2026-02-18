import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatPage.css';
import PhoneFrame from './PhoneFrame';

function ChatPage() {
  const navigate = useNavigate();
  // 从 sessionStorage 恢复聊天记录（关闭标签页后清空）
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('chatMessages');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 将聊天记录保存到 sessionStorage
  useEffect(() => {
    sessionStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // 添加用户消息
    setMessages(prev => [...prev, {
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);

    setIsLoading(true);

    try {
      // 调用后端 API
      const response = await fetch('https://your-backend-url.railway.app/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userMessage }),
      });

      const data = await response.json();

      // 添加 AI 回复
      setMessages(prev => [...prev, {
        type: 'ai',
        books: data.books || [],
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        type: 'ai',
        content: '抱歉，服务出现了问题，请稍后再试。',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理回车发送
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 快捷问题发送
  const handleQuickSend = async (question) => {
    // 添加用户消息
    setMessages(prev => [...prev, {
      type: 'user',
      content: question,
      timestamp: new Date().toISOString()
    }]);

    setIsLoading(true);

    try {
      const response = await fetch('https://your-backend-url.railway.app/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question }),
      });

      const data = await response.json();

      setMessages(prev => [...prev, {
        type: 'ai',
        books: data.books || [],
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PhoneFrame>
      <div className="chat-container">
        {/* 背景图 */}
        <img 
          src="/chat_page.png" 
          alt="背景"
          className="chat-bg-image"
        />

        {/* 固定的顶部导航栏 */}
        <div className="chat-nav-bar">
          <img 
            src="/chat_nav.png" 
            alt="导航栏"
          />
        </div>

        {/* 返回按钮热区 */}
        <div 
          className="back-button-area"
          onClick={() => navigate('/')}
          title="返回首页"
        />

        {/* 对话区域 */}
        <div className="messages-area">
          {messages.length === 0 ? (
            // 空状态提示
            <div className="empty-state">
              <div className="ai-icon-large">Ai</div>
              <h3>AI 帮你找书</h3>
              <p>告诉我你想读什么类型的书</p>
              
              {/* 快捷问题 */}
              <div className="quick-questions">
                <button onClick={() => handleQuickSend('我想读一些能提升思维能力的书')}>
                  我想读一些能提升思维能力的书
                </button>
                <button onClick={() => handleQuickSend('推荐一些关于人生哲学的书')}>
                  推荐一些关于人生哲学的书
                </button>
                <button onClick={() => handleQuickSend('有什么书能帮我理解历史大势？')}>
                  有什么书能帮我理解历史大势？
                </button>
              </div>
            </div>
          ) : (
            // 消息列表
            <div className="messages-list">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.type}`}>
                  {/* 只显示用户消息的气泡，AI消息不显示文字气泡 */}
                  {msg.type === 'user' && (
                    <div className="message-bubble">
                      <p>{msg.content}</p>
                    </div>
                  )}

                  {/* AI 推荐的书籍卡片 */}
                  {msg.type === 'ai' && msg.books && msg.books.length > 0 && (
                    <div className="book-cards">
                      {msg.books.map((book, bookIndex) => (
                        <div 
                          key={bookIndex}
                          onClick={() => navigate(`/book/${book.book_id}`)}
                          className="book-card"
                        >
                          <div className="book-info-only">
                            <div className="book-title-author">
                              <h4>{book.title}</h4>
                              <span className="book-author">{book.author}</span>
                            </div>
                            <p className="book-reason">{book.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* 加载中 */}
              {isLoading && (
                <div className="message ai">
                  <div className="message-bubble loading">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 输入框区域 */}
        <div className="input-area">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="告诉我你想读什么书"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className={inputValue.trim() && !isLoading ? 'active' : ''}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}

export default ChatPage;
