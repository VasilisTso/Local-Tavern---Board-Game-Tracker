import { useState } from 'react';
import { useGames } from './hooks/useGames';
import { useTheme } from './hooks/useTheme';
import WheelWidget from './components/WheelWidget';
import AddGameForm from './components/AddGameForm';
import RsvpBoard from './components/RsvpBoard';
import { Sun, Moon, Users, Clock, Trash2 } from 'lucide-react';

export default function App() {
  const { games, addGame, removeGame } = useGames();
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === 'dark';
  
  const [playerFilter, setPlayerFilter] = useState('All');

  const filteredGames = games.filter(game => {
    if (playerFilter === 'All') return true;
    
    const targetPlayers = parseInt(playerFilter);
    if (targetPlayers === 6) {
      return game.maxPlayers >= 6;
    }
    
    return targetPlayers >= game.minPlayers && targetPlayers <= game.maxPlayers;
  });


  return (
    <div className="min-h-screen bg-parchment dark:bg-tavern-dark text-tavern-dark dark:text-parchment font-serif transition-colors duration-300">
      
      {/* Header Widget */}
      <header className="p-4 flex justify-between items-center border-b border-mystic-glow/20 bg-white/50 dark:bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide text-indigo-600">The Ultimate Tavern</h1>
        <button 
          onClick={toggleTheme}
          className="px-4 py-2 bg-tavern-dark dark:bg-parchment text-parchment dark:text-tavern-dark rounded-md text-sm font-bold shadow-sm transition-transform hover:scale-105 flex items-center gap-2"
        >
          {darkMode ? <><Sun size={16} /> Sunlit Porch</> : <><Moon size={16} /> Cozy Tavern</>}
        </button>
      </header>

      {/* Main Dashboard Grid */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: The Active Shelf */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-xl shadow-lg border border-mystic-glow/10">
            
            {/* UPDATED: Header now includes the Party Size dropdown */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-300 dark:border-gray-700 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">The Tavern Shelf</h2>
                <span className="text-sm bg-mystic-glow/20 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full">
                  {filteredGames.length} Games
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Party Size:</label>
                <select 
                  value={playerFilter} 
                  onChange={(e) => setPlayerFilter(e.target.value)}
                  className="p-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-mystic-glow outline-none cursor-pointer transition-colors"
                >
                  <option value="All">All Sizes</option>
                  <option value="1">1 Player (Solo)</option>
                  <option value="2">2 Players</option>
                  <option value="3">3 Players</option>
                  <option value="4">4 Players</option>
                  <option value="5">5 Players</option>
                  <option value="6">6+ Players</option>
                </select>
              </div>
            </div>
            
            {/* UPDATED: Map over filteredGames instead of games */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredGames.length === 0 ? (
                <p className="col-span-full text-center py-8 text-gray-500 italic">
                  No games match this party size. Time to buy a new one!
                </p>
              ) : (
                filteredGames.map(game => (
                  <div key={game.id} className="group flex justify-between items-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-mystic-glow/30">
                    <div>
                      <h3 className="font-medium text-lg">{game.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="flex items-center gap-1"><Users size={14} /> {game.minPlayers}-{game.maxPlayers}</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {game.playtime} min</span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {game.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to remove "${game.title}" from the shelf?`)) {
                          removeGame(game.id);
                        }
                      }} 
                      className="text-gray-400 hover:text-red-500 transition-colors p-2 cursor-pointer flex-shrink-0"
                      aria-label="Remove game"
                      title="Delete Game"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <AddGameForm onAdd={addGame} />
          </div>
        </section>

        {/* Right Column */}
        <section className="space-y-6">
          
          <WheelWidget games={filteredGames} />
          
          <RsvpBoard />
          
        </section>
      </main>
    </div>
  );
}