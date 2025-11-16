
import React, { useState } from 'react';
import { Habit, HabitType } from '../types';
import { EMOJIS, THEME_COLORS } from '../constants';

interface HabitFormProps {
  onSave: (habit: Habit) => void;
  onClose: () => void;
  habitToEdit?: Habit | null;
}

const HabitForm: React.FC<HabitFormProps> = ({ onSave, onClose, habitToEdit }) => {
  const [name, setName] = useState(habitToEdit?.name || '');
  const [emoji, setEmoji] = useState(habitToEdit?.emoji || EMOJIS[0]);
  const [color, setColor] = useState(habitToEdit?.color || THEME_COLORS[0]);
  const [type, setType] = useState<HabitType>(habitToEdit?.type || 'daily');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(habitToEdit?.daysOfWeek || []);
  const [reminders, setReminders] = useState<string[]>(habitToEdit?.reminders || []);
  const [newReminderTime, setNewReminderTime] = useState('09:00');

  const handleDayToggle = (dayIndex: number) => {
    setDaysOfWeek(prev => 
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
    );
  };
  
  const handleAddReminder = () => {
    if (newReminderTime && !reminders.includes(newReminderTime)) {
      setReminders(prev => [...prev, newReminderTime].sort());
    }
  };

  const handleRemoveReminder = (timeToRemove: string) => {
    setReminders(prev => prev.filter(time => time !== timeToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const habitData: Habit = {
      id: habitToEdit?.id || new Date().toISOString(),
      name: name.trim(),
      emoji,
      color,
      type,
      daysOfWeek: type === 'weekly' ? daysOfWeek : [],
      reminders,
      completions: habitToEdit?.completions || {},
      createdAt: habitToEdit?.createdAt || new Date().toISOString(),
    };
    onSave(habitData);
  };

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="fixed inset-0 bg-gray-900 p-4 flex flex-col animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{habitToEdit ? 'Edit Habit' : 'Create Habit'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow flex flex-col space-y-6 overflow-y-auto">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Habit Name</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="e.g., Read for 15 minutes"
                />
            </div>
            
            <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">Icon & Color</label>
                 <div className="flex items-center space-x-4">
                    <div className="relative w-1/2">
                        <label className="block text-xs font-medium text-gray-400 mb-1">Emoji</label>
                        <select value={emoji} onChange={(e) => setEmoji(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-3 pr-8 py-2 text-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400" style={{'paddingTop': '0.1rem', 'paddingBottom': '0.1rem'}}>
                            {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                    </div>
                    <div className="w-1/2">
                         <label className="block text-xs font-medium text-gray-400 mb-1">Color</label>
                         <div className="grid grid-cols-4 gap-2">
                            {THEME_COLORS.map(c => (
                                <button type="button" key={c} onClick={() => setColor(c)}
                                    className={`w-full h-8 rounded-md transition-transform ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 transform scale-110' : ''}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>
                 </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
                <div className="flex bg-gray-800 rounded-lg border border-gray-700 p-1">
                    <button type="button" onClick={() => setType('daily')} className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${type === 'daily' ? 'bg-yellow-400 text-gray-900' : 'text-gray-300'}`}>Daily</button>
                    <button type="button" onClick={() => setType('weekly')} className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${type === 'weekly' ? 'bg-yellow-400 text-gray-900' : 'text-gray-300'}`}>Weekly</button>
                </div>
            </div>

            {type === 'weekly' && (
                <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Select Days</label>
                    <div className="flex justify-between space-x-1">
                        {weekDays.map((day, index) => (
                            <button type="button" key={index} onClick={() => handleDayToggle(index)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${daysOfWeek.includes(index) ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-gray-300'}`}>
                                {day}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Reminders</label>
                <div className="flex items-center space-x-2 mb-2">
                    <input 
                        type="time" 
                        value={newReminderTime}
                        onChange={(e) => setNewReminderTime(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    <button 
                        type="button" 
                        onClick={handleAddReminder}
                        className="bg-gray-700 text-yellow-400 font-semibold px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Add
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {reminders.map(time => (
                        <div key={time} className="flex items-center bg-gray-700 rounded-full px-3 py-1 text-sm">
                            <span>{time}</span>
                            <button 
                                type="button"
                                onClick={() => handleRemoveReminder(time)} 
                                className="ml-2 text-gray-400 hover:text-white text-lg leading-none"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-grow"></div>
            
            <button type="submit" className="w-full bg-yellow-400 text-gray-900 font-bold py-3 rounded-lg hover:bg-yellow-500 transition-colors mt-4">
                {habitToEdit ? 'Save Changes' : 'Create Habit'}
            </button>
        </form>
    </div>
  );
};

export default HabitForm;