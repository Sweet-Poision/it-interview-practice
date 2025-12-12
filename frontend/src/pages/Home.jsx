import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TimeSelector from '../components/Time_selector';
import DifficultySelector from '../components/DifficultySelector';
import StartButton from '../components/StartButton';
import '../App.css';

const Home = () => {
    const [time, setTime] = useState(0);
    const [difficulties, setDifficulties] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const toggleDifficulty = (id) => {
        setDifficulties(prev =>
            prev.includes(id)
                ? prev.filter(d => d !== id)
                : [...prev, id]
        );
    };

    const handleStart = async () => {
        if (time <= 0 || difficulties.length === 0) return;

        setLoading(true);
        const payload = {
            time: time,
            tags: difficulties
        };

        try {
            // UX delay
            await new Promise(resolve => setTimeout(resolve, 1200));

            const response = await fetch('http://127.0.0.1:8000/api/v1/plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            navigate('/session', { state: { ...data, requestPayload: payload } });

        } catch (error) {
            console.error('Error starting plan:', error);
            alert("Failed to start plan. Please check backend.");
        } finally {
            setLoading(false);
        }
    };

    const canStart = time > 0 && difficulties.length > 0;

    return (
        <div className="app-container">
            <header className="hero-section animate-fade-up">
                <h1 className="title-large">Ready to Practice?</h1>
                <p className="subtitle">Customize your session to fit your schedule and skill level.</p>
            </header>

            <div className="controls-section">
                <TimeSelector selectedMinutes={time} onChange={setTime} />

                <DifficultySelector
                    selectedDifficulties={difficulties}
                    toggleDifficulty={toggleDifficulty}
                />

                <div className="action-bar">
                    <StartButton
                        onClick={handleStart}
                        disabled={!canStart}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;
