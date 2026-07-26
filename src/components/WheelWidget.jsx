import { useState } from 'react';
import { motion } from 'framer-motion';

export default function WheelWidget({ games }) {
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const sliceColors = ['#3730a3', '#312e81', '#4f46e5', '#1e1b4b', '#6366f1'];

  const getConicGradient = () => {
    if (!games || games.length === 0) return 'gray';
    const slicePercent = 100 / games.length;
    const gradientStops = games.map((_, i) => {
      const color = sliceColors[i % sliceColors.length];
      const start = i * slicePercent;
      const end = (i + 1) * slicePercent;
      return `${color} ${start}% ${end}%`;
    });
    return `conic-gradient(${gradientStops.join(', ')})`;
  };

  const spinWheel = () => {
    if (isSpinning || games.length === 0) return;
    setIsSpinning(true);
    setWinner(null);

    const sliceAngle = 360 / games.length;
    const winningIndex = Math.floor(Math.random() * games.length);
    
    const currentOffset = rotation % 360;
    const targetAngle = 360 - (winningIndex * sliceAngle + sliceAngle / 2);
    const finalRotation = rotation + (360 * 5) + targetAngle - currentOffset;

    setRotation(finalRotation);

    setTimeout(() => {
      setWinner(games[winningIndex]);
      setIsSpinning(false);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center p-8 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg border border-mystic-glow/20 relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

      <h2 className="text-2xl font-bold mb-8 text-tavern-dark dark:text-parchment tracking-wide">
        The Fate Wheel
      </h2>
      
      <div className="relative w-72 h-72 rounded-full shadow-[0_0_20px_rgba(217,119,6,0.2)]">
        
        {/* The Animated Wheel */}
        <motion.div 
          className="w-full h-full rounded-full border-4 border-tavern-dark dark:border-parchment relative overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.1, 0.8, 0.1, 1] }} 
          style={{ background: getConicGradient() }}
        >
          {/* Radial Text Labels */}
          {games.length > 0 && games.map((game, i) => {
            const sliceAngle = 360 / games.length;
            const rotationAngle = (i * sliceAngle) + (sliceAngle / 2);
            
            return (
              <div
                key={game.id}
                className="absolute top-0 left-1/2 w-0 h-1/2 origin-bottom flex justify-center text-white"
                style={{ transform: `translateX(-50%) rotate(${rotationAngle}deg)` }}
              >
                <span 
                  className="mt-4 text-[11px] font-bold tracking-wider uppercase opacity-90 drop-shadow-md truncate w-24 text-center"
                  style={{ writingMode: 'vertical-rl' }}
                >
                  {game.title}
                </span>
              </div>
            );
          })}
        </motion.div>
        
        {/* The Tavern Peg Pointer */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center drop-shadow-xl">
          <div className="w-4 h-4 rounded-full bg-red-700 border-2 border-white shadow-inner" />
          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[20px] border-t-red-700 -mt-1" />
        </div>
      </div>

      <button 
        onClick={spinWheel}
        disabled={isSpinning || games.length === 0}
        className="mt-10 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wide rounded-lg shadow-[0_4px_14px_0_rgba(217,119,6,0.39)] hover:shadow-[0_6px_20px_rgba(217,119,6,0.23)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer"
      >
        {isSpinning ? 'Consulting the Fates...' : 'Spin the Wheel'}
      </button>

      {/* Winner Announcement Banner */}
      <div className="h-16 mt-6 flex items-center justify-center w-full">
        {winner && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            className="text-center w-full bg-indigo-100 dark:bg-indigo-900/30 py-3 rounded-lg border border-indigo-300 dark:border-indigo-700"
          >
            <p className="text-xs text-indigo-800 dark:text-indigo-400 font-medium uppercase tracking-wider mb-1">Tonight we play</p>
            <p className="text-xl font-bold text-tavern-dark dark:text-parchment">{winner.title}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}