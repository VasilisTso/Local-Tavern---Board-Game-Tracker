import { useState } from 'react';
import { CheckCircle, HelpCircle, XCircle, Trash2, Calendar, Edit2, Plus } from 'lucide-react';

export default function RsvpBoard({ nightApi }) {
  // Interim wiring to the v2 data layer; this component is replaced in Phase 6.
  const { night, setDate, setHouseRule, addGuest: addNightGuest, updateGuest, removeGuest } = nightApi;
  const { date: sessionDate, houseRule, guests } = night;
  const [isEditingRule, setIsEditingRule] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');

  const addGuest = (e) => {
    e.preventDefault();
    if (addNightGuest(newGuestName)) setNewGuestName('');
  };

  const NEXT_STATUS = { going: 'maybe', maybe: 'not-going', 'not-going': 'going' };
  const toggleStatus = (id) => {
    const guest = guests.find((g) => g.id === id);
    if (guest) updateGuest(id, { status: NEXT_STATUS[guest.status] });
  };

  const getStatusIcon = (status) => {
    if (status === 'going') return <CheckCircle size={16} className="text-green-500 dark:text-green-400" />;
    if (status === 'maybe') return <HelpCircle size={16} className="text-indigo-500 dark:text-indigo-400" />;
    return <XCircle size={16} className="text-red-500 dark:text-red-400" />;
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-xl shadow-lg border border-mystic-glow/10 flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b border-gray-300 dark:border-gray-700 pb-2">
        <h2 className="text-xl font-semibold">RSVP Board</h2>
      </div>

      <div className="space-y-5">
        
        {/* Calendar / Session Date */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Calendar size={18} />
            <p className="font-medium text-sm">Next Session:</p>
          </div>
          <input 
            type="datetime-local" 
            value={sessionDate}
            onChange={(e) => setDate(e.target.value)}
            className="text-sm bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-mystic-glow transition-colors cursor-pointer"
          />
        </div>

        {/* Guest List */}
        <div>
          <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-200">
            {guests.length === 0 ? (
              <li className="text-gray-400 italic text-xs">No guests invited yet...</li>
            ) : (
              guests.map(guest => (
                <li key={guest.id} className="flex items-center justify-between group py-1">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleStatus(guest.id)}
                      className="cursor-pointer hover:scale-110 transition-transform"
                      title="Toggle RSVP status"
                    >
                      {getStatusIcon(guest.status)}
                    </button>
                    <span className={`font-medium ${guest.status === 'not-going' ? 'line-through opacity-50' : ''}`}>
                      {guest.name}
                    </span>
                    {guest.note && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                        ({guest.note})
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => removeGuest(guest.id)}
                    className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1"
                    title="Remove guest"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))
            )}
          </ul>

          <form onSubmit={addGuest} className="mt-3 flex gap-2">
            <input 
              type="text" 
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              placeholder="Add guest name..."
              className="flex-1 text-xs p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-1 focus:ring-mystic-glow outline-none"
            />
            <button 
              type="submit"
              className="bg-gray-200 dark:bg-gray-600 hover:bg-mystic-glow hover:text-white dark:hover:bg-indigo-600 px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </form>
        </div>

        {/* Editable House Rule Section */}
        <div className="p-4 bg-red-900/10 dark:bg-red-900/20 rounded-md border border-red-500/20 group">
          <div className="flex justify-between items-start mb-1">
            <p className="text-xs text-red-600 dark:text-red-400 font-bold">House Rule Active:</p>
            {!isEditingRule && (
              <button 
                onClick={() => setIsEditingRule(true)}
                className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Edit2 size={12} />
              </button>
            )}
          </div>
          
          {isEditingRule ? (
            <textarea 
              autoFocus
              value={houseRule}
              onChange={(e) => setHouseRule(e.target.value)}
              onBlur={() => setIsEditingRule(false)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setIsEditingRule(false); } }}
              rows="2"
              className="w-full text-xs bg-white dark:bg-gray-800 border border-red-300 dark:border-red-800 rounded p-1.5 focus:ring-1 focus:ring-red-400 resize-none outline-none text-gray-700 dark:text-gray-300"
              placeholder="Enter a custom rule..."
            />
          ) : (
            <p 
              onClick={() => setIsEditingRule(true)}
              className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              {houseRule || <span className="italic text-gray-500">Click to add a rule...</span>}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}