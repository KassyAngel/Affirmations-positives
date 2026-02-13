import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface FloatingJournalButtonProps {
  onClick: () => void;
}

export function FloatingJournalButton({ onClick }: FloatingJournalButtonProps) {
  const { theme } = useTheme();
  const [isPulsing, setIsPulsing] = useState(true);

  return (
    <button
      onClick={() => {
        setIsPulsing(false);
        onClick();
      }}
      className={`fixed bottom-24 right-6 z-40 p-4 rounded-full shadow-2xl transition-all active:scale-95 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white`}
      style={{
        animation: isPulsing ? 'gentle-pulse 3s ease-in-out infinite' : 'none'
      }}
    >
      <BookOpen className="w-6 h-6" />

      {/* Ring d'animation */}
      {isPulsing && (
        <>
          <div 
            className="absolute inset-0 rounded-full bg-purple-500/30"
            style={{
              animation: 'ping-slow 3s ease-in-out infinite'
            }}
          />
          <div 
            className="absolute inset-0 rounded-full bg-pink-500/30"
            style={{
              animation: 'ping-slow 3s ease-in-out infinite',
              animationDelay: '0.5s'
            }}
          />
        </>
      )}

      <style>{`
        @keyframes gentle-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 20px 25px -5px rgba(168, 85, 247, 0.4), 0 10px 10px -5px rgba(236, 72, 153, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 25px 30px -5px rgba(168, 85, 247, 0.5), 0 15px 15px -5px rgba(236, 72, 153, 0.4);
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.5);
            opacity: 0;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
}