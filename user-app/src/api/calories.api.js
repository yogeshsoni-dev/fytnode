import aiClient from './aiClient';

export const caloriesApi = {
  // Send image directly for analysis (upload + analyze in one step)
  analyzeImage: async (imageFile) => {
    const form = new FormData();
    form.append('image', imageFile);
    const { data } = await aiClient.post('/analyze-image/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data; // { foods: [{name, calories, confidence}], total_calories, image_url }
  },

  // Log confirmed meal intake
  logIntake: async (payload) => {
    // payload: { meal_type, total_calories, protein_g?, carbs_g?, fat_g?, food_details, image_url? }
    const { data } = await aiClient.post('/log-intake/', payload);
    return data;
  },

  // Log calories burned manually
  logBurned: async ({ calories_burned, activity_name = 'Manual entry', duration_minutes }) => {
    const { data } = await aiClient.post('/log-burn/', {
      calories_burned,
      activity_name,
      ...(duration_minutes != null && { duration_minutes }),
    });
    return data;
  },

  // Get today's daily summary
  getDailySummary: async (date) => {
    const params = date ? { date } : {};
    const { data } = await aiClient.get('/daily-summary/', { params });
    return data;
  },
};
