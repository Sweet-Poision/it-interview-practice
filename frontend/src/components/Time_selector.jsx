import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Time_selector.css';

const TimeSelector = ({ selectedMinutes, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const circleRef = useRef(null);
  const containerRef = useRef(null);

  // Constants
  const RADIUS = 120;
  const CENTER = 150;
  const MAX_MINUTES = 360;

  // Helpers
  const getAngleFn = (clientX, clientY) => {
    if (!circleRef.current) return 0;
    const rect = circleRef.current.getBoundingClientRect();
    const x = clientX - (rect.left + rect.width / 2);
    const y = clientY - (rect.top + rect.height / 2);
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    angle += 90; // Rotate so 0 is at top
    if (angle < 0) angle += 360;
    return angle;
  };

  const minutesToAngle = (mins) => (mins / MAX_MINUTES) * 360;

  const handleInteraction = useCallback((clientX, clientY) => {
    const angle = getAngleFn(clientX, clientY);
    // Smooth snap to 5 minute increments
    let minutes = Math.round((angle / 360) * MAX_MINUTES / 5) * 5;

    if (minutes === 0 && angle > 300) minutes = 360;
    if (minutes === 360 && angle < 60) minutes = 0;

    onChange(Math.max(0, Math.min(minutes, MAX_MINUTES)));
  }, [onChange]);

  // Mouse/Touch Handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.preset-chip')) return; // Don't drag if clicking preset
    e.preventDefault(); // Prevent text selection
    setIsDragging(true);
    containerRef.current?.focus(); // Focus container on click
    handleInteraction(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    handleInteraction(e.clientX, e.clientY);
  }, [isDragging, handleInteraction]);

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e) => {
    if (e.target.closest('.preset-chip')) return;
    setIsDragging(true);
    containerRef.current?.focus();
    handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
  }, [isDragging, handleInteraction]);

  // Keyboard Handler
  const handleKeyDown = (e) => {
    let newMinutes = selectedMinutes;
    const STEP_SMALL = 5;
    const STEP_LARGE = 15;

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        newMinutes = Math.min(selectedMinutes + STEP_SMALL, MAX_MINUTES);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        newMinutes = Math.max(selectedMinutes - STEP_SMALL, 0);
        break;
      case 'PageUp':
        newMinutes = Math.min(selectedMinutes + STEP_LARGE, MAX_MINUTES);
        break;
      case 'PageDown':
        newMinutes = Math.max(selectedMinutes - STEP_LARGE, 0);
        break;
      case 'Home':
        newMinutes = 0;
        break;
      case 'End':
        newMinutes = MAX_MINUTES;
        break;
      default:
        return; // Let other keys pass
    }

    e.preventDefault();
    onChange(newMinutes);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleTouchMove]);

  // SVG Calculations
  const angle = minutesToAngle(selectedMinutes);
  const largeArcFlag = angle > 180 ? 1 : 0;
  const endX = CENTER + RADIUS * Math.sin((angle * Math.PI) / 180);
  const endY = CENTER - RADIUS * Math.cos((angle * Math.PI) / 180);

  const pathData = selectedMinutes === MAX_MINUTES
    ? `M ${CENTER} ${CENTER - RADIUS} A ${RADIUS} ${RADIUS} 0 1 1 ${CENTER - 0.01} ${CENTER - RADIUS}`
    : `M ${CENTER} ${CENTER} L ${CENTER} ${CENTER - RADIUS} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

  const presets = [30, 60, 90, 120];

  return (
    <div className="time-selector-wrapper animate-stagger-1">
      <div
        className="title-medium"
        style={{ textAlign: 'center', marginBottom: '2rem', transition: 'color 0.3s' }}
        id="time-selector-label"
      >
        How much time do you have?
      </div>

      <div
        ref={containerRef}
        className={`clock-container ${isDragging ? 'dragging' : ''}`}
        role="slider"
        aria-labelledby="time-selector-label"
        aria-valuemin={0}
        aria-valuemax={MAX_MINUTES}
        aria-valuenow={selectedMinutes}
        aria-valuetext={`${selectedMinutes} minutes`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown} // Bind earlier to capture correct target
        onTouchStart={handleTouchStart}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="clock-blur-bg" />
        <svg
          width="320"
          height="320"
          viewBox="0 0 300 300"
          className="clock-svg"
          ref={circleRef} /* Ref is back on SVG for calculation relative to it */
        >
          {/* Background Circle with Glass Effect */}
          <circle cx={CENTER} cy={CENTER} r={RADIUS} className="clock-bg" />

          <defs>
            <linearGradient id="timeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-color)" />
              <stop offset="100%" stopColor="var(--accent-hover)" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {selectedMinutes > 0 && (
            <path
              d={pathData}
              className="clock-progress"
              fill="url(#timeGradient)"
            />
          )}

          {/* Ticks */}
          {[...Array(12)].map((_, i) => {
            const tickAngle = i * 30;
            const isMajor = i % 3 === 0;
            return (
              <line
                key={i}
                x1={CENTER + (RADIUS - (isMajor ? 20 : 12)) * Math.sin((tickAngle * Math.PI) / 180)}
                y1={CENTER - (RADIUS - (isMajor ? 20 : 12)) * Math.cos((tickAngle * Math.PI) / 180)}
                x2={CENTER + (RADIUS - 5) * Math.sin((tickAngle * Math.PI) / 180)}
                y2={CENTER - (RADIUS - 5) * Math.cos((tickAngle * Math.PI) / 180)}
                className={`clock-tick ${isMajor ? 'major' : ''}`}
              />
            );
          })}

          {/* Interaction Handle */}
          <g filter="url(#glow)">
            <circle
              cx={endX}
              cy={endY}
              r={isDragging ? 18 : 14}
              className={`clock-handle ${isDragging ? 'dragging' : ''}`}
            />
            <circle cx={endX} cy={endY} r="4" fill="white" />
          </g>
        </svg>

        {/* Center Display */}
        <div className="time-display">
          <span className="time-value">
            {Math.floor(selectedMinutes / 60)}
            <span className="time-unit">h</span>
            {selectedMinutes % 60}
            <span className="time-unit">m</span>
          </span>
          {/* Hint for keyboard users */}
          <span className="sr-only">Use arrow keys to adjust time</span>
        </div>
      </div>

      <div className="presets">
        {presets.map(min => (
          <button
            key={min}
            className={`preset-chip ${selectedMinutes === min ? 'active' : ''}`}
            onClick={() => onChange(min)}
            aria-label={`Set time to ${min} minutes`}
          >
            {min}m
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSelector;
