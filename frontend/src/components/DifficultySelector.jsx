import React, { useRef, useState } from 'react';
import { clsx } from 'clsx';
import { Brain, Zap, Swords } from 'lucide-react';
import './DifficultySelector.css';

const DifficultySelector = ({ selectedDifficulties, toggleDifficulty }) => {
  const difficulties = [
    { id: 'EASY', label: 'Easy', icon: Brain, color: 'var(--easy-color)' },
    { id: 'MEDIUM', label: 'Medium', icon: Zap, color: 'var(--medium-color)' },
    { id: 'HARD', label: 'Hard', icon: Swords, color: 'var(--hard-color)' },
  ];

  return (
    <div className="difficulty-wrapper animate-stagger-2">
      <div className="title-medium" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        Select Difficulty
      </div>

      <div className="difficulty-grid">
        {difficulties.map(({ id, label, icon: Icon, color }) => {
          const isSelected = selectedDifficulties.includes(id);

          return (
            <DifficultyCard
              key={id}
              id={id}
              label={label}
              Icon={Icon}
              color={color}
              isSelected={isSelected}
              onClick={() => toggleDifficulty(id)}
            />
          );
        })}
      </div>
    </div>
  );
};

const DifficultyCard = ({ id, label, Icon, color, isSelected, onClick }) => {
  const cardRef = useRef(null);
  const [hoverStyle, setHoverStyle] = useState({});

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHoverStyle({
      '--x': `${x}px`,
      '--y': `${y}px`,
    });
  };

  return (
    <button
      ref={cardRef}
      className={clsx('difficulty-card', isSelected && 'selected')}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      style={{
        '--diff-color': color,
        ...hoverStyle
      }}
    >
      <div className="diff-card-content">
        <div className="diff-icon-wrapper">
          <Icon size={32} />
        </div>
        <span className="diff-label">{label}</span>
      </div>

      {/* Liquid background effect */}
      <div className="diff-liquid-bg" />

      {isSelected && <div className="diff-glow" />}
    </button>
  );
};

export default DifficultySelector;
