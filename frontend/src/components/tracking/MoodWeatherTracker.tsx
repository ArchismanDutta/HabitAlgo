import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getTodayString } from '@/utils/dateUtils';
import { logService } from '@/services/logService';
import { toast } from 'sonner';

const MOOD_EMOJIS = [
  { emoji: '😊', label: 'Happy', value: 5 },
  { emoji: '😐', label: 'Neutral', value: 3 },
  { emoji: '😠', label: 'Angry', value: 1 },
  { emoji: '😎', label: 'Cool', value: 4 },
  { emoji: '🤩', label: 'Excited', value: 5 },
  { emoji: '😴', label: 'Tired', value: 2 },
  { emoji: '😰', label: 'Anxious', value: 1 },
  { emoji: '🥰', label: 'Loving', value: 5 }
];

const WEATHER_OPTIONS = [
  { emoji: '☀️', label: 'Sunny' },
  { emoji: '☁️', label: 'Cloudy' },
  { emoji: '🌧️', label: 'Rainy' },
  { emoji: '⛈️', label: 'Stormy' },
  { emoji: '🌨️', label: 'Snowy' },
  { emoji: '🌤️', label: 'Partly Cloudy' }
];

interface DailyTracking {
  mood: string;
  moodValue: number;
  sleep: number;
  weather: string;
}

export default function MoodWeatherTracker() {
  const [tracking, setTracking] = useState<DailyTracking>({
    mood: '😊',
    moodValue: 5,
    sleep: 8,
    weather: '☀️'
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadTodaysTracking();
  }, []);

  const loadTodaysTracking = async () => {
    try {
      const today = getTodayString();
      const logs = await logService.getByDate(today);

      if (logs.length > 0 && logs[0].mood) {
        // Load from first log
        const log = logs[0];
        setTracking({
          mood: getMoodEmoji(log.mood || 5),
          moodValue: log.mood || 5,
          sleep: log.screenTime?.morning || 8,
          weather: log.note || '☀️' // Store weather in note field temporarily
        });
        setSaved(true);
      }
    } catch (error) {
      console.error('Failed to load tracking:', error);
      toast.error('Failed to load tracking data');
    }
  };

  const getMoodEmoji = (value: number) => {
    const mood = MOOD_EMOJIS.find(m => m.value === value);
    return mood?.emoji || '😊';
  };

  const handleMoodSelect = (emoji: string, value: number) => {
    setTracking({ ...tracking, mood: emoji, moodValue: value });
    setSaved(false);
  };

  const handleWeatherSelect = (emoji: string) => {
    setTracking({ ...tracking, weather: emoji });
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      const today = getTodayString();

      // Save mood value
      await logService.upsert({
        date: today,
        habitId: 'mood-tracker', // Special ID for mood tracking
        completed: true,
        value: tracking.moodValue,
        mood: tracking.moodValue,
        note: tracking.weather // Store weather temporarily in note
      });

      setSaved(true);
      toast.success('Daily tracking saved!');
    } catch (error) {
      toast.error('Failed to save tracking');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="bg-yellow-100 dark:bg-yellow-900 px-4 py-2 rounded">
          Mood Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Mood</Label>
          <div className="flex flex-wrap gap-1.5 xxs:gap-2 justify-center">
            {MOOD_EMOJIS.map(({ emoji, label, value }) => (
              <button
                key={emoji}
                onClick={() => handleMoodSelect(emoji, value)}
                className={`text-2xl xxs:text-3xl w-10 h-10 xxs:w-12 xxs:h-12 sm:w-14 sm:h-14 rounded-lg transition-all hover:scale-110 flex items-center justify-center ${
                  tracking.mood === emoji
                    ? 'bg-primary/20 ring-2 ring-primary scale-110'
                    : 'hover:bg-accent'
                }`}
                title={label}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Sleep */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Sleep</Label>
            <span className="text-sm text-muted-foreground">Hours</span>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={tracking.sleep}
              onChange={(e) => {
                setTracking({ ...tracking, sleep: parseFloat(e.target.value) });
                setSaved(false);
              }}
              className="text-center text-2xl font-bold"
            />
            <span className="text-2xl">😴</span>
          </div>
          <div className="flex gap-2">
            {[6, 7, 8, 9].map(hours => (
              <Button
                key={hours}
                size="sm"
                variant={tracking.sleep === hours ? 'default' : 'outline'}
                onClick={() => {
                  setTracking({ ...tracking, sleep: hours });
                  setSaved(false);
                }}
              >
                {hours}h
              </Button>
            ))}
          </div>
        </div>

        {/* Weather */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Weather</Label>
          <div className="flex flex-wrap gap-1.5 xxs:gap-2 justify-center">
            {WEATHER_OPTIONS.map(({ emoji, label }) => (
              <button
                key={emoji}
                onClick={() => handleWeatherSelect(emoji)}
                className={`text-2xl xxs:text-3xl w-10 h-10 xxs:w-12 xxs:h-12 sm:w-14 sm:h-14 rounded-lg transition-all hover:scale-110 flex items-center justify-center ${
                  tracking.weather === emoji
                    ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500 scale-110'
                    : 'hover:bg-accent'
                }`}
                title={label}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full"
          variant={saved ? 'secondary' : 'default'}
        >
          {saved ? '✓ Saved' : 'Save Today\'s Tracking'}
        </Button>
      </CardContent>
    </Card>
  );
}
