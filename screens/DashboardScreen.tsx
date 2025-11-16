import React, { useState, useEffect, useMemo } from 'react';
import { Habit } from '../types';
import { getInspirationalQuote } from '../services/geminiService';

const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

interface HabitItemProps {
    habit: Habit;
    isCompleted: boolean;
    onToggle: () => void;
    onViewDetails: () => void;
    index: number;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit, isCompleted, onToggle, onViewDetails, index }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), index * 100); // Stagger animation
        return () => clearTimeout(timer);
    }, [index]);

    const formatTime = (time: string) => {
        const [hour, minute] = time.split(':');
        const hourNum = parseInt(hour, 10);
        const ampm = hourNum >= 12 ? 'PM' : 'AM';
        const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
        return `${formattedHour}:${minute} ${ampm}`;
    }

    const handleToggleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation(); // Prevent the parent's onClick from firing
        onToggle();
    };

    return (
        <div 
            onClick={onViewDetails}
            className={`flex items-stretch bg-white rounded-xl shadow-sm transition-all duration-300 ease-out transform hover:scale-105 cursor-pointer overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
            <div 
                className="flex-shrink-0 w-16 flex items-center justify-center text-3xl bg-yellow-400" 
            >
                {habit.emoji}
            </div>
            <div className="flex-grow flex items-center py-3 pl-4">
                <div>
                    <p className="font-semibold text-gray-800 text-base">{habit.name}</p>
                    {habit.reminders && habit.reminders.length > 0 && (
                         <p className="text-sm text-gray-500">{formatTime(habit.reminders[0])}</p>
                    )}
                </div>
            </div>
            <div className="flex items-center px-4">
                <button 
                    onClick={handleToggleClick} 
                    className={`w-20 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${isCompleted ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300'}`}
                >
                    DONE
                </button>
            </div>
        </div>
    );
};

const StreakCircle: React.FC<{ streak: number }> = ({ streak }) => {
    const size = 180;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = streak > 0 ? ((streak - 1) % 7 + 1) / 7 : 0;
    const offset = circumference - progress * circumference;

    return (
        <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#FBBF24"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-700 ease-in-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <div className="text-white text-2xl">
                    {Array.from({ length: Math.min(streak, 7) }).map((_, i) => '🔥')}
                </div>
                <p className="text-white font-bold text-lg mt-1 tracking-wider">
                    {streak} DAY STREAK
                </p>
            </div>
        </div>
    );
};


interface DashboardScreenProps {
  habits: Habit[];
  onToggleHabit: (habitId: string, date: string) => void;
  onViewDetails: (habitId: string) => void;
  longestStreak: number;
}

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
};

const DashboardScreen: React.FC<DashboardScreenProps> = ({ habits, onToggleHabit, onViewDetails, longestStreak }) => {
    const [quote, setQuote] = useState<string>('Loading...');
    const todayString = useMemo(() => getTodayDateString(), []);
    
    useEffect(() => {
        getInspirationalQuote().then(setQuote);
    }, []);
    
    const todayDayOfWeek = useMemo(() => new Date().getDay(), []);

    const habitsForToday = useMemo(() => habits.filter(habit => {
        if (habit.type === 'daily') return true;
        if (habit.type === 'weekly') return habit.daysOfWeek?.includes(todayDayOfWeek);
        return false;
    }), [habits, todayDayOfWeek]);
    
    const listHeader = "Today's Habits";

    return (
        <div className="space-y-6">
            <header className="animate-fade-in">
                <h1 className="text-2xl font-bold text-white">{getGreeting()}, Alex</h1>
            </header>
            
            <div className="flex justify-center my-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <StreakCircle streak={longestStreak} />
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-white p-4 rounded-xl text-center shadow-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
                <p className="text-gray-800 italic font-medium">"{quote}"</p>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                 <h2 className="text-xl font-bold text-white mb-3">{listHeader}</h2>
                {habitsForToday.length > 0 ? (
                     <div className="space-y-3">
                        {habitsForToday.map((habit, index) => {
                             const isCompleted = !!habit.completions[todayString];
                             return (
                                <HabitItem 
                                    key={habit.id} 
                                    habit={habit}
                                    isCompleted={isCompleted}
                                    onToggle={() => onToggleHabit(habit.id, todayString)}
                                    onViewDetails={() => onViewDetails(habit.id)}
                                    index={index}
                                />
                             )
                        })}
                    </div>
                ) : (
                     <div className="text-center py-10 px-4 bg-gray-800 rounded-xl shadow-sm">
                        <p className="text-gray-400">No habits for today.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardScreen;