import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, Link, Navigate, useNavigate } from 'react-router-dom';
import { Clock, ExternalLink, Filter, ArrowUpDown, Play, Pause, RotateCcw, ChevronDown, ChevronUp, CheckCircle, XCircle, RefreshCw, X } from 'lucide-react';
import '../App.css';

const Session = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [sessionData, setSessionData] = useState(location.state);
    const [loading, setLoading] = useState(false);

    // --- Global Filtering & Sorting State (Multi-Select) ---
    const initialDifficulties = useMemo(() => {
        const diffs = new Set(sessionData?.payload_data?.map(q => q.difficulty.toUpperCase()) || []);
        return new Set(Array.from(diffs).filter(d => ['EASY', 'MEDIUM', 'HARD'].includes(d)));
    }, [sessionData]);

    const [selectedDifficulties, setSelectedDifficulties] = useState(new Set(initialDifficulties));
    const [selectedTags, setSelectedTags] = useState(new Set()); // Empty = ALL for tags? Keeping as is for now unless requested.
    const [sortOrder, setSortOrder] = useState('RECOMMENDED');

    const [expandedTags, setExpandedTags] = useState(new Set());

    // --- Tags Scroll Logic ---
    const tagsScrollRef = useRef(null);
    const [scrollMask, setScrollMask] = useState('start'); // start, middle, end, none



    // --- Global Timer State ---
    const initialTime = sessionData ? sessionData.payload_meta.time_utilised * 60 : 0;
    const [timerActive, setTimerActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [timerStarted, setTimerStarted] = useState(false);

    // --- Per-Question State Machine ---
    const [questionStates, setQuestionStates] = useState({});

    // --- Global Timer Logic ---
    useEffect(() => {
        let interval = null;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => Math.max(0, prev - 1));
            }, 1000);
        } else if (timeLeft === 0) {
            setTimerActive(false);
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    // --- Per-Question Timer Logic ---
    useEffect(() => {
        let interval = null;
        const hasRunningQuestions = Object.values(questionStates).some(s => s.status === 'RUNNING');

        if (hasRunningQuestions) {
            interval = setInterval(() => {
                setQuestionStates(prev => {
                    const next = { ...prev };
                    let changed = false;
                    Object.keys(next).forEach(key => {
                        if (next[key].status === 'RUNNING') {
                            next[key] = { ...next[key], timeSpent: next[key].timeSpent + 1 };
                            changed = true;
                        }
                    });
                    return changed ? next : prev;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [questionStates]);

    if (!sessionData) {
        return <Navigate to="/" replace />;
    }

    const { payload_data, payload_meta, requestPayload } = sessionData;

    // --- Handlers ---

    const handleRestart = async () => {
        if (!requestPayload) return;
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const response = await fetch('http://127.0.0.1:8000/api/v1/plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestPayload),
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const newData = await response.json();

            setSessionData({ ...newData, requestPayload });

            setTimerActive(false);
            setTimerStarted(false);
            setTimeLeft(newData.payload_meta.time_utilised * 60);
            setQuestionStates({});
            setExpandedTags(new Set());
            // Reset filters on restart? User asked for keeping UI bugs fixed, usually filters reset or persist. Let's persist.

        } catch (error) {
            console.error('Restart failed:', error);
            alert("Failed to restart session. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Sync filters when data changes (e.g. restart)
    useEffect(() => {
        if (payload_data) {
            const diffs = new Set(payload_data.map(q => q.difficulty.toUpperCase()));
            setSelectedDifficulties(new Set(Array.from(diffs).filter(d => ['EASY', 'MEDIUM', 'HARD'].includes(d))));
        }
    }, [payload_data]);

    const toggleGlobalTimer = () => {
        if (!timerStarted) setTimerStarted(true);
        setTimerActive(!timerActive);
    };

    const resetGlobalTimer = () => {
        setTimerActive(false);
        setTimerStarted(false);
        setTimeLeft(initialTime);
    };

    const handleQuestionAction = (idx, action) => {
        setQuestionStates(prev => {
            const current = prev[idx] || { status: 'IDLE', timeSpent: 0, doneCount: 0 };
            let next = { ...current };

            if (action === 'START_SOLVE') {
                if (current.status === 'IDLE' || current.status === 'PAUSED') {
                    next.status = 'RUNNING';
                }
            } else if (action === 'MARK_DONE') {
                const newDoneCount = current.doneCount + 1;
                next.doneCount = newDoneCount;
                if (newDoneCount >= 2) {
                    next.status = 'COMPLETED';
                } else {
                    next.status = 'PAUSED';
                }
            } else if (action === 'MARK_UNDONE') {
                if (current.doneCount < 2) {
                    next.status = 'RUNNING';
                }
            }

            return { ...prev, [idx]: next };
        });
    };

    // Filter Handlers
    const toggleDifficultyFilter = (diff) => {
        setSelectedDifficulties(prev => {
            const next = new Set(prev);
            if (next.has(diff)) {
                // Prevent deselecting the last one? Or allow empty?
                // User asked for "remove all filter", impling explicit selection.
                // If I allow empty, it shows 0 questions.
                next.delete(diff);
            } else {
                next.add(diff);
            }
            return next;
        });
    };

    const toggleTagFilter = (tag) => {
        if (tag === 'ALL') {
            setSelectedTags(new Set());
            return;
        }
        setSelectedTags(prev => {
            const next = new Set(prev);
            if (next.has(tag)) next.delete(tag);
            else next.add(tag);
            return next;
        });
    };

    const clearAllFilters = () => {
        setSelectedDifficulties(new Set());
        setSelectedTags(new Set());
    };

    // --- Helpers ---

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
        return `${pad(m)}:${pad(s)}`;
    };
    const pad = (n) => n < 10 ? '0' + n : n;

    const progress = initialTime > 0 ? (timeLeft / initialTime) * 100 : 0;
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const availableDifficulties = useMemo(() => {
        const diffs = new Set(payload_data.map(q => q.difficulty.toUpperCase()));
        const order = ['EASY', 'MEDIUM', 'HARD'];
        return order.filter(d => diffs.has(d));
    }, [payload_data]);

    const availableTags = useMemo(() => {
        const tags = new Set();
        payload_data.forEach(q => q.tag.forEach(t => tags.add(t)));
        return Array.from(tags).sort();
    }, [payload_data]);

    const checkScroll = () => {
        const el = tagsScrollRef.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;

        const isScrollable = scrollWidth > clientWidth;
        if (!isScrollable) {
            setScrollMask('none');
            return;
        }

        const isAtStart = scrollLeft <= 0;
        const isAtEnd = Math.abs(scrollWidth - clientWidth - scrollLeft) <= 1;

        if (isAtStart) setScrollMask('start');
        else if (isAtEnd) setScrollMask('end');
        else setScrollMask('middle');
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [availableTags]);

    const difficultySummary = useMemo(() => {
        const counts = payload_meta.difficulty_data.reduce((acc, curr) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts)
            .map(([diff, count]) => `${count} ${diff.charAt(0) + diff.slice(1).toLowerCase()}`)
            .join(' • ');
    }, [payload_meta.difficulty_data]);

    const totalQuestions = payload_data.length;
    // Count both COMPLETED and PAUSED (initially marked done) as solved for better feedback
    const completedCount = Object.values(questionStates).filter(s => s.status === 'COMPLETED' || s.status === 'PAUSED').length;
    const completionPercentage = totalQuestions > 0 ? (completedCount / totalQuestions) * 100 : 0;

    const filteredAndSortedQuestions = useMemo(() => {
        let result = [...payload_data];

        // Multi-select logic: If set is empty, show all. If not, show if contained in set.
        // Multi-select logic: Difficulty is explicit set.
        if (selectedDifficulties.size > 0) {
            result = result.filter(q => selectedDifficulties.has(q.difficulty.toUpperCase()));
        } else {
            // If explicit difficulty set is empty, show nothing? Or show all?
            // "Remove All filter" -> usually implies explicit selection.
            // If nothing selected, logic says show nothing.
            result = [];
        }
        if (selectedTags.size > 0) {
            result = result.filter(q => q.tag.some(t => selectedTags.has(t)));
        }

        const difficultyRank = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3 };
        if (sortOrder === 'ASC') {
            result.sort((a, b) => difficultyRank[a.difficulty.toUpperCase()] - difficultyRank[b.difficulty.toUpperCase()]);
        } else if (sortOrder === 'DESC') {
            result.sort((a, b) => difficultyRank[b.difficulty.toUpperCase()] - difficultyRank[a.difficulty.toUpperCase()]);
        }
        return result;
    }, [payload_data, selectedDifficulties, selectedTags, sortOrder]);

    const getDifficultyStyle = (diff) => {
        const d = diff?.toUpperCase();
        switch (d) {
            case 'EASY': return { backgroundColor: 'var(--success)', color: '#fff' };
            case 'MEDIUM': return { backgroundColor: 'var(--warning)', color: '#fff' };
            case 'HARD': return { backgroundColor: 'var(--error)', color: '#fff' };
            default: return { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' };
        }
    };

    const toggleTagExpansion = (idx) => {
        setExpandedTags(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    return (
        <div className="page-container animate-fade-up">

            {/* Header / Stats */}
            <div className="session-header glass-panel">
                <div className="header-info">
                    <h1 className="title-large">Your Practice Plan</h1>
                    <div className="meta-row">
                        <span className="meta-item">{difficultySummary}</span>
                        <span className="meta-item">•</span>
                        <span className="meta-item">{payload_data.length} Questions</span>
                        {loading && <span className="meta-item status-loading">Updating...</span>}
                    </div>

                    {/* Progress Bar - Simplified */}
                    <div className="session-progress-container">
                        <div className="progress-track" title={`${completedCount} / ${totalQuestions} Solved`}>
                            <div
                                className="progress-fill"
                                style={{ width: `${completionPercentage}%` }}
                            ></div>
                        </div>
                        <span className="progress-count-side">{completedCount} / {totalQuestions} Solved</span>
                    </div>
                </div>

                <div className="timer-wrapper">
                    {!timerStarted ? (
                        <button className="begin-btn" onClick={toggleGlobalTimer} disabled={loading}>
                            <Play size={18} fill="currentColor" />
                            <span>Begin Session</span>
                        </button>
                    ) : (
                        <div className="active-session-controls">
                            <div className={`timer-badge ${timeLeft < 60 ? 'urgent' : ''}`}>
                                <Clock size={16} />
                                <span className="timer-digits">{formatTime(timeLeft)}</span>
                            </div>
                            <button onClick={handleRestart} className="begin-btn restart-mode" aria-label="Restart Session" disabled={loading}>
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                                <span>Restart Session</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls Bar - Multi-Select Filters */}
            <div className="controls-bar glass-panel-sm">
                <div className="filter-section">

                    {/* Difficulty Chips */}
                    <div className="filter-row">
                        <Filter size={14} className="icon-subtle" />
                        {availableDifficulties.map(diff => (
                            <button
                                key={diff}
                                onClick={() => toggleDifficultyFilter(diff)}
                                className={`filter-chip ${selectedDifficulties.has(diff) ? 'active' : ''}`}
                            >
                                {diff.charAt(0) + diff.slice(1).toLowerCase()}
                            </button>
                        ))}
                        <div className="divider-vertical"></div>

                        {/* Sort & Restart */}
                        <div className="sort-mini-group">
                            <ArrowUpDown size={14} className="icon-subtle" />
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="minimal-select"
                            >
                                <option value="RECOMMENDED">Recommended</option>
                                <option value="ASC">Easiest First</option>
                                <option value="DESC">Hardest First</option>
                            </select>


                        </div>
                    </div>

                    {/* Tag Chips (Horizontal Scroll) */}
                    <div
                        className={`tags-scroll-row mask-${scrollMask}`}
                        ref={tagsScrollRef}
                        onScroll={checkScroll}
                    >
                        <span className="tags-label">Topics:</span>
                        <button
                            className={`tag-chip ${selectedTags.size === 0 ? 'active' : ''}`}
                            onClick={() => toggleTagFilter('ALL')}
                        >
                            All
                        </button>
                        {availableTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => toggleTagFilter(tag)}
                                className={`tag-chip ${selectedTags.has(tag) ? 'active' : ''}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div >

            {/* Questions List - Forced Full Width */}
            < div className="questions-grid" >
                {
                    filteredAndSortedQuestions.length > 0 ? (
                        filteredAndSortedQuestions.map((q, idx) => {
                            const isExpanded = expandedTags.has(idx);

                            const initialVisibleTags = q.tag.slice(0, 4);
                            const hiddenTags = q.tag.slice(4);
                            const hasHiddenTags = hiddenTags.length > 0;

                            const qState = questionStates[idx] || { status: 'IDLE', timeSpent: 0, doneCount: 0 };
                            const isRunning = qState.status === 'RUNNING';
                            const isPaused = qState.status === 'PAUSED';
                            const isCompleted = qState.status === 'COMPLETED';
                            const isLocked = !timerStarted;

                            return (
                                <div
                                    key={q.name || idx}
                                    className={`question-card glass-panel animate-fade-up ${isCompleted ? 'completed-card' : ''}`}
                                    style={{ animationDelay: `${idx * 0.05}s` }}
                                >
                                    <div className="card-header">
                                        <div className="meta-top">
                                            <div className="left-badges">
                                                <span className="difficulty-badge" style={getDifficultyStyle(q.difficulty)}>
                                                    {q.difficulty}
                                                </span>
                                                {(qState.timeSpent > 0 || isRunning) && (
                                                    <span className={`question-timer-badge ${isRunning ? 'active' : ''}`}>
                                                        <Clock size={12} /> {formatTime(qState.timeSpent)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="company-tags">
                                                {q.company.map((comp, i) => (
                                                    <span key={i} className="company-tag">{comp}</span>
                                                ))}
                                            </div>
                                        </div>



                                        <h3 className={`question-title ${isLocked ? 'obscured' : ''}`}>
                                            {isLocked ? 'Question Hidden' : q.name}
                                        </h3>
                                    </div>

                                    <div className="card-footer">
                                        <div className="tags-container">
                                            <div className="tags-list">
                                                {initialVisibleTags.map(t => (
                                                    <span key={t} className="topic-tag">#{t}</span>
                                                ))}
                                            </div>

                                            {hasHiddenTags && (
                                                <div className={`tags-collapsible ${isExpanded ? 'expanded' : ''}`}>
                                                    <div className="tags-list inner-list">
                                                        {hiddenTags.map(t => (
                                                            <span key={t} className="topic-tag">#{t}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {hasHiddenTags && (
                                                <button onClick={() => toggleTagExpansion(idx)} className="expand-tags-btn">
                                                    {isExpanded ? <>Show Less <ChevronUp size={12} /></> : <>+{hiddenTags.length} more <ChevronDown size={12} /></>}
                                                </button>
                                            )}
                                        </div>

                                        <div className="actions-right">
                                            {!isCompleted && !isPaused && (
                                                <a
                                                    href={isLocked ? '#' : q.link}
                                                    target={isLocked ? undefined : "_blank"}
                                                    rel={isLocked ? undefined : "noopener noreferrer"}
                                                    className={`solve-btn ${isLocked ? 'disabled' : ''} ${isRunning ? 'running' : ''}`}
                                                    onClick={(e) => {
                                                        if (isLocked) { e.preventDefault(); return; }
                                                        handleQuestionAction(idx, 'START_SOLVE');
                                                    }}
                                                >
                                                    {isRunning ? 'Solving...' : 'Solve'} <ExternalLink size={14} />
                                                </a>
                                            )}

                                            {!isLocked && (isRunning || isPaused || isCompleted) && (
                                                <div className="state-controls">
                                                    {!isCompleted && !isPaused && (
                                                        <button className="done-btn" onClick={() => handleQuestionAction(idx, 'MARK_DONE')}>
                                                            <CheckCircle size={16} /> Done
                                                        </button>
                                                    )}

                                                    {isPaused && (
                                                        <>
                                                            <button className="done-btn final" onClick={() => handleQuestionAction(idx, 'MARK_DONE')} title="Mark completely done">
                                                                <CheckCircle size={16} /> Finalize
                                                            </button>
                                                            <button className="undone-btn" onClick={() => handleQuestionAction(idx, 'MARK_UNDONE')} title="Resume Timer">
                                                                <RotateCcw size={14} /> Resume
                                                            </button>
                                                        </>
                                                    )}

                                                    {isCompleted && (
                                                        <span className="completed-badge">
                                                            <CheckCircle size={14} /> Completed
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="empty-state">
                            <p>{loading ? 'Loading new questions...' : 'No questions match this filter.'}</p>
                            {!loading && <button onClick={clearAllFilters} className="text-btn">Clear All Filters</button>}
                        </div>
                    )
                }
            </div >

            <div className="action-bar-centered">
                <Link to="/" className="secondary-btn">Start New Session</Link>
            </div>

            <style>{`
        .page-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          /* Ensure container doesn't shrink weirdly */
          width: 100%; 
        }

        .session-header {
          padding: 1.5rem 2rem;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 2rem;
        }

        .header-content h1 { margin-bottom: 0.25rem; line-height: 1.2; }
        .meta-row { display: flex; gap: 0.5rem; font-size: 0.9rem; color: var(--text-secondary); align-items: center; }
        .status-loading { color: var(--accent-color); font-weight: 600; animation: pulse 1s infinite; }

        /* Timer - Clean & Stable */
        .timer-wrapper { display: flex; align-items: center; justify-content: flex-end; width: 180px; /* Fixed width to prevent layout shift */ }
        
        .begin-btn {
            background: var(--accent-color); color: white !important; border: none; padding: 0.75rem 1.5rem;
            border-radius: 99px; font-size: 1rem; font-weight: 600; display: flex; align-items: center; gap: 0.6rem;
            cursor: pointer; transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3);
            white-space: nowrap; width: 100%; justify-content: center;
        }
        .begin-btn:hover { transform: scale(1.05); background: var(--accent-hover); }
        .begin-btn:disabled { opacity: 0.7; cursor: wait; }

        .active-session-controls {
            display: flex; align-items: center; justify-content: flex-end; gap: 1rem;
            min-width: 140px; animation: fadeIn 0.3s ease;
        }

        .timer-badge {
            display: flex; align-items: center; gap: 0.5rem;
            background: var(--bg-tertiary);
            padding: 0.5rem 1rem;
            border-radius: 99px;
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            font-variant-numeric: tabular-nums;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .timer-digits {
            font-family: var(--font-mono, monospace);
            font-size: 1.1rem;
            font-weight: 600;
            letter-spacing: -0.5px;
            line-height: 1;
        }

        .timer-badge.urgent { 
            border-color: var(--error); 
            color: var(--error);
            background: rgba(var(--error-rgb), 0.1);
            animation: pulse 1s infinite; 
        }
        
        .begin-btn.restart-mode {
            background: var(--bg-tertiary); color: var(--text-primary) !important; 
            border: 1px solid var(--border-color);
        }
        .begin-btn.restart-mode:hover {
            background: var(--bg-secondary); border-color: var(--text-secondary);
        }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: translateY(0); } }

        .session-progress-container { margin-top: 1rem; width: 100%; max-width: 320px; display: flex; align-items: center; gap: 12px; }
        .progress-track { flex: 1; height: 8px; background: var(--bg-tertiary); border-radius: 99px; overflow: hidden; position: relative; }
        .progress-fill { height: 100%; background: var(--success); border-radius: 99px; transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .progress-count-side { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; white-space: nowrap; }



        /* Controls Bar - Refactored for Multi Select */
        .controls-bar {
            padding: 1rem 1.5rem; border-radius: 16px; 
            background: rgba(var(--bg-secondary-rgb), 0.4); backdrop-filter: blur(10px); border: 1px solid var(--border-color);
        }
        .filter-section { display: flex; flex-direction: column; gap: 1rem; }
        .filter-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
        .tags-scroll-row { 
            display: flex; align-items: center; gap: 0.5rem; overflow-x: auto; 
            padding-bottom: 4px; scrollbar-width: none;
            transition: mask-image 0.3s;
        }
        .tags-scroll-row.mask-start { mask-image: linear-gradient(to right, black 95%, transparent 100%); }
        .tags-scroll-row.mask-middle { mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%); }
        .tags-scroll-row.mask-end { mask-image: linear-gradient(to right, transparent 0%, black 5%, black 100%); }
        .tags-scroll-row.mask-none { mask-image: none; }
        
        .tags-scroll-row::-webkit-scrollbar { display: none; }
        .tags-label { font-size: 0.85rem; color: var(--text-tertiary); font-weight: 500; margin-right: 0.5rem; white-space: nowrap; }

        .divider-vertical { width: 1px; height: 24px; background: var(--border-color); margin: 0 0.5rem; }
        
        .sort-mini-group { display: flex; align-items: center; gap: 0.5rem; margin-left: auto; }
        .icon-subtle { color: var(--text-tertiary); }
        .icon-btn { background: transparent; border: none; color: var(--text-secondary); padding: 8px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; transition: all 0.2s; }
        .icon-btn:hover { background: rgba(255,255,255,0.1); color: var(--text-primary); }

        .filter-chip {
            background: transparent; border: 1px solid transparent; color: var(--text-secondary); font-size: 0.85rem; padding: 4px 12px;
            border-radius: 6px; cursor: pointer; transition: all 0.2s ease; font-weight: 500;
        }
        .filter-chip:hover { color: var(--text-primary); background: rgba(var(--bg-tertiary-rgb), 0.5); }
        .filter-chip.active { 
            color: white; background: var(--accent-color); 
            border-color: rgba(255,255,255,0.1); 
            box-shadow: 0 2px 8px rgba(var(--accent-rgb), 0.3);
        }
        
        .tag-chip {
             background: var(--bg-tertiary); border: none; color: var(--text-secondary); font-size: 0.8rem; padding: 4px 10px;
             border-radius: 20px; cursor: pointer; white-space: nowrap; transition: all 0.2s;
        }
        .tag-chip:hover { background: var(--text-secondary); color: var(--bg-primary); }
        .tag-chip.active { background: var(--text-primary); color: var(--bg-primary); font-weight: 600; }

        .minimal-select {
            background: transparent; border: none; color: var(--text-secondary); font-size: 0.9rem; cursor: pointer;
            outline: none; font-weight: 500; padding: 6px 24px 6px 8px; border-radius: 6px; appearance: none; transition: color 0.2s;
        }
        .minimal-select:hover { color: var(--text-primary); background: rgba(255,255,255,0.05); }

        /* Questions Grid - Layout Fixed */
        .questions-grid { 
            display: grid; 
            gap: 1rem; 
            width: 100%; /* Fix width shrinking */
        }
        /* Single column by default, cards take full width */
        .question-card { 
            padding: 1.5rem; transition: transform 0.2s ease, border-color 0.2s ease; 
            display: flex; flex-direction: column; gap: 1rem;
            width: 100%; /* Force full width */
            box-sizing: border-box; /* Include padding in width */
        }
        .question-card:hover { transform: translateY(-2px); border-color: var(--accent-color); }
        .question-card.completed-card { opacity: 0.7; border-color: var(--success); background: rgba(var(--success-rgb), 0.05); }

        .meta-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; font-size: 0.8rem; }
        .left-badges { display: flex; gap: 0.5rem; align-items: center; }
        .difficulty-badge { padding: 2px 8px; border-radius: 6px; font-weight: 700; letter-spacing: 0.5px; font-size: 0.75rem; }
        
        .company-tags { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; max-width: 50%; }
        .company-tag { color: var(--text-secondary); background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 500; }
        
        .card-header { position: relative; }
        .question-title { font-size: 1.25rem; font-weight: 600; margin: 0; line-height: 1.3; color: var(--text-primary); padding-right: 80px; }
        
        .question-timer-badge {
            display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 4px;
            font-size: 0.75rem; color: var(--text-secondary); background: var(--bg-secondary); border: 1px solid var(--border-color);
            font-variant-numeric: tabular-nums; height: 24px;
            box-shadow: var(--shadow-sm); 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .question-timer-badge.active { color: var(--accent-color); border-color: var(--accent-color); background: rgba(var(--accent-rgb), 0.05); transform: scale(1.05); }

        .card-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; gap: 1rem; }
        .tags-container { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
        
        .tags-list { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .tags-collapsible { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .tags-collapsible.expanded { grid-template-rows: 1fr; margin-top: 0.5rem; }
        .tags-collapsible .inner-list { overflow: hidden; display: flex; flex-wrap: wrap; gap: 0.5rem; }

        .topic-tag { 
            font-size: 0.8rem; 
            color: var(--accent-color); 
            background: rgba(var(--accent-rgb), 0.15); 
            border: 1px solid rgba(var(--accent-rgb), 0.2);
            padding: 2px 8px; 
            border-radius: 4px; 
            white-space: nowrap; 
        }
        
        .expand-tags-btn { background: none; border: none; color: var(--text-tertiary); font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 0; align-self: flex-start; margin-top: 0.25rem; }
        .expand-tags-btn:hover { color: var(--text-primary); text-decoration: underline; }

        .actions-right { display: flex; gap: 0.5rem; align-items: center; }
        
        .solve-btn {
            display: flex; align-items: center; gap: 6px; background: var(--text-primary); color: var(--bg-primary);
            padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9rem;
            transition: all 0.2s ease; white-space: nowrap;
        }
        .solve-btn:hover { opacity: 0.9; transform: scale(1.02); box-shadow: 0 4px 12px rgba(0,0,0, 0.1); }
        .solve-btn.running { background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); }
        
        .state-controls { display: flex; gap: 0.5rem; }
        .done-btn { background: var(--success); color: white; border: none; padding: 8px 12px; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 4px; }
        .done-btn:hover { background: #2faf4d; }
        .done-btn.final { background: var(--accent-color); }
        
        .undone-btn { background: var(--warning); color: white; border: none; padding: 8px 12px; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 4px; }
        .undone-btn:hover { filter: brightness(1.1); }
        
        .completed-badge { color: var(--success); font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 4px; }

        .empty-state { text-align: center; padding: 3rem; color: var(--text-secondary); }
        .text-btn { background: none; border: none; color: var(--accent-color); cursor: pointer; margin-top: 0.5rem; text-decoration: underline; }
        .secondary-btn { color: var(--text-secondary); text-decoration: none; font-size: 0.95rem; transition: color 0.2s; }
        .secondary-btn:hover { color: var(--text-primary); }
        
        .obscured { filter: blur(6px); user-select: none; cursor: default; }
        .solve-btn.disabled { pointer-events: none; opacity: 0.5; background: var(--bg-tertiary); color: var(--text-tertiary); box-shadow: none; cursor: not-allowed; }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        @media (max-width: 600px) {
            .session-header { 
                grid-template-columns: 1fr;
                gap: 1.5rem; 
                padding: 1.5rem; 
                justify-items: start;
            }
            .header-info { width: 100%; }
            .timer-wrapper { width: 100%; justify-content: flex-start; }
            .begin-btn { width: 100%; justify-content: center; }
            .active-timer { width: 100%; justify-content: space-between; }
            
            .card-footer { flex-direction: column; align-items: flex-start; gap: 1rem; }
            .solve-btn { width: 100%; justify-content: center; }
            
            .controls-bar { flex-direction: column; align-items: flex-start; gap: 1rem; }
            .filter-row { width: 100%; }
            .sort-mini-group { width: 100%; justify-content: space-between; margin-left: 0; }
            .tags-scroll-row { width: 100%; }
        }
      `}</style>
        </div >
    );
};

export default Session;
