import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Habit } from '../types';

interface AnalyticsScreenProps {
  habits: Habit[];
}

const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ habits }) => {
  const weeklyChartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map((day, index) => ({ name: day, completed: 0 }));

    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();

        habits.forEach(habit => {
            if (habit.completions[dateString]) {
                data[dayOfWeek].completed += 1;
            }
        });
    }
    // sort data to start from sunday
    const dayOfWeek = today.getDay();
    return [...data.slice(dayOfWeek + 1), ...data.slice(0, dayOfWeek + 1)].reverse();
  }, [habits]);

  const totalCompletions = useMemo(() => {
    return habits.reduce((acc, habit) => acc + Object.keys(habit.completions).length, 0);
  }, [habits]);

  const bestHabit = useMemo(() => {
    if (habits.length === 0) return null;
    return habits.reduce((best, current) => {
        return Object.keys(current.completions).length > Object.keys(best.completions).length ? current : best;
    });
  }, [habits]);
  
  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-3xl font-bold text-white">Analytics</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl text-center shadow-sm">
            <p className="text-3xl font-bold text-yellow-500">{habits.length}</p>
            <p className="text-sm text-gray-600">Total Habits</p>
        </div>
        <div className="bg-white p-4 rounded-xl text-center shadow-sm">
            <p className="text-3xl font-bold text-yellow-500">{totalCompletions}</p>
            <p className="text-sm text-gray-600">Total Completions</p>
        </div>
      </div>
      
      {bestHabit && (
          <div className="bg-white p-4 rounded-xl shadow-sm text-gray-900">
            <h3 className="font-semibold mb-2">Most Consistent Habit</h3>
            <div className="flex items-center space-x-3">
                <span className="text-2xl">{bestHabit.emoji}</span>
                <p className="text-gray-800">{bestHabit.name}</p>
                <p className="ml-auto font-bold text-yellow-500">{Object.keys(bestHabit.completions).length} days</p>
            </div>
          </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Weekly Completions</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={weeklyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', color: '#1F2937' }}
                cursor={{ fill: 'rgba(229, 231, 235, 0.5)' }}
              />
              <Legend wrapperStyle={{color: '#374151'}} />
              <Bar dataKey="completed" fill="#FBBF24" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsScreen;