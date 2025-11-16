
import React, { useMemo, useState } from 'react';
import { Habit } from '../types';

interface HabitDetailScreenProps {
  habit: Habit;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateCompletion: (habitId: string, date: string, emoji: string | null) => void;
}

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const MOOD_EMOJIS = ['😊', '😢', '😎', '✅', '❌'];

const EmojiPicker: React.FC<{ 
    onSelect: (emoji: string | null) => void; 
    onClose: () => void;
}> = ({ onSelect, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-white text-lg font-semibold text-center mb-4">How did it go?</h3>
                <div className="flex justify-center space-x-2 sm:space-x-4">
                    {MOOD_EMOJIS.map(emoji => (
                        <button key={emoji} onClick={() => onSelect(emoji)} className="text-3xl sm:text-4xl p-2 rounded-full hover:bg-gray-700 transition-colors transform hover:scale-110">
                            {emoji}
                        </button>
                    ))}
                    <button title="Clear entry" onClick={() => onSelect(null)} className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gray-700 text-gray-400 rounded-full hover:bg-gray-600 transition-colors transform hover:scale-110">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
                <button onClick={onClose} className="w-full mt-6 text-center text-gray-400 text-sm hover:text-white">Cancel</button>
            </div>
        </div>
    );
};


const MonthlyCalendar: React.FC<{ 
    completions: Record<string, string>; 
    color: string;
    onDayClick: (date: string) => void;
}> = ({ completions, color, onDayClick }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const changeMonth = (offset: number) => {
        setCurrentMonth(new Date(year, month + offset, 1));
    };

    const cells = [];
    for (let i = 0; i < firstDay; i++) {
        cells.push(<div key={`empty-${i}`} className="w-10 h-10 md:w-11 md:h-11"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const dateString = date.toISOString().split('T')[0];
        const completionEmoji = completions[dateString];
        const isToday = date.getTime() === today.getTime();
        const isFuture = date > today;

        cells.push(
            <button 
                key={i} 
                disabled={isFuture}
                onClick={() => onDayClick(dateString)}
                className={`w-10 h-10 md:w-11 md:h-11 rounded-lg flex items-center justify-center text-sm transition-transform transform-gpu ${isToday ? 'border-2 border-yellow-400' : ''} ${isFuture ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:bg-gray-600 hover:scale-105'}`}
                style={{ backgroundColor: completionEmoji ? color : '#374151' }}
            >
                {completionEmoji ? <span className="text-2xl">{completionEmoji}</span> : i}
            </button>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                <h3 className="text-lg font-semibold">{currentMonth.toLocaleString('default', { month: 'long' })} {year}</h3>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
            </div>
            <div className="grid grid-cols-7 gap-1 md:gap-2 justify-items-center">
                 {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day} className="text-center text-xs text-gray-400 w-10 md:w-11">{day}</div>)}
                 {cells}
            </div>
        </div>
    );
};


const HabitDetailScreen: React.FC<HabitDetailScreenProps> = ({ habit, onClose, onEdit, onDelete, onUpdateCompletion }) => {
    const [pickerState, setPickerState] = useState<{ open: boolean; date: string | null }>({ open: false, date: null });

    const { currentStreak, bestStreak } = useMemo(() => {
        const dates = Object.keys(habit.completions).sort().reverse();
        let current = 0;
        let best = 0;
        let streak = 0;
        let today = new Date();
        today.setHours(0,0,0,0);
        let yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let currentDate = new Date(today);
        let isCurrentStreak = true;

        for (let i = 0; i < dates.length; i++) {
            const completionDate = new Date(dates[i] + 'T00:00:00');
            
            if (isCurrentStreak) {
                if (completionDate.getTime() === currentDate.getTime() || completionDate.getTime() === yesterday.getTime()) {
                    current++;
                    currentDate = completionDate;
                    yesterday = new Date(currentDate);
                    yesterday.setDate(yesterday.getDate() - 1);
                } else {
                    isCurrentStreak = false;
                }
            }
        }
        
        if (dates.length > 0) {
            streak = 1;
            best = 1;
            for(let i = 1; i < dates.length; i++) {
                const d1 = new Date(dates[i-1]);
                const d2 = new Date(dates[i]);
                const diff = (d1.getTime() - d2.getTime()) / (1000 * 3600 * 24);
                if(diff === 1) {
                    streak++;
                } else {
                    streak = 1;
                }
                if (streak > best) {
                    best = streak;
                }
            }
        } else {
            best = 0;
        }


        return { currentStreak: current, bestStreak: best };
    }, [habit.completions]);


  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the habit "${habit.name}"?`)) {
        onDelete();
    }
  }
  
  const handleDayClick = (dateString: string) => {
    setPickerState({ open: true, date: dateString });
  };

  const handleEmojiSelect = (emoji: string | null) => {
      if (pickerState.date) {
          onUpdateCompletion(habit.id, pickerState.date, emoji);
      }
      setPickerState({ open: false, date: null });
  };
  
  const closePicker = () => setPickerState({ open: false, date: null });


  return (
    <div className="fixed inset-0 bg-gray-900 p-4 flex flex-col animate-fade-in space-y-6">
      {pickerState.open && (
          <EmojiPicker onSelect={handleEmojiSelect} onClose={closePicker} />
      )}
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="text-gray-400 hover:text-white p-2 -ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex space-x-2">
            <button onClick={onEdit} className="text-gray-400 hover:text-white p-2"><EditIcon /></button>
            <button onClick={handleDelete} className="text-red-400 hover:text-red-300 p-2"><TrashIcon /></button>
        </div>
      </div>

      <div className="text-center">
        <span className="text-6xl">{habit.emoji}</span>
        <h1 className="text-3xl font-bold text-white mt-2">{habit.name}</h1>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-xl text-center">
            <p className="text-3xl font-bold text-yellow-400">{currentStreak}</p>
            <p className="text-sm text-gray-400">Current Streak</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl text-center">
            <p className="text-3xl font-bold text-yellow-400">{bestStreak}</p>
            <p className="text-sm text-gray-400">Best Streak</p>
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-xl">
        <MonthlyCalendar completions={habit.completions} color={habit.color} onDayClick={handleDayClick} />
      </div>

    </div>
  );
};

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default HabitDetailScreen;