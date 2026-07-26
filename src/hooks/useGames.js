import { useState, useEffect } from 'react';
import mockGames from '../data/games.json';

export function useGames() {
  const [games, setGames] = useState([]);

  // initialize from LocalStorage or fallback to Mock JSON
  useEffect(() => {
    const storedGames = localStorage.getItem('tavern_games');
    if (storedGames) {
      setGames(JSON.parse(storedGames));
    } else {
      setGames(mockGames);
      localStorage.setItem('tavern_games', JSON.stringify(mockGames));
    }
  }, []);

  const addGame = (newGame) => {
    const newId = crypto.randomUUID(); // Modern browser built-in ID generator
    const updatedGames = [...games, { ...newGame, id: newId }];
    setGames(updatedGames);
    localStorage.setItem('tavern_games', JSON.stringify(updatedGames));
  };

  const removeGame = (id) => {
    const updatedGames = games.filter(game => game.id !== id);
    setGames(updatedGames);
    localStorage.setItem('tavern_games', JSON.stringify(updatedGames));
  };

  return { games, addGame, removeGame };
}