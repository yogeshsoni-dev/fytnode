import aiClient from './aiClient';

export const healthProfileApi = {
  // Create or update health profile
  createOrUpdate: async (payload) => {
    // payload: { name, age, height_cm, weight_kg, gender, fitness_goal, activity_level }
    const { data } = await aiClient.post('/coach/user/create/', payload);
    return data;
  },

  // Get current user profile
  getProfile: async () => {
    const { data } = await aiClient.get('/coach/user/profile/');
    return data;
  },
};
