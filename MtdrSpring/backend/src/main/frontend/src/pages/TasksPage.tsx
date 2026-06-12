import {type JSX, useEffect, useState, useCallback} from "react";
import {useAPI} from "../useAPI";
import {useAuth} from "../hooks/AuthContext";
import type {Task, SemanticTaskSearchResult} from "../types";
import styles from "./TasksPage.module.css";
import TaskCompleteModal from "../components/tasks/TaskCompleteModal.tsx";

export default function TasksPage(): JSX.Element {
    const {user} = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // --- Search & Filtering States ---
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [localIdFilter, setLocalIdFilter] = useState<string | null>(null);
    const [vectorResults, setVectorResults] = useState<Task[]>([]);
    const [isSearchingBackend, setIsSearchingBackend] = useState<boolean>(false);

    // --- Popup Context State Handling ---
    const [selectedTaskForComplete, setSelectedTaskForComplete] = useState<Task | null>(null);

    // Fetch baseline collection
    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            const response = await useAPI.tasks.getAll();
            const rawData = response && response.data ? response.data : response;

            if (Array.isArray(rawData)) {
                const mappedTasks: Task[] = rawData.map((item: any) => ({
                    id: String(item.id),
                    title: item.title || "Untitled",
                    description: item.description || "",
                    status: String(item.status).toUpperCase() as Task["status"],
                    priority: String(item.priority).toUpperCase() as Task["priority"],
                    responsible: item.responsible || "Unassigned",
                    startDate: item.startDate || null,
                    dueDate: item.dueDate || "",
                    createdAt: item.createdAt || "",
                    estimatedHours: item.estimatedHours != null ? Number(item.estimatedHours) : 0,
                    actualHours: item.actualHours != null ? Number(item.actualHours) : 0,
                    sprint: item.sprint || undefined,
                }));

                setTasks(mappedTasks);
            } else {
                setTasks([]);
            }
        } catch (err) {
            console.error("Failed to populate tasks collection:", err);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // --- Intelligent Routing Search Loop ---
    useEffect(() => {
        const trimmedQuery = searchQuery.trim();

        if (!trimmedQuery) {
            setLocalIdFilter(null);
            setVectorResults([]);
            setIsSearchingBackend(false);
            return;
        }

        const idExistsLocally = tasks.some(task => task.id === trimmedQuery);

        if (idExistsLocally) {
            setLocalIdFilter(trimmedQuery);
            setVectorResults([]);
            setIsSearchingBackend(false);
            return;
        }

        setLocalIdFilter(null);
        setIsSearchingBackend(true);

        const delayDebounceTimer = setTimeout(async () => {
            try {
                const aiResults: SemanticTaskSearchResult[] = await useAPI.tasks.vectorSearch(trimmedQuery);

                const mappedAIResults: Task[] = aiResults.map((item) => ({
                    id: String(item.taskId),
                    title: item.title || "Untitled",
                    description: item.contentPreview || item.description || "",
                    status: String(item.status).toUpperCase() as Task["status"],
                    priority: String(item.priority).toUpperCase() as Task["priority"],
                    responsible: item.responsibleName || "Unassigned",
                    startDate: null,
                    dueDate: "",
                    createdAt: "",
                    sprint: item.sprintId ? {
                        sprintId: item.sprintId,
                        sprintName: "",
                        startDate: "",
                        endDate: ""
                    } : undefined
                }));

                setVectorResults(mappedAIResults);
            } catch (err) {
                console.error("Failed vector search fallback:", err);
                setVectorResults([]);
            } finally {
                setIsSearchingBackend(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceTimer);
    }, [searchQuery, tasks]);

    // --- Compute Displayed View Tasks ---
    let displayedTasks: Task[] = tasks;
    if (searchQuery.trim()) {
        if (localIdFilter) {
            displayedTasks = tasks.filter(task => task.id === localIdFilter);
        } else {
            displayedTasks = vectorResults;
        }
    }

    // Handles trigger when user selects a row item
    const handleInitiateComplete = (task: Task) => {
        setSelectedTaskForComplete(task);
    };

    // Submits actual hours parsed inside our custom pretty popup to API handler
    const handleConfirmComplete = async (actualHours: number) => {
        if (!selectedTaskForComplete) return;
        const taskId = selectedTaskForComplete.id;

        setUpdatingId(taskId);
        try {
            await useAPI.tasks.complete(taskId, actualHours);

            const updateStatusInList = (list: Task[]) =>
                list.map((t) => (t.id === taskId ? {...t, status: "DONE" as const, actualHours} : t));

            setTasks((prev) => updateStatusInList(prev));
            setVectorResults((prev) => updateStatusInList(prev));
            setSelectedTaskForComplete(null); // Close popup gracefully
        } catch (err) {
            console.error("Could not update task status:", err);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setLocalIdFilter(null);
        setVectorResults([]);
    };

    const renderSkeletons = () => {
        return Array.from({ length: 5 }).map((_, index) => (
            <tr key={`skeleton-${index}`} className={styles.skeletonRow}>
                <td><div className={styles.skeletonText} style={{ width: "30px" }} /></td>
                <td><div className={styles.skeletonText} style={{ width: "70%" }} /></td>
                <td>
                    <div className={styles.responsible} style={{ gap: "0.5rem" }}>
                        <div className={styles.skeletonAvatar} />
                        <div className={styles.skeletonText} style={{ width: "80px" }} />
                    </div>
                </td>
                <td><div className={styles.skeletonText} style={{ width: "50px", height: "1.5rem", borderRadius: "12px" }} /></td>
                <td><div className={styles.skeletonText} style={{ width: "60px", height: "1.5rem", borderRadius: "4px" }} /></td>
                <td style={{ textAlign: "right" }}><div className={styles.skeletonBtn} /></td>
            </tr>
        ));
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1>Tasks</h1>
                    <p>{user?.currentTeamId || 'EasyMoneySnipers'}</p>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.sectionBlock}>
                    <h2 className={styles.sectionTitle}>
                        Tasks Overview{" "}
                        <span className={styles.sectionHint}>
                            {loading
                                ? "(Syncing workspace...)"
                                : searchQuery.trim()
                                    ? `(${displayedTasks.length} results)`
                                    : `(${tasks.length} tasks synced)`
                            }
                        </span>
                    </h2>

                    {/* Search Bar Container */}
                    <div className={styles.searchContainer}
                         style={{marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                        <input
                            type="text"
                            placeholder="Enter task ID or search conceptually (e.g., 'database deployment')..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={loading}
                            style={{
                                padding: '0.5rem var(--space-3)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--color-border)',
                                backgroundColor: 'var(--color-bg-content)',
                                color: 'var(--color-text-primary)',
                                flexGrow: 1
                            }}
                        />
                        {localIdFilter && <span style={{fontSize: '0.85rem', color: '#16a34a', fontWeight: 'bold'}}>✓ Matched Local ID</span>}
                        {isSearchingBackend &&
                            <span style={{fontSize: '0.85rem', color: 'var(--color-text-muted)'}}>AI Scanning Database...</span>}
                        {searchQuery && (
                            <button type="button" onClick={handleClearSearch} style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                color: 'var(--color-oracle-red, #ff4d4d)',
                                fontWeight: 700
                            }}>
                                Clear
                            </button>
                        )}
                    </div>

                    <div className={styles.card}>
                        <div className={styles.tableResponsive}>
                            <table className={styles.table}>
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Responsible</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th style={{textAlign: "right"}}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {loading ? (
                                    renderSkeletons()
                                ) : displayedTasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className={styles.emptyCell}>
                                            {isSearchingBackend ? (
                                                <span style={{color: 'var(--color-text-muted)', fontStyle: 'italic'}}>
                                                    Searching AI database...
                                                </span>
                                            ) : searchQuery.trim() ? (
                                                "No local matching IDs or semantic tasks found."
                                            ) : (
                                                "No active workspace tasks detected."
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    displayedTasks.map((task) => {
                                        const isCompleted = task.status === "DONE";
                                        return (
                                            <tr key={task.id} className={isCompleted ? styles.rowCompleted : ""}>
                                                <td className={styles.taskId}>{task.id}</td>
                                                <td>
                                                    <span className={styles.taskTitle} title={task.description}>
                                                        {task.title}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.responsible}>
                                                        <img
                                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(task.responsible)}&background=random`}
                                                            className={styles.avatar}
                                                            alt=""
                                                        />
                                                        <span>{task.responsible}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={styles.priorityBadge}>{task.priority}</span>
                                                </td>
                                                <td>
                                                    <span className={`${styles.statusBadge} ${styles[task.status] || styles.TODO}`}>
                                                        {task.status.replace(/_/g, " ")}
                                                    </span>
                                                </td>
                                                <td style={{textAlign: "right"}}>
                                                    <button
                                                        type="button"
                                                        className={styles.completeBtn}
                                                        disabled={isCompleted || updatingId === task.id}
                                                        onClick={() => handleInitiateComplete(task)}
                                                    >
                                                        {updatingId === task.id ? "Updating..." : isCompleted ? "Done" : "Complete"}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Pretty Work Log Modal Trigger */}
            {selectedTaskForComplete && (
                <TaskCompleteModal
                    task={selectedTaskForComplete}
                    isOpen={selectedTaskForComplete !== null}
                    isUpdating={updatingId === selectedTaskForComplete.id}
                    onClose={() => setSelectedTaskForComplete(null)}
                    onConfirm={handleConfirmComplete}
                />
            )}
        </div>
    );
}