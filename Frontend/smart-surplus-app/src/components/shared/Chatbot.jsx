import React, { useState, useEffect, useRef, useContext } from 'react';
import { useAuth } from '../../context/AuthContext'; // We need this to know the user's role

// --- Helper function to generate the "cheat sheet" for the AI ---
const generateSystemPrompt = (user) => {
  const basePrompt = `
    You are ZeroBot, a friendly and helpful AI assistant for the ZeroBite application.
    ZeroBite is a smart surplus food redistribution app for a zero-waste campus.
    Your goal is to guide users and answer their questions about the app's features.
    Keep your answers concise, helpful, and use a friendly, encouraging tone.

    **VERY IMPORTANT FORMATTING RULES:**
    - Do NOT use Markdown. Do not use asterisks for bolding (like **this**).
    - To emphasize text, wrap it in <b>tags</b> like this: <b>Important Text</b>.
    - Use simple bullet points with a hyphen (-) for lists.
    - Start each new point on a new line.
  `;

  let userContextPrompt = `
    The user is a GUEST (not logged in).
    - They can view the <b>Homepage</b> and the <b>Surplus Food</b> page.
    - To claim food or access other features, they need to <b>register</b> or <b>log in</b>.
  `;

  if (user) {
    switch (user.role) {
      case 'student':
        userContextPrompt = `
          The user you are talking to is a STUDENT.
          - <b>Surplus Food Page:</b> Students can browse available surplus food.
          - <b>Claiming Food:</b> They can claim food items, which generates a unique <b>OTP</b> (One-Time Password).
          - <b>Pickup Process:</b> They must show this OTP to the canteen staff to confirm the pickup.
          - <b>Gamification:</b> They earn points for each pickup and can see their rank on the <b>Leaderboard</b>.
          - <b>Dashboard:</b> Their dashboard shows their points, level, and impact stats.
        `;
        break;
      case 'ngo':
        userContextPrompt = `
          The user you are talking to is from an NGO.
          - <b>Claiming Food:</b> NGOs can browse and claim surplus food in larger quantities for their organization.
          - <b>Bookings Tab:</b> When an NGO claims food, the item appears in their special <b>Bookings</b> tab. The quantity is deducted from the available list immediately.
          - <b>Pickup Process:</b> They also receive an <b>OTP</b> to confirm the pickup with the canteen staff.
        `;
        break;
      case 'canteen-organizer':
        userContextPrompt = `
          The user you are talking to is a CANTEEN ORGANIZER (canteen staff).
          - <b>Add Food Page:</b> They can list new surplus food items.
          - <b>Notifications:</b> They receive notifications in their <b>Notifications Tab</b> when a user wants to pick up food.
          - <b>Confirming Pickup:</b> They must ask the user for their <b>OTP</b> and enter it into the notification to confirm the pickup. This action awards points to the user.
          - <b>Analytics Page:</b> They can view charts and stats on their dashboard to see their environmental impact.
        `;
        break;
      default:
        userContextPrompt = "The user is logged in but has an unrecognized role.";
    }
  }

  return `${basePrompt}\n\n${userContextPrompt}\n\nNow, please answer the user's question.`;
};

// --- Helper function to format the AI's text for display ---
const formatResponse = (text) => {
    // This simple regex handles the <b> tags for bolding.
    // It's a safe way to add basic formatting.
    return { __html: text.replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>') };
};


const Chatbot = () => {
  const { user } = useAuth(); // Get the current user from your AuthContext
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Automatically scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Set the initial welcome message when the user opens the chatbot
  useEffect(() => {
    if (isOpen && messages.length === 0) {
        setMessages([
            { sender: 'ai', text: `Hi ${user ? user.name : 'there'}! I'm ZeroBot. How can I help you today?` }
        ]);
    }
  }, [isOpen, user, messages.length]);


  const handleSend = async () => {
    if (userInput.trim() === '' || isLoading) return;

    const newUserMessage = { sender: 'user', text: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    const systemPrompt = generateSystemPrompt(user);
    const fullPrompt = `${systemPrompt}\n\nUser Question: "${userInput}"`;

    try {
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: fullPrompt }] });
      const payload = { contents: chatHistory };
      // --- IMPORTANT: Paste your API key here ---
      const apiKey = "AIzaSyDSLbrH5iFO3bDXAsuVjgntHzDl6IPhjfs"; // <-- PASTE YOUR KEY HERE
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      
      let aiResponseText = "Sorry, I couldn't get a response. Please try again.";
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        aiResponseText = result.candidates[0].content.parts[0].text;
      }
      
      const newAiMessage = { sender: 'ai', text: aiResponseText };
      setMessages(prev => [...prev, newAiMessage]);

    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMessage = { sender: 'ai', text: "Sorry, I'm having trouble connecting. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <h3>ZeroBot Assistant</h3>
          <button onClick={() => setIsOpen(false)} className="close-btn">&times;</button>
        </div>
        <div className="chat-body">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender}`}>
              {/* --- FIX: Use the formatting function and CSS for newlines --- */}
              <p dangerouslySetInnerHTML={formatResponse(msg.text)} style={{ whiteSpace: 'pre-wrap' }}></p>
            </div>
          ))}
          {isLoading && (
            <div className="chat-message ai">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="chat-footer">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about ZeroBite..."
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading}>
            &#10148;
          </button>
        </div>
      </div>
      <button onClick={() => setIsOpen(true)} className="chat-fab">
        💬
      </button>

      <style jsx>{`
        .chat-fab {
          position: fixed;
          bottom: 25px;
          right: 25px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: #2E7D32;
          color: white;
          font-size: 28px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          transition: transform 0.3s ease;
        }
        .chat-fab:hover {
          transform: scale(1.1);
        }

        .chat-window {
          position: fixed;
          bottom: 100px;
          right: 25px;
          width: 370px;
          height: 500px;
          background: white;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          transform: translateY(20px) scale(0.95);
          opacity: 0;
          visibility: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
        }
        .chat-window.open {
          transform: translateY(0) scale(1);
          opacity: 1;
          visibility: visible;
        }

        .chat-header {
          background: #2E7D32;
          color: white;
          padding: 15px 20px;
          border-top-left-radius: 15px;
          border-top-right-radius: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chat-header h3 { margin: 0; font-size: 1.1rem; }
        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
        }

        .chat-body {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background-color: #f9f9f9;
        }
        .chat-message {
          margin-bottom: 15px;
          display: flex;
        }
        .chat-message p {
          margin: 0;
          padding: 12px 18px;
          border-radius: 20px;
          max-width: 80%;
          line-height: 1.5;
        }
        .chat-message.user {
          justify-content: flex-end;
        }
        .chat-message.user p {
          background-color: #4CAF50;
          color: white;
          border-bottom-right-radius: 5px;
        }
        .chat-message.ai p {
          background-color: #e0e0e0;
          color: #333;
          border-bottom-left-radius: 5px;
        }

        .chat-footer {
          display: flex;
          padding: 15px;
          border-top: 1px solid #eee;
        }
        .chat-footer input {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 20px;
          padding: 10px 15px;
          font-size: 1rem;
        }
        .chat-footer input:focus {
          outline: none;
          border-color: #4CAF50;
        }
        .chat-footer button {
          background: #2E7D32;
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          margin-left: 10px;
          cursor: pointer;
          font-size: 1.2rem;
        }
        .chat-footer button:disabled {
          background-color: #ccc;
        }
        
        .typing-indicator {
            display: flex;
            padding: 15px;
        }
        .typing-indicator span {
            height: 8px;
            width: 8px;
            background-color: #9E9E9E;
            border-radius: 50%;
            display: inline-block;
            margin: 0 2px;
            animation: bounce 1.4s infinite ease-in-out both;
        }
        .typing-indicator span:nth-of-type(2) { animation-delay: -0.2s; }
        .typing-indicator span:nth-of-type(3) { animation-delay: -0.4s; }
        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1.0); }
        }
        
        @media (max-width: 480px) {
            .chat-window {
                width: calc(100% - 20px);
                height: calc(100% - 80px);
                bottom: 70px;
                right: 10px;
            }
            .chat-fab {
                bottom: 15px;
                right: 15px;
            }
        }
      `}</style>
    </>
  );
};

export default Chatbot;
