
import { StreamChat } from 'stream-chat';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

if (!apiKey) {
  console.warn('Stream API key is missing. Chat functionality will be disabled.');
}

// Initialize the Stream Chat client
export const chatClient = apiKey ? StreamChat.getInstance(apiKey) : null;
