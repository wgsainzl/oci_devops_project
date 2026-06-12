import {type JSX, useEffect, useState, useMemo, useRef, useCallback} from 'react';
import {useAPI} from '../useAPI';
import {useAuth} from '../hooks/AuthContext';
import type {TimelineTask} from '../types';
import styles from './TimelinePage.module.css';

const COLUMN_WIDTH = 120;
const PAGE_SIZE = 20;
const FROZEN_WIDTH = 750;
const BUFFER = 5;

// Pure Helper functions pulled out of component to prevent re-allocation
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MS_PER_WEEK = MS_PER_DAY * 7;

export default function TimelinePage(): JSX.Element {
    const {user} = useAuth();
    const currentTeamId = user?.currentTeamId;

    const [tasks, setTasks] = useState<TimelineTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [scrollX, setScrollX] = useState(0);

    const observer = useRef<IntersectionObserver | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Memoized Timeline Scope & Date Bounds
    const {startBound, weeks, todayOffset} = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const start = new Date(today);
        start.setDate(start.getDate() - 90);

        const weekArray = Array.from({length: 52}).map((_, i) => {
            const d = new Date(start);
            d.setDate(d.getDate() + i * 7);
            return d;
        });

        const diffMs = today.getTime() - start.getTime();
        const todayPos = (diffMs / MS_PER_WEEK) * COLUMN_WIDTH;

        return {startBound: start, weeks: weekArray, todayOffset: todayPos};
    }, []);

    // 2. Main API Data Fetching Core
    const fetchTasks = useCallback(async (teamId: string | undefined, pageNum: number) => {
        setLoading(true);
        try {
            // Note: Ensure useAPI is a service object, or rename if it is a React Hook.
            const res = await useAPI.timeline.getTasks(teamId, pageNum, PAGE_SIZE);
            const newTasks = res.data || [];

            setTasks(prev => (pageNum === 1 ? newTasks : [...prev, ...newTasks]));
            setHasMore(newTasks.length === PAGE_SIZE);
        } catch (err) {
            console.error("Failed to load tasks", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Synchronize Initial Loading and Team Adjustments safely
    useEffect(() => {
        setPage(1);
        fetchTasks(currentTeamId, 1);
    }, [currentTeamId, fetchTasks]);

    // Synchronize Pagination
    useEffect(() => {
        if (page > 1) {
            fetchTasks(currentTeamId, page);
        }
    }, [page, currentTeamId, fetchTasks]);

    // Automatically Center Timeline Viewport to Today's Date
    useEffect(() => {
        if (scrollRef.current && todayOffset > 0) {
            scrollRef.current.scrollLeft = todayOffset - 150; // Give some margin to the left
        }
    }, [todayOffset]);

    // 3. Performance Booster: Calculate Track Positions once per task array change
    const computedTasks = useMemo(() => {
        return tasks.map(t => {
            const getPos = (dateStr: string) => {
                const d = new Date(dateStr);
                const diffDays = (d.getTime() - startBound.getTime()) / MS_PER_DAY;
                return (diffDays / 7) * COLUMN_WIDTH;
            };

            const leftPos = getPos(t.startDate);
            const rightPos = getPos(t.dueDate);
            const computedWidth = Math.max(rightPos - leftPos, 40);

            return {
                ...t,
                leftPos,
                computedWidth,
                formattedDueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-GB') : "No Due Date"
            };
        });
    }, [tasks, startBound]);

    // 4. Infinite Scrolling Observer Intersection Handler
    const lastTaskRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollX(e.currentTarget.scrollLeft);
    };

    // 5. Visibility Evaluator for Floating Indicator
    const isTodayVisible = useMemo(() => {
        const visibleWindowWidth = scrollRef.current?.clientWidth
            ? scrollRef.current.clientWidth - FROZEN_WIDTH
            : 1000;

        const isPastFrozen = todayOffset > (scrollX + BUFFER);
        const isBeforeRightEdge = todayOffset < (scrollX + visibleWindowWidth - BUFFER);

        return isPastFrozen && isBeforeRightEdge;
    }, [todayOffset, scrollX]);

    return (
        <div className={styles.pageWrapper}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1>Timeline</h1>
                    <p>{currentTeamId || 'EasyMoneySnipers'}</p>
                </div>
            </header>

            <div className={styles.outerContainer}>
                {/* Keep the overflow hidden ONLY on the initial page load to hide the scrollbar */}
                <div
                    className={`${styles.scrollViewport} ${loading && tasks.length === 0 ? styles.viewportIsLoading : ''}`}
                    ref={scrollRef} onScroll={onScroll}>
                    <div
                        className={styles.timelineGrid}
                        /* Let it always be the full width so headers and rows match perfectly */
                        style={{width: `calc(${FROZEN_WIDTH}px + ${weeks.length * COLUMN_WIDTH}px)`}}
                    >

                        {/* HEADERS */}
                        <div className={styles.headerRow}>
                            <div className={`${styles.hCell} ${styles.stickyCol}`} style={{left: 0, width: 220}}>Task
                            </div>
                            <div className={`${styles.hCell} ${styles.stickyCol}`}
                                 style={{left: 220, width: 180}}>Responsible
                            </div>
                            <div className={`${styles.hCell} ${styles.stickyCol}`}
                                 style={{left: 400, width: 130}}>Status
                            </div>
                            <div className={`${styles.hCell} ${styles.stickyCol}`}
                                 style={{left: 530, width: 110}}>Priority
                            </div>
                            <div className={`${styles.hCell} ${styles.stickyCol}`} style={{left: 640, width: 110}}>Due
                                Date
                            </div>

                            <div className={styles.ganttHeaderPart}>
                                {isTodayVisible && (
                                    <div className={styles.todayLabel} style={{left: todayOffset}}>
                                        Today
                                    </div>
                                )}
                                {weeks.map(w => (
                                    <div key={w.toISOString()} className={styles.weekLabel}
                                         style={{width: COLUMN_WIDTH}}>
                                        {w.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* DATA ROWS */}
                        {computedTasks.map((t, idx) => (
                            <div
                                key={t.id}
                                className={`${styles.dataRow} ${t.status === 'DONE' ? styles.rowCompleted : ''}`}
                                ref={idx === computedTasks.length - 1 ? lastTaskRef : null}
                            >
                                <div className={`${styles.cell} ${styles.stickyCol}`} style={{left: 0, width: 220}}>
                                    <span className={styles.taskId}>{t.id}</span>
                                    <span className={styles.taskTitle} title={t.title}>{t.title}</span>
                                </div>
                                <div className={`${styles.cell} ${styles.stickyCol}`} style={{left: 220, width: 180}}>
                                    <div className={styles.responsible}>
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(t.responsible)}&background=random`}
                                            className={styles.avatar} alt=""/>
                                        <span>{t.responsible}</span>
                                    </div>
                                </div>
                                <div className={`${styles.cell} ${styles.stickyCol}`} style={{left: 400, width: 130}}>
                                    <span
                                        className={`${styles.badge} ${styles[t.status]}`}>{t.status.replace('_', ' ')}</span>
                                </div>
                                <div className={`${styles.cell} ${styles.stickyCol}`} style={{left: 530, width: 110}}>
                                    <span className={`${styles.badge} ${styles.critical}`}>{t.priority}</span>
                                </div>
                                <div className={`${styles.cell} ${styles.stickyCol}`} style={{left: 640, width: 110}}>
                                    {t.formattedDueDate}
                                </div>

                                <div className={styles.ganttTrack}>
                                    {weeks.map((_, i) => (
                                        <div key={i} className={styles.gridLine} style={{left: i * COLUMN_WIDTH}}/>
                                    ))}
                                    <div className={styles.todayLine} style={{left: todayOffset}}/>
                                    <div
                                        className={styles.cylinder}
                                        style={{
                                            left: t.leftPos,
                                            width: t.computedWidth,
                                            backgroundColor: t.status === 'DONE' ? '#62A678' : '#6293A6'
                                        }}
                                    >
                                        <span className={styles.barLabel}>{t.id}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* SKELETON ROWS */}
                        {loading && Array.from({length: 5}).map((_, i) => (
                            <div key={`skeleton-${i}`} className={styles.dataRow}>
                                <div className={`${styles.cell} ${styles.stickyCol}`} style={{left: 0, width: 220}}>
                                    <div className={styles.skeleton} style={{width: '80%', height: '14px'}}/>
                                </div>
                                <div className={`${styles.cell} ${styles.stickyCol}`} style={{left: 220, width: 180}}>
                                    <div className={styles.skeletonCircle}/>
                                    <div className={styles.skeleton}
                                         style={{width: '60%', height: '14px', marginLeft: '8px'}}/>
                                </div>
                                <div className={`${styles.cell} ${styles.stickyCol}`} style={{left: 400, width: 130}}>
                                    <div className={styles.skeletonBadge}/>
                                </div>
                                <div className={`${styles.cell} ${styles.stickyCol}`} style={{left: 530, width: 110}}>
                                    <div className={styles.skeletonBadge}/>
                                </div>
                                <div className={`${styles.cell} ${styles.stickyCol}`} style={{left: 640, width: 110}}>
                                    <div className={styles.skeleton} style={{width: '50%', height: '14px'}}/>
                                </div>

                                {/* Reverted back to using regular ganttTrack so background gridlines render on skeletons */}
                                <div className={styles.ganttTrack}>
                                    {weeks.map((_, weekIdx) => (
                                        <div key={weekIdx} className={styles.gridLine}
                                             style={{left: weekIdx * COLUMN_WIDTH}}/>
                                    ))}
                                    {/* Stagger skeleton bars based on column widths instead of raw pixels */}
                                    <div
                                        className={styles.skeletonBar}
                                        style={{left: `${(i + 2) * COLUMN_WIDTH}px`, width: `${COLUMN_WIDTH * 2}px`}}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}