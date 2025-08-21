import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext"; // Assuming you have an AuthContext to get the user role
import { TbMessageChatbotFilled } from "react-icons/tb";


// --- Helper function to generate the detailed "cheat sheet" for the AI ---
// --- Helper function to generate the detailed "cheat sheet" for the AI ---
const generateSystemPrompt = (user) => {
  const baseRules = `
    You are ZeroBot, a friendly and helpful AI assistant for the ZeroBite application.
    ZeroBite is a campus-wide web app to eliminate food waste by connecting canteens (providers) with students and local NGOs (consumers).
    Your goals: answer clearly, guide users to the right features, and encourage participation in a zero-waste mission.
    Keep responses concise, helpful, and encouraging.

    VERY IMPORTANT FORMATTING RULES:
    - Do NOT use Markdown. Do not use asterisks for bolding.
    - To emphasize text, wrap text in <b> and </b>.
    - Use simple hyphen bullets (-) for lists.
    - Start each bullet on a new line.
  `;

  // A compact but complete knowledge base distilled from the product PPT
  // (Everything below is reference info you can use when answering.)
  const ZEROBITE_KB = `
    ZERO BITE KNOWLEDGE BASE

    Mission and Core Idea:
    - ZeroBite creates a real-time marketplace for surplus food on campus.
    - Canteen staff list surplus meals; students and NGOs can claim them.
    - The last-mile delivery gap is solved via a <b>Volunteer Relay</b> of student volunteers.
    - The flow is coordinated by instant notifications and secure <b>OTP</b> verification at pickup.

    Key Features:
    - Real-time Surplus Marketplace: list, discover, and claim surplus meals quickly.
    - Volunteer Relay: canteens/organizers can request student volunteers for pickups and off-campus NGO deliveries.
    - Instant Notifications: keep canteens, claimants, and volunteers synced.
    - Secure OTP Verification: pickup is confirmed by one-time codes for trust and safety.
    - AI-Powered Freshness Prediction: uses Google <b>Gemini</b> to analyze a food photo, auto-fill listing details, and suggest an accurate expiry time; acts as a form-fill assistant for staff.
    - Smart Logistics:
      - Automatically find and assign the nearest available student volunteer.
      - Use Google Maps API to help canteens locate and connect with nearby NGOs (the "Reach Out" capability).
    - Gamified Experience:
      - Students earn points, badges, and <b>cashbacks</b> for saving food and completing volunteer deliveries.
      - Leaderboards and an Impact Dashboard let students track scores and personal environmental impact.
    - Global Accessibility: supports <b>32 languages</b> to include the entire campus community.

    Technical Approach (Stack):
    - Core Stack: <b>MERN</b> (MongoDB, Express.js, React.js, Node.js).
    - Frontend: React 19; Tailwind CSS (with Vite) for utility-first styling; Chart.js + Recharts for analytics; i18next for multilingual UI.
    - Backend: Node.js + Express 5 REST API; MongoDB + Mongoose.
    - Auth & Security: JWT for authentication/authorization; bcrypt.js for password hashing.
    - Media & Uploads: Cloudinary + Multer for image handling.
    - Background Tasks: node-cron for scheduled automation.
    - Notifications: web-push for real-time push notifications.
    - External APIs: Google Gemini API (chatbot + multimodal freshness/auto-form) and Google Maps Platform.

    Feasibility & Viability:
    - Technical Feasibility: High (standard MERN stack; robust services like Gemini and Cloudinary with generous free tiers).
    - Operational Feasibility: High (fits canteen and student workflows; gamified points and real cashback rewards drive adoption).

    Challenges & Risks:
    - User Adoption: keeping busy staff/students consistently engaged.
    - Food Safety: ensuring standards and safe listing practices.
    - Volunteer Reliability: coordinating the student volunteer network.

    Mitigation Strategies:
    - Incentivization: points and <b>cashback</b> to motivate continued use.
    - AI Co-pilot & Clear Guidelines: AI freshness prediction and guided listing improve safety and ease of use.
    - Community Engagement: Volunteer Relay framed as fun "quests" with bonus rewards; future addition of volunteer ratings.

    Impact & Benefits:
    - For Canteen Staff:
      - Drastically reduces waste and disposal costs.
      - Analytics dashboard tracks environmental impact and supports data-driven planning.
    - For Students:
      - Access to affordable or free meals; combats campus food insecurity.
      - Earn points, badges, and cashback rewards; see personal impact via dashboard.
    - For NGOs:
      - Reliable, streamlined sourcing of donations.
      - Volunteer Relay solves last-mile logistics for efficient collection and distribution.

    Environmental, Social, Economic Upsides:
    - Environmental: each meal saved prevents about <b>2.5 kg of CO2</b> emissions and saves hundreds of liters of water.
    - Social: strengthens community ties by uniting students, staff, and NGOs around zero waste.
    - Economic: canteens cut disposal costs; students save on meals and can earn real-world discounts.

    Future Scope:
    - Web3 Integration: blockchain-based rewards where points/cashback can be converted into cryptocurrency or NFTs for transparent incentives.
    - Predictive AI for Canteens: ML on historical data to forecast surplus and reduce overproduction at the source.
    - AI-Powered Dietary Analysis: scan food images to infer dietary labels (e.g., vegetarian, gluten-free) and trigger personalized smart alerts.

    Research & References (for factual grounding during answers if asked):
    - React.js; Node.js & Express.js; MongoDB; Cloudinary; i18next.
    - Google Gemini API; Google Maps Platform.
    - UNEP Food Waste Index Report (2021); EPA "From Farm to Kitchen"; FAO reports.
    - Food Recovery Network; Too Good To Go (market viability examples).

    Tagline:
    - "Zero Food Waste and no meal will go uneaten without a Bite!"
  `;

  // Role-aware guidance used to tailor answers and nudge users to the right actions
  let roleContext = `
    The user is a GUEST (not logged in).
    - They can browse the Homepage and the Available Surplus Food page.
    - To claim food, volunteer, or access dashboards, they need to register or log in.
    - Politely encourage sign-up to help fight food waste.
  `;

  if (user && user.role) {
    switch (user.role) {
      case "student":
        roleContext = `
          The user is a STUDENT.
          - Claiming Food: browse available meals, claim one, receive an OTP, and present it at pickup.
          - Volunteer Relay: can opt in as a volunteer for canteen→NGO deliveries; nearest-available matching helps assignments.
          - Rewards: earn points, badges, and cashback for saving food and completing delivery quests; appear on leaderboards; view impact on personal dashboard.
          - Language Access: the app supports 32 languages to include everyone.
        `;
        break;
      case "ngo":
        roleContext = `
          The user is from an NGO.
          - Sourcing: can browse and claim surplus in larger quantities for their organization.
          - Logistics: Volunteer Relay helps coordinate last-mile pickup with student volunteers.
          - Bookings: claimed items show in Bookings; pickup is confirmed with OTP with volunteers or canteen staff.
          - Discovery: canteens can find and reach you via the Google Maps-powered Reach Out feature.
        `;
        break;
      case "canteen-organizer":
        roleContext = `
          The user is a CANTEEN ORGANIZER.
          - Listing: easily list surplus food; AI co-pilot (Gemini) helps by analyzing a photo, auto-filling the form, and suggesting an expiry time.
          - Pickup: when a user claims food, ask for their OTP and record it to confirm handover.
          - Deliveries: for NGO distribution, request a student volunteer via the Volunteer Relay; the system can match nearest available.
          - Operations: view analytics (waste reduced, environmental impact) and benefit from instant notifications to coordinate smoothly.
        `;
        break;
      default:
        roleContext = `
          The user is logged in with an unrecognized role.
          - Provide generic guidance, then suggest contacting support or checking role settings.
        `;
    }
  }

  return `
    ${baseRules}

    Use this internal knowledge base when answering:
    ${ZEROBITE_KB}

    Audience context:
    ${roleContext}

    When relevant, remind users about OTP verification at pickup, the Volunteer Relay for deliveries, and the gamified rewards that include cashback. Keep answers short and friendly, and point to the next best action in the app.
  `;
};


// --- Helper function to format the AI's response text for safe HTML rendering ---
const formatResponse = (text) => {
  const boldedText = text.replace(/<b>(.*?)<\/b>/g, "<strong>$1</strong>");
  return { __html: boldedText };
};

const Chatbot = () => {
  // Mock user for demonstration. Replace with your actual useAuth() hook.
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeText = `Hi ${
        user ? user.name : "there"
      }! I'm ZeroBot. I can help you with questions about ZeroBite.`;
      const suggestionText = `You can ask me things like:\n- How does a student claim food?\n- How does the AI Freshness Prediction work?\n- How do I volunteer?`;

      setMessages([
        { sender: "ai", text: welcomeText },
        { sender: "ai", text: suggestionText },
      ]);
    }
  }, [isOpen, user, messages.length]);

  const handleSend = async () => {
    if (userInput.trim() === "" || isLoading) return;

    const newUserMessage = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, newUserMessage]);
    setUserInput("");
    setIsLoading(true);

    const systemPrompt = generateSystemPrompt(user);
    const fullPrompt = `${systemPrompt}\n\nUser Question: "${userInput}"`;

    try {
      const chatHistory = [{ role: "user", parts: [{ text: fullPrompt }] }];
      const payload = { contents: chatHistory };

      const apiKey = "AIzaSyDSLbrH5iFO3bDXAsuVjgntHzDl6IPhjfs"; // <-- PASTE YOUR KEY HERE
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();

      let aiResponseText =
        "Sorry, I couldn't get a response. Please try again.";
      if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        aiResponseText = result.candidates[0].content.parts[0].text;
      }

      const newAiMessage = { sender: "ai", text: aiResponseText };
      setMessages((prev) => [...prev, newAiMessage]);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMessage = {
        sender: "ai",
        text: "Sorry, I'm having trouble connecting. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Window */}
      <div
        className={`fixed bottom-[100px] right-4 md:right-6 w-[calc(100%-32px)] md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out z-[1000] ${
          isOpen
            ? "translate-y-0 opacity-100 visible"
            : "translate-y-5 opacity-0 invisible"
        }`}
      >
        {/* Header */}
        <div className="bg-green-800 text-white p-4 rounded-t-2xl flex justify-between items-center">
          <h3 className="text-lg font-semibold">ZeroBot</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-2xl hover:opacity-80"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-4 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.sender === "user"
                    ? "bg-green-600 text-white rounded-br-lg"
                    : "bg-gray-200 text-gray-800 rounded-bl-lg"
                }`}
              >
                <p
                  className="text-sm"
                  style={{ whiteSpace: "pre-wrap" }}
                  dangerouslySetInnerHTML={formatResponse(msg.text)}
                ></p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-200 p-3 rounded-2xl rounded-bl-lg">
                <div className="flex items-center space-x-1">
                  <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Footer/Input */}
        <div className="p-3 border-t border-gray-200 bg-white rounded-b-2xl flex items-center">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about ZeroBite..."
            disabled={isLoading}
            className="flex-1 w-full px-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="ml-3 w-10 h-10 bg-green-800 text-white rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110 disabled:bg-gray-300 disabled:scale-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-4 md:right-6 w-16 h-16 bg-green-800 text-white rounded-full shadow-xl flex items-center justify-center text-3xl z-[999] transition-transform duration-300 hover:scale-110"
        aria-label="Open chatbot"
      >
        <TbMessageChatbotFilled />
      </button>
    </>
  );
};

export default Chatbot;
