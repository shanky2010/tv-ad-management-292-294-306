
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
    // Use the gemini-1.5-flash model which is available in the current API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Prepare chat history for the Gemini API
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    // Add system prompt to guide the AI
    const chatSession = model.startChat({
      generationConfig: {
        maxOutputTokens: 250,
        temperature: 0.7,
      },
    });

    // Send the message and get a response
    const result = await chatSession.sendMessage([
      {
        text: `You are a helpful TV advertising assistant. Help advertisers understand how to book slots, manage campaigns, and optimize their TV advertising strategy. 
        Keep responses concise and focused on TV advertising topics.
        
        User query: ${message}`
      }
    ]);
    
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
