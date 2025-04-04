
import { ChatMessage } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configure Gemini AI API key
const API_KEY = "AIzaSyB3M7eOww0MLSs-nEty4rtZxGOgF3YC6Rc";
const genAI = new GoogleGenerativeAI(API_KEY);

// Function to generate a response to the user message using Gemini AI
export const generateChatbotResponse = async (
  message: string,
  history: ChatMessage[]
): Promise<string> => {
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
    const result = await chat.sendMessage(message);
    const response = result.response;
    
    return response.text();
  } catch (error) {
    console.error('Error getting chatbot response:', error);
    return "I'm sorry, I'm having trouble connecting to my AI service. Please try again later.";
  }
};

// Process the chatbot message
export const processChatbotMessage = async (message: string, history: ChatMessage[]) => {
  try {
    const response = await generateChatbotResponse(message, history);
    return { message: response };
  } catch (error) {
    console.error('Error processing chatbot message:', error);
    throw new Error('Failed to process message');
  }
};
