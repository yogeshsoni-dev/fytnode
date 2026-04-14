import aiClient from './aiClient';

export const chatApi = {
  // Send a message to the health coach AI
  sendMessage: async (message) => {
    const { data } = await aiClient.post('/coach/ai/chat/', { message });
    return data; // { response, ... }
  },
};
