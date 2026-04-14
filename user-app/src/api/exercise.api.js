import aiClient from './aiClient';

export const exerciseApi = {
  // Add exercise — AI estimates calories burned if not provided
  addExercise: async (payload) => {
    // payload: { exercise_name, duration_minutes, notes? }
    const { data } = await aiClient.post('/coach/exercise/add/', payload);
    return data;
  },

  // Get exercise history
  getHistory: async () => {
    const { data } = await aiClient.get('/coach/exercise/history/');
    return data;
  },

  // Log calories burned via the calories app
  logBurn: async (payload) => {
    // payload: { activity_name, calories_burned, duration_minutes }
    const { data } = await aiClient.post('/log-burn/', payload);
    return data;
  },
};
