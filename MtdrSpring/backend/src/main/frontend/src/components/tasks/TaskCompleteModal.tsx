import {type JSX, useState, useEffect, useRef} from "react";
import styles from "../../pages/TasksPage.module.css";
import type {Task} from "../../types.ts";

interface TaskCompleteModalProps {
    task: Task;
    isOpen: boolean;
    isUpdating: boolean;
    onClose: () => void;
    onConfirm: (hours: number) => void;
}

export default function TaskCompleteModal({
                                              task,
                                              isOpen,
                                              isUpdating,
                                              onClose,
                                              onConfirm
                                          }: TaskCompleteModalProps): JSX.Element | null {
    const [hours, setHours] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Populate with estimated hours when modal opens
    useEffect(() => {
        if (isOpen) {
            setHours(String(task.estimatedHours || 0));
            // Seamlessly auto-focus the field for quick keyboard workflows
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen, task]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsedHours = Number(hours);
        if (isNaN(parsedHours) || parsedHours < 0) return;
        onConfirm(parsedHours);
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(13, 30, 63, 0.45)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "20px"
            }}
            onClick={onClose}
        >
            <div
                className={styles.card}
                style={{
                    width: "100%",
                    maxWidth: "420px",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.15)",
                    transform: "translateY(0)",
                    transition: "transform 0.2s ease"
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{display: "flex", flexDirection: "column", gap: "var(--space-4)"}}>
                    <div>
                        <span className={styles.taskId} style={{fontSize: "0.8rem"}}>TASK #{task.id}</span>
                        <h3 style={{
                            margin: "4px 0 0 0",
                            fontSize: "1.25rem",
                            color: "var(--color-text-primary)",
                            fontWeight: 600
                        }}>
                            Log Actual Work Hours
                        </h3>
                        <p style={{
                            margin: "6px 0 0 0",
                            fontSize: "0.85rem",
                            color: "var(--color-text-secondary)",
                            lineHeight: 1.4
                        }}>
                            Please verify the exact number of hours spent finishing: <br/>
                            <strong style={{color: "var(--color-text-primary)"}}>{task.title}</strong>
                        </p>
                    </div>

                    <hr style={{border: 0, borderTop: "1px solid var(--color-border-light)", margin: "4px 0"}}/>

                    <form onSubmit={handleSubmit}
                          style={{display: "flex", flexDirection: "column", gap: "var(--space-4)"}}>
                        <div style={{display: "flex", flexDirection: "column", gap: "var(--space-2)"}}>
                            <label style={{
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                color: "var(--color-text-secondary)",
                                letterSpacing: "0.05em"
                            }}>
                                Actual Hours Spent
                            </label>
                            <input
                                ref={inputRef}
                                type="number"
                                min="0"
                                step="0.25"
                                required
                                value={hours}
                                onChange={(e) => setHours(e.target.value)}
                                disabled={isUpdating}
                                style={{
                                    padding: "var(--space-3)",
                                    fontSize: "1rem",
                                    borderRadius: "var(--radius-sm)",
                                    border: "1px solid var(--color-border)",
                                    backgroundColor: "var(--color-bg)",
                                    color: "var(--color-text-primary)",
                                    width: "100%",
                                    boxSizing: "border-box"
                                }}
                            />
                        </div>

                        <div style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "var(--space-2)",
                            marginTop: "var(--space-2)"
                        }}>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isUpdating}
                                style={{
                                    padding: "var(--space-2) var(--space-4)",
                                    borderRadius: "var(--radius-sm)",
                                    border: "1px solid var(--color-border)",
                                    background: "transparent",
                                    color: "var(--color-text-secondary)",
                                    fontWeight: 600,
                                    cursor: "pointer"
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={styles.completeBtn}
                                disabled={isUpdating || !hours || Number(hours) < 0}
                            >
                                {isUpdating ? "Saving..." : "Complete Task"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}