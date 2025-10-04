
import React from 'react';

interface ScoreBarProps {
  score: number;
}

export const ScoreBar: React.FC<ScoreBarProps> = ({ score }) => {
  return (
    <div className="grid grid-cols-10 gap-1 items-end">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={`rounded-[3px] transition-colors ${
            i < score ? 'bg-gradient-to-t from-[color:var(--brand)] to-[#cfe0ff]' : 'bg-indigo-50'
          }`}
          style={{ height: `${6 + (i + 1) * 2}px` }}
        />
      ))}
    </div>
  );
};
