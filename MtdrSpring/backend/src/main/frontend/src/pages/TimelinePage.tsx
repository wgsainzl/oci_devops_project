import {type JSX, useEffect, useState, useMemo, useRef, useCallback} from 'react'
import {useAPI} from '../useAPI'
import {useAuth} from '../hooks/AuthContext'
import type {TimelineTask} from '../types'
import styles from './TimelinePage.module.css'

const COLUMN_WIDTH = 120;
const PAGE_SIZE = 20;

export default function TimelinePage(): JSX.Element {
    const {user} = useAuth()
    const [tasks, setTasks] = useState<TimelineTask[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [scrollX, setScrollX] = useState(0);

    const observer = useRef<IntersectionObserver | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchTasks = useCallback(async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await useAPI.timeline.getTasks(user?.currentTeamId, pageNum, PAGE_SIZE);
            const newTasks = res.data;
            setTasks(prev => (pageNum === 1 ? newTasks : [...prev, ...newTasks]));
            setHasMore(newTasks.length === PAGE_SIZE);
        } catch (err) {
            console.error("Failed to load tasks", err);
        } finally {
            setLoading(false);
        }
    }, [user?.currentTeamId]);


    const lastTaskRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) setPage(prev => prev + 1);
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);


// Handle scroll events to update visibility
    const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollX(e.currentTarget.scrollLeft);
    };


    const {startBound, weeks, todayOffset} = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Look back 90 days (~13 weeks) instead of 28
        const start = new Date(today);
        start.setDate(start.getDate() - 90);

        // Generate 52 weeks (approx 1 year) to give plenty of scroll room
        const weekArray = Array.from({length: 52}).map((_, i) => {
            const d = new Date(start);
            d.setDate(d.getDate() + i * 7);
            return d;
        });

        // Calculate Today's pixel position relative to the startBound
        const diffMs = today.getTime() - start.getTime();
        const todayPos = (diffMs / (1000 * 60 * 60 * 24 * 7)) * COLUMN_WIDTH;

        return {startBound: start, weeks: weekArray, todayOffset: todayPos};
    }, []);

    const getPos = (dateStr: string) => {
        const d = new Date(dateStr);
        const diffDays = (d.getTime() - startBound.getTime()) / (1000 * 60 * 60 * 24);
        return (diffDays / 7) * COLUMN_WIDTH;
    };
    const isTodayVisible = useMemo(() => {
        const frozenWidth = 750;
        // We add a small buffer (5-10px) so it doesn't flicker right at the edge
        const buffer = 5;

        // The viewport's width minus the frozen section is the visible "window" for the Gantt track
        const visibleWindowWidth = scrollRef.current?.clientWidth
            ? scrollRef.current.clientWidth - frozenWidth
            : 1000; // Fallback during initial render

        // The line is visible if:
        // It is further right than the current scroll amount (accounting for frozen cols)
        // AND it hasn't scrolled past the right edge of the screen
        const isPastFrozen = todayOffset > (scrollX + buffer);
        const isBeforeRightEdge = todayOffset < (scrollX + visibleWindowWidth - buffer);

        return isPastFrozen && isBeforeRightEdge;
    }, [todayOffset, scrollX]);

    useEffect(() => {
        fetchTasks(1);
    }, [fetchTasks]);


    useEffect(() => {
        if (page > 1) fetchTasks(page);
    }, [page, fetchTasks]);

    useEffect(() => {
        if (scrollRef.current && todayOffset > 0) {
            // We scroll the viewport.
            // We subtract a bit of padding so "Today" is centered or slightly to the left
            scrollRef.current.scrollLeft = todayOffset;
        }
    }, [todayOffset]);

    return (
        <div className={styles.pageWrapper}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1>Timeline</h1>
                    <p>{user?.currentTeamId || 'EasyMoneySnipers'}</p>
                </div>
            </header>

            <div className={styles.outerContainer}>
                <div className={styles.scrollViewport} ref={scrollRef} onScroll={onScroll}>
                    <div className={styles.timelineGrid}
                         style={{width: `calc(750px + ${weeks.length * COLUMN_WIDTH}px)`}}>

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
                                {/* "Today" floating label */}
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

                        {tasks.map((t, idx) => (
                            <div key={t.id} className={styles.dataRow}
                                 ref={idx === tasks.length - 1 ? lastTaskRef : null}>
                                <div className={`${styles.cell} ${styles.stickyCol}`} style={{left: 0, width: 220}}>
                                    <span className={styles.taskId}>{t.id}</span>
                                    <span className={styles.taskTitle} title={t.title}>{t.title}</span>
                                </div>
                                <div className={`${styles.cell} ${styles.stickyCol}`} style={{left: 220, width: 180}}>
                                    <div className={styles.responsible}>
                                        <img src={`https://ui-avatars.com/api/?name=${t.responsible}&background=random`}
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
                                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-GB') : "No Due Date"}
                                </div>

                                <div className={styles.ganttTrack}>
                                    {weeks.map((_, i) => <div key={i} className={styles.gridLine}
                                                              style={{left: i * COLUMN_WIDTH}}/>)}
                                    <div className={styles.todayLine} style={{left: todayOffset}}/>
                                    <div className={styles.cylinder} style={{
                                        left: getPos(t.startDate),
                                        width: Math.max(getPos(t.dueDate) - getPos(t.startDate), 40),
                                        backgroundColor: t.status === 'DONE' ? '#62A678' : '#6293A6'
                                    }}>
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
                                <div className={styles.ganttTrack}>
                                    <div className={styles.skeletonBar} style={{left: 100 + (i * 30), width: 160}}/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}