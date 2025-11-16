import React, { useRef } from 'react';
import { Habit } from '../types';

interface SettingsScreenProps {
  habits: Habit[];
  onImport: (habits: Habit[]) => void;
  onReset: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ habits, onImport, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(habits, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'habitflow_backup.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const importedHabits = JSON.parse(text) as Habit[];
          // Basic validation
          if (Array.isArray(importedHabits) && importedHabits.every(h => h.id && h.name)) {
            onImport(importedHabits);
            alert('Habits imported successfully!');
          } else {
            throw new Error('Invalid file format');
          }
        }
      } catch (error) {
        alert('Failed to import habits. Please check the file format.');
        console.error(error);
      }
    };
    reader.readAsText(file);
    // Reset file input value to allow re-uploading the same file
    event.target.value = '';
  };
  
  const handleReset = () => {
    if (window.confirm('Are you sure you want to delete all your habits? This action cannot be undone.')) {
        onReset();
        alert('All habits have been reset.');
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-3xl font-bold text-white">Settings</h1>

      <div className="bg-white rounded-xl p-4 space-y-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Data Management</h2>
        
        <button onClick={handleExport} className="w-full text-left flex items-center space-x-3 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <ExportIcon/>
            <span className="text-gray-800">Export Data</span>
        </button>

        <button onClick={handleImportClick} className="w-full text-left flex items-center space-x-3 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <ImportIcon/>
            <span className="text-gray-800">Import Data</span>
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />

      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-red-500">Danger Zone</h2>
         <button onClick={handleReset} className="mt-4 w-full text-left flex items-center space-x-3 p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
            <TrashIcon/>
            <span>Reset All Habits</span>
        </button>
      </div>

    </div>
  );
};

const ExportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const ImportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;


export default SettingsScreen;