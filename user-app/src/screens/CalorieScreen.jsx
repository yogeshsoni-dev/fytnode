import { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Flame,
  Loader2,
  Plus,
  Trash2,
  UtensilsCrossed,
  X,
  Pencil,
} from 'lucide-react';
import { caloriesApi } from '../api/calories.api';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];

function todayDateStr() {
  return new Date().toISOString().split('T')[0];
}

export default function CalorieScreen() {
  const fileInputRef = useRef(null);

  // Photo analysis flow
  const [preview, setPreview]           = useState(null);   // data URL for img preview
  const [imageFile, setImageFile]       = useState(null);   // raw File object
  const [analyzing, setAnalyzing]       = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null); // { foods, total_calories, image_url }
  const [selectedFoods, setSelectedFoods]   = useState([]);   // which foods are checked

  // Meal-type selection & logging
  const [mealType, setMealType] = useState('lunch');
  const [logging, setLogging]   = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);

  // Daily summary
  const [summary, setSummary]         = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Manual entry
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein]   = useState('');
  const [manualCarbs, setManualCarbs]       = useState('');
  const [manualFat, setManualFat]           = useState('');
  const [manualBurned, setManualBurned]     = useState('');
  const [manualMealType, setManualMealType] = useState('lunch');
  const [manualLogging, setManualLogging]   = useState(false);
  const [manualSuccess, setManualSuccess]   = useState(false);

  // Feedback
  const [error, setError]     = useState('');

  const loadSummary = async () => {
    setSummaryLoading(true);
    try {
      const s = await caloriesApi.getDailySummary(todayDateStr());
      setSummary(s);
    } catch {
      // summary is optional; silently ignore
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => { loadSummary(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setAnalysisResult(null);
    setSelectedFoods([]);
    setLogSuccess(false);
    setError('');
    // Reset input so same file can be reselected
    e.target.value = '';
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setAnalyzing(true);
    setError('');
    try {
      const result = await caloriesApi.analyzeImage(imageFile);
      setAnalysisResult(result);
      // Pre-select all detected foods
      setSelectedFoods((result.foods ?? []).map((_, i) => i));
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to analyze image. Try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleFood = (index) => {
    setSelectedFoods((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const selectedCalories = (analysisResult?.foods ?? [])
    .filter((_, i) => selectedFoods.includes(i))
    .reduce((sum, f) => sum + (f.calories || 0), 0);

  const selectedProtein = (analysisResult?.foods ?? [])
    .filter((_, i) => selectedFoods.includes(i))
    .reduce((sum, f) => sum + (f.protein_g || 0), 0);

  const selectedCarbs = (analysisResult?.foods ?? [])
    .filter((_, i) => selectedFoods.includes(i))
    .reduce((sum, f) => sum + (f.carbs_g || 0), 0);

  const selectedFat = (analysisResult?.foods ?? [])
    .filter((_, i) => selectedFoods.includes(i))
    .reduce((sum, f) => sum + (f.fat_g || 0), 0);

  const handleLogMeal = async () => {
    if (selectedFoods.length === 0) return;
    const foods = (analysisResult?.foods ?? []).filter((_, i) => selectedFoods.includes(i));
    setLogging(true);
    setError('');
    try {
      await caloriesApi.logIntake({
        meal_type:      mealType,
        total_calories: selectedCalories,
        protein_g:      selectedProtein,
        carbs_g:        selectedCarbs,
        fat_g:          selectedFat,
        food_details:   foods.map((f) => ({
          name: f.name, calories: f.calories,
          protein_g: f.protein_g || 0, carbs_g: f.carbs_g || 0, fat_g: f.fat_g || 0,
        })),
        image_url:      analysisResult?.image_url,
      });
      setLogSuccess(true);
      // Refresh daily summary
      await loadSummary();
      // Reset flow after short delay
      setTimeout(() => {
        setPreview(null);
        setImageFile(null);
        setAnalysisResult(null);
        setSelectedFoods([]);
        setLogSuccess(false);
      }, 2000);
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to log meal. Try again.');
    } finally {
      setLogging(false);
    }
  };

  const handleManualLog = async () => {
    const intake  = parseInt(manualCalories, 10) || 0;
    const burned  = parseInt(manualBurned,   10) || 0;
    if (intake === 0 && burned === 0) return;
    setManualLogging(true);
    setError('');
    try {
      if (intake > 0) {
        await caloriesApi.logIntake({
          meal_type:      manualMealType,
          total_calories: intake,
          protein_g:      parseInt(manualProtein, 10) || 0,
          carbs_g:        parseInt(manualCarbs,   10) || 0,
          fat_g:          parseInt(manualFat,     10) || 0,
          food_details:   [],
        });
      }
      if (burned > 0) {
        await caloriesApi.logBurned({ calories_burned: burned });
      }
      setManualSuccess(true);
      setManualCalories('');
      setManualProtein('');
      setManualCarbs('');
      setManualFat('');
      setManualBurned('');
      await loadSummary();
      setTimeout(() => setManualSuccess(false), 2000);
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to log. Try again.');
    } finally {
      setManualLogging(false);
    }
  };

  const handleDiscard = () => {
    setPreview(null);
    setImageFile(null);
    setAnalysisResult(null);
    setSelectedFoods([]);
    setLogSuccess(false);
    setError('');
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Daily Summary */}
      {summaryLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Calorie row */}
          <div className="grid grid-cols-3 gap-2">
            <SummaryCard label="Intake" value={summary?.total_intake ?? 0} unit="kcal" color="indigo" />
            <SummaryCard label="Burned" value={summary?.total_burned ?? 0} unit="kcal" color="emerald" />
            <SummaryCard label="Net"    value={summary?.net_calories  ?? 0} unit="kcal" color="amber" />
          </div>
          {/* Macro row */}
          <div className="grid grid-cols-3 gap-2">
            <SummaryCard label="Protein" value={summary?.total_protein_g ?? 0} unit="g" color="violet" />
            <SummaryCard label="Carbs"   value={summary?.total_carbs_g   ?? 0} unit="g" color="sky" />
            <SummaryCard label="Fat"     value={summary?.total_fat_g     ?? 0} unit="g" color="rose" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Success */}
      {logSuccess && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Meal logged successfully!
        </div>
      )}

      {/* Photo Upload / Analysis Flow */}
      {!preview ? (
        /* No image selected — show camera trigger */
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-indigo-300 rounded-2xl py-10 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 transition-colors"
        >
          <Camera className="w-10 h-10 text-indigo-400" />
          <div className="text-center">
            <p className="font-semibold text-indigo-700">Take a food photo</p>
            <p className="text-sm text-indigo-500 mt-0.5">AI will detect calories for you</p>
          </div>
        </button>
      ) : (
        /* Image selected */
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
          {/* Preview */}
          <div className="relative">
            <img
              src={preview}
              alt="Food preview"
              className="w-full h-52 object-cover"
            />
            {/* Discard button */}
            <button
              onClick={handleDiscard}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Analyze button (shown before analysis) */}
            {!analysisResult && (
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing with AI…
                  </>
                ) : (
                  <>
                    <Flame className="w-5 h-5" />
                    Analyze Calories
                  </>
                )}
              </button>
            )}

            {/* Analysis Results */}
            {analysisResult && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Detected Foods — tap to toggle
                </h3>

                {(analysisResult.foods ?? []).length === 0 ? (
                  <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                    <UtensilsCrossed className="w-4 h-4" />
                    No food items detected. Try a clearer photo.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(analysisResult.foods ?? []).map((food, i) => {
                      const selected = selectedFoods.includes(i);
                      return (
                        <button
                          key={i}
                          onClick={() => toggleFood(i)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-colors ${
                            selected
                              ? 'border-indigo-300 bg-indigo-50 text-indigo-900'
                              : 'border-gray-200 bg-gray-50 text-gray-400 line-through'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                selected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                              }`}
                            >
                              {selected && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <div>
                              <p className="font-medium capitalize">{food.name}</p>
                              {(food.protein_g || food.carbs_g || food.fat_g) ? (
                                <p className="text-xs opacity-60 mt-0.5">
                                  P {food.protein_g ?? 0}g · C {food.carbs_g ?? 0}g · F {food.fat_g ?? 0}g
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <span className="text-sm font-semibold">{food.calories} kcal</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Total and meal type */}
                {selectedFoods.length > 0 && (
                  <>
                    <div className="bg-indigo-50 rounded-xl px-4 py-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-indigo-700">Selected total</span>
                        <span className="font-bold text-indigo-700 text-lg">{selectedCalories} kcal</span>
                      </div>
                      {(selectedProtein > 0 || selectedCarbs > 0 || selectedFat > 0) && (
                        <p className="text-xs text-indigo-500">
                          Protein {selectedProtein}g · Carbs {selectedCarbs}g · Fat {selectedFat}g
                        </p>
                      )}
                    </div>

                    {/* Meal type selector */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                        Meal Type
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {MEAL_TYPES.map((type) => (
                          <button
                            key={type}
                            onClick={() => setMealType(type)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                              mealType === type
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Log button */}
                    <button
                      onClick={handleLogMeal}
                      disabled={logging}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
                    >
                      {logging ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                      {logging ? 'Logging…' : `Add to Log (${selectedCalories} kcal)`}
                    </button>
                  </>
                )}

                {/* Re-analyze with different photo */}
                <button
                  onClick={handleDiscard}
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Use different photo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Entry */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <Pencil className="w-4 h-4" />
          Log Manually
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
              Intake (kcal)
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 500"
              value={manualCalories}
              onChange={(e) => setManualCalories(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
              Burned (kcal)
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 300"
              value={manualBurned}
              onChange={(e) => setManualBurned(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
        </div>

        {/* Macros — only shown when logging intake */}
        {manualCalories > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold text-violet-500 uppercase tracking-wide mb-1 block">
                Protein (g)
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={manualProtein}
                onChange={(e) => setManualProtein(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-sky-500 uppercase tracking-wide mb-1 block">
                Carbs (g)
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={manualCarbs}
                onChange={(e) => setManualCarbs(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-rose-500 uppercase tracking-wide mb-1 block">
                Fat (g)
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={manualFat}
                onChange={(e) => setManualFat(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          </div>
        )}

        {/* Meal type — only relevant when intake is filled */}
        {manualCalories > 0 && (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
              Meal Type
            </label>
            <div className="flex flex-wrap gap-2">
              {MEAL_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setManualMealType(type)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                    manualMealType === type
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {manualSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Logged successfully!
          </div>
        )}

        <button
          onClick={handleManualLog}
          disabled={manualLogging || (!manualCalories && !manualBurned)}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-40"
        >
          {manualLogging ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          {manualLogging ? 'Logging…' : 'Log Entry'}
        </button>
      </div>

      {/* Hidden file input — accept images, capture camera on mobile */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

function SummaryCard({ label, value, unit, color }) {
  const colors = {
    indigo:  'bg-indigo-50 text-indigo-700 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber:   'bg-amber-50 text-amber-700 border-amber-100',
    violet:  'bg-violet-50 text-violet-700 border-violet-100',
    sky:     'bg-sky-50 text-sky-700 border-sky-100',
    rose:    'bg-rose-50 text-rose-700 border-rose-100',
  };
  return (
    <div className={`rounded-xl border p-3 text-center ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
      <p className="text-xs opacity-60">{unit}</p>
    </div>
  );
}
