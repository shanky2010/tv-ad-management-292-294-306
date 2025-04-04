
import { ChatMessage } from '@/types';

// Function to generate a response to the user message using Gemini AI
export const generateChatbotResponse = async (
  message: string,
  history: ChatMessage[]
): Promise<string> => {
  try {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get response from chatbot service');
    }
    
    const data = await response.json();
    return data.reply;
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
