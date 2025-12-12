import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Play, Loader2, Sparkles } from 'lucide-react';
import './StartButton.css';

const StartButton = ({ onClick, disabled, loading }) => {
    const [coords, setCoords] = useState({ x: -1, y: -1 });
    const [isRippling, setIsRippling] = useState(false);

    useEffect(() => {
        if (coords.x !== -1 && coords.y !== -1) {
            setIsRippling(true);
            const timer = setTimeout(() => setIsRippling(false), 500);
            return () => clearTimeout(timer);
        } else {
            setIsRippling(false);
        }
    }, [coords]);

    const handleClick = (e) => {
        if (disabled || loading) return;

        const rect = e.target.getBoundingClientRect();
        setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        onClick && onClick(e);
    };

    return (
        <div className="start-wrapper animate-stagger-3">
            <button
                className={clsx('start-btn', {
                    'disabled': disabled,
                    'loading': loading,
                    'active-pulse': !disabled && !loading
                })}
                onClick={handleClick}
                disabled={disabled || loading}
            >
                <span className="button-content">
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={24} />
                            <span>Initializing Space...</span>
                        </>
                    ) : (
                        <>
                            <div className="icon-container">
                                <Play fill="currentColor" size={24} className="play-icon" />
                                <Sparkles size={20} className="sparkle-icon" />
                            </div>
                            <span>Start Session</span>
                        </>
                    )}
                </span>

                {/* Shine effect */}
                <div className="button-glow" />

                {/* Ripple effect */}
                {isRippling && (
                    <span
                        className="ripple"
                        style={{ left: coords.x, top: coords.y }}
                    />
                )}
            </button>

            {disabled && !loading && (
                <p className="helper-text animate-fade-in">
                    Configure your session to proceed
                </p>
            )}
        </div>
    );
};

export default StartButton;
