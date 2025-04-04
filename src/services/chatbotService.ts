
import { ChatMessage } from '@/types';

// Simple AI responses for common advertising questions
const knowledgeBase = [
  {
    keywords: ['hello', 'hi', 'hey', 'greetings'],
    response: "Hello! I'm your advertising assistant. How can I help you with your TV ad campaigns today?"
  },
  {
    keywords: ['book', 'slot', 'schedule', 'reservation'],
    response: "To book an ad slot, you can browse available slots in the 'Ad Slots' section, select one that fits your target audience and budget, then click 'Book Now' to complete your reservation."
  },
  {
    keywords: ['cost', 'price', 'expensive', 'budget', 'pricing'],
    response: "Ad slot pricing varies based on the channel, time slot, and estimated viewership. Prime time slots on popular channels typically cost more but reach larger audiences. You can see all pricing details in the Ad Slots section."
  },
  {
    keywords: ['cancel', 'refund', 'change'],
    response: "You can manage or cancel your bookings in the 'My Bookings' section. Cancellations made more than 48 hours before the scheduled air time are eligible for a full refund. For changes, please select the booking and use the edit option."
  },
  {
    keywords: ['performance', 'analytics', 'stats', 'metrics', 'roi'],
    response: "You can track your ad performance in the dashboard. We provide metrics like total views, engagement rate, and conversion data. For more detailed analytics, check the reports section in your dashboard."
  },
  {
    keywords: ['upload', 'video', 'creative', 'ad content'],
    response: "You can upload your ad content in the 'My Ads' section. We support most video formats up to 1GB in size. Make sure your content adheres to our guidelines for broadcast standards."
  },
  {
    keywords: ['payment', 'invoice', 'bill', 'credit card'],
    response: "You can manage your payment methods and view invoices in the Settings section under 'Billing & Payments'. We accept all major credit cards and bank transfers."
  },
  {
    keywords: ['target', 'audience', 'demographic', 'viewers'],
    response: "Each ad slot includes information about the typical audience demographics and estimated viewership. You can filter slots by audience type in the Ad Slots section to find the best match for your target market."
  }
];

// Simple function to find a relevant response based on keywords
const findRelevantResponse = (message: string): string => {
  const lowercaseMessage = message.toLowerCase();
  
  // Check if any keywords match
  for (const item of knowledgeBase) {
    if (item.keywords.some(keyword => lowercaseMessage.includes(keyword))) {
      return item.response;
    }
  }
  
  // Default response if no keywords match
  return "I'm not sure I understand your question about advertising. Could you please rephrase or ask about booking ad slots, pricing, uploading content, or campaign performance?";
};

// Function to generate a response to the user message
export const generateChatbotResponse = async (
  message: string,
  history: ChatMessage[]
): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get a response based on the message content
  return findRelevantResponse(message);
};

// Process the chatbot message
export const processChatbotMessage = async (message: string, history: ChatMessage[]) => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    const response = await generateChatbotResponse(message, history);
    return { message: response };
  } catch (error) {
    console.error('Error processing chatbot message:', error);
    throw new Error('Failed to process message');
  }
};
