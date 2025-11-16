import React, { useState, useEffect, useMemo } from 'react';
import { Habit, Screen } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import DashboardScreen from './screens/DashboardScreen';
import HabitForm from './components/HabitForm';
import HabitDetailScreen from './screens/HabitDetailScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import SettingsScreen from './screens/SettingsScreen';
import BottomNav from './components/BottomNav';

// Mock initial data for first-time users
const initialHabits: Habit[] = [
    {
        id: '1',
        name: 'Workout',
        emoji: '💪',
        color: '#FF6B6B',
        type: 'daily',
        reminders: ['07:00'],
        completions: { '2024-07-20': '✅', '2024-07-21': '✅' },
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Read for 30 min',
        emoji: '📖',
        color: '#8A6FDF',
        type: 'daily',
        reminders: ['08:30'],
        completions: { '2024-07-21': '😊' },
        createdAt: new Date().toISOString()
    },
     {
        id: '3',
        name: 'Meditate',
        emoji: '🧘',
        color: '#4ECDC4',
        type: 'daily',
        reminders: ['18:00'],
        completions: { },
        createdAt: new Date().toISOString()
    }
];

const calculateCurrentStreak = (completions: Record<string, string>): number => {
    if (!completions) return 0;
    const sortedDates = Object.keys(completions)
        .filter(date => completions[date])
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        
    if (sortedDates.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const latestCompletion = new Date(sortedDates[0]);
    latestCompletion.setHours(0, 0, 0, 0);
    
    const diffInDays = (today.getTime() - latestCompletion.getTime()) / (1000 * 60 * 60 * 24);

    if (diffInDays > 1) {
        return 0;
    }

    let streak = 1;
    let lastDate = latestCompletion;

    for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        currentDate.setHours(0, 0, 0, 0);
        const diff = (lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diff === 1) {
            streak++;
            lastDate = currentDate;
        } else {
            break;
        }
    }
    return streak;
};


const App: React.FC = () => {
    const [habits, setHabits] = useLocalStorage<Habit[]>('habits', initialHabits);
    const [modal, setModal] = useState<'add' | 'edit' | null>(null);
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
    const [screen, setScreen] = useState<Screen>('dashboard');

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const todayString = useMemo(() => new Date().toISOString().split('T')[0], []);
    const todayDayOfWeek = useMemo(() => new Date().getDay(), []);

    useEffect(() => {
        const checkReminders = () => {
            if (!('Notification' in window) || Notification.permission !== 'granted') {
                return;
            }

            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            
            habits.forEach(habit => {
                const isForToday = habit.type === 'daily' || (habit.type === 'weekly' && habit.daysOfWeek?.includes(todayDayOfWeek));
                const isCompletedToday = !!habit.completions[todayString];

                if (isForToday && !isCompletedToday && habit.reminders?.includes(currentTime)) {
                    new Notification('HabitFlow Reminder', {
                        body: `It's time for: ${habit.name} ${habit.emoji}`,
                        tag: `${habit.id}-${currentTime}`, // Prevents multiple notifications for the same habit reminder
                    });
                }
            });
        };

        const intervalId = setInterval(checkReminders, 60000); // Check every minute
        checkReminders(); // Initial check

        return () => clearInterval(intervalId);
    }, [habits, todayDayOfWeek, todayString]);
    
    const longestStreak = useMemo(() => {
        if (habits.length === 0) return 0;
        return Math.max(...habits.map(habit => calculateCurrentStreak(habit.completions)));
    }, [habits]);

    const handleSaveHabit = (habit: Habit) => {
        setHabits(prev => {
            const existing = prev.find(h => h.id === habit.id);
            if (existing) {
                return prev.map(h => h.id === habit.id ? habit : h);
            }
            return [...prev, habit];
        });
        setModal(null);
        setSelectedHabitId(null);
    };

    const handleToggleHabit = (habitId: string, date: string) => {
        setHabits(prev => prev.map(h => {
            if (h.id === habitId) {
                const newCompletions = { ...h.completions };
                if (newCompletions[date]) {
                    delete newCompletions[date];
                } else {
                    newCompletions[date] = '✅';
                }
                return { ...h, completions: newCompletions };
            }
            return h;
        }));
    };
    
    const handleUpdateCompletion = (habitId: string, date: string, emoji: string | null) => {
        setHabits(prev => prev.map(h => {
            if (h.id === habitId) {
                const newCompletions = { ...h.completions };
                if (emoji) {
                    newCompletions[date] = emoji;
                } else {
                    delete newCompletions[date];
                }
                return { ...h, completions: newCompletions };
            }
            return h;
        }));
    };

    const handleDeleteHabit = (habitId: string) => {
        setHabits(prev => prev.filter(h => h.id !== habitId));
        setSelectedHabitId(null);
    }

    const handleReset = () => {
        setHabits([]);
    };

    const handleImport = (importedHabits: Habit[]) => {
        setHabits(importedHabits);
    };
    
    const selectedHabit = habits.find(h => h.id === selectedHabitId);

    const renderScreen = () => {
        if (selectedHabit) {
            return <HabitDetailScreen 
                habit={selectedHabit}
                onClose={() => setSelectedHabitId(null)}
                onEdit={() => setModal('edit')}
                onDelete={() => handleDeleteHabit(selectedHabit.id)}
                onUpdateCompletion={handleUpdateCompletion}
            />
        }
        
        if (modal) {
             return <HabitForm 
                onSave={handleSaveHabit} 
                onClose={() => { setModal(null); setSelectedHabitId(null); }}
                habitToEdit={modal === 'edit' ? selectedHabit : null}
            />
        }
        
        switch(screen) {
            case 'analytics':
                return <AnalyticsScreen habits={habits} />;
            case 'settings':
                return <SettingsScreen habits={habits} onImport={handleImport} onReset={handleReset} />;
            case 'dashboard':
            default:
                return <DashboardScreen habits={habits} onToggleHabit={handleToggleHabit} onViewDetails={setSelectedHabitId} longestStreak={longestStreak} />;
        }
    };

    return (
        <div className="text-gray-100 min-h-screen font-sans">
            <div className="container mx-auto max-w-lg p-4 pb-40">
                {renderScreen()}
            </div>
            
            {!modal && !selectedHabitId && (
                <BottomNav 
                    activeScreen={screen} 
                    setScreen={setScreen}
                    onAddClick={() => setModal('add')} 
                />
            )}
        </div>
    );
};

export default App;