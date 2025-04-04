
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure Gemini AI API key
const API_KEY = "AIzaSyB3M7eOww0MLSs-nEty4rtZxGOgF3YC6Rc";
const genAI = new GoogleGenerativeAI(API_KEY);

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;
  
  if (!userMessage) {
    return res.status(400).json({ reply: "No input received" });
  }

  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const systemPrompt = "You are a helpful TV advertising assistant. You help advertisers understand how to book slots, manage campaigns, and optimize their TV advertising strategy. Keep responses concise and focused on TV advertising topics.";
    
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: "Hello, I need help with TV advertising",
        },
        {
          role: "model",
          parts: "Hello! I'm your TV advertising assistant. I can help you with booking ad slots, understanding pricing, managing your campaigns, and more. What specific aspect of TV advertising would you like to learn about today?",
        },
      ],
      generationConfig: {
        maxOutputTokens: 200,
      },
    });

    // Send the message and get a response
    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    
    return res.json({ reply: response.text() });
  } catch (error) {
    console.error("Error with Gemini API:", error);
    return res.status(500).json({ 
      reply: "Sorry, I'm having trouble connecting to my AI service. Please try again later.",
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
