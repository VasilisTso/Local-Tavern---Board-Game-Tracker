import { useState } from 'react';

export default function AddGameForm({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    minPlayers: 1,
    maxPlayers: 4,
    playtime: 60,
    tags: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    // Convert comma-separated string to an array of tags
    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    onAdd({
      ...formData,
      tags: tagsArray.length > 0 ? tagsArray : ['Custom']
    });

    // Reset and close
    setFormData({ title: '', minPlayers: 1, maxPlayers: 4, playtime: 60, tags: '' });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="mt-6 w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-mystic-glow/50 transition-colors cursor-pointer"
      >
        + Add a new game to the shelf
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-mystic-glow/30 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Game Title</label>
        <input 
          type="text" 
          required
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-mystic-glow outline-none"
          placeholder="e.g., Ticket to Ride"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Min Players</label>
          <input 
            type="number" min="1"
            value={formData.minPlayers}
            onChange={(e) => setFormData({...formData, minPlayers: parseInt(e.target.value)})}
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max Players</label>
          <input 
            type="number" min="1"
            value={formData.maxPlayers}
            onChange={(e) => setFormData({...formData, maxPlayers: parseInt(e.target.value)})}
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time (mins)</label>
          <input 
            type="number" step="15"
            value={formData.playtime}
            onChange={(e) => setFormData({...formData, playtime: parseInt(e.target.value)})}
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
        <input 
          type="text" 
          value={formData.tags}
          onChange={(e) => setFormData({...formData, tags: e.target.value})}
          className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          placeholder="e.g., Strategy, Trains, Family"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded font-medium transition-colors cursor-pointer">
          Save to Shelf
        </button>
        <button 
          type="button" 
          onClick={() => setIsOpen(false)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded font-medium transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}