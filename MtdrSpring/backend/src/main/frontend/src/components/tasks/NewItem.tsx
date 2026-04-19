/*
 * task creation form. file kept as NewItem (not NewTask)
 * only ADMIN / MANAGER roles may create tasks
 * calls onCreated(newTask) on success so the parent can append to its list
 */

import React, { type JSX, useState } from "react";
import { tasksAPI } from "../../API";
import { useAuth } from "../../hooks/AuthContext";
import type {
  NewTaskPayload,
  Task,
  TaskStatus,
  TaskPriority,
  TaskType,
} from "../../types";
import styles from "./NewItem.module.css";

interface Props {
  onCreated?: (task: Task) => void;
  onCancel?: () => void;
}

const DEFAULT_FORM: NewTaskPayload = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  type: "FEATURE",
  assignedDevId: "",
  dueDate: "",
};

export default function NewItem({ onCancel }: Props): JSX.Element {
  const { isManager } = useAuth();
  const [form, setForm] = useState<NewTaskPayload>(DEFAULT_FORM);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isManager) {
    return (
      <p className={styles.denied}>
        Only Admins and Managers can create tasks.
      </p>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ): void => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setLoading(true);
    try {
      await tasksAPI.create(form);
      setForm(DEFAULT_FORM);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create task.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.heading}>New Task</h2>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {/* title */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="title">
          Title *
        </label>
        <input
          id="title"
          name="title"
          className={styles.input}
          value={form.title}
          onChange={handleChange}
          placeholder="Task title…"
          required
        />
      </div>

      {/* description */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className={styles.textarea}
          value={form.description ?? ""}
          onChange={handleChange}
          placeholder="What needs to be done?"
          rows={3}
        />
      </div>

      {/* status / priority / type row */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            className={styles.select}
            value={form.status}
            onChange={handleChange}
          >
            {(
              [
                "TODO",
                "IN_PROGRESS",
                "IN_REVIEW",
                "BLOCKED",
                "DONE",
              ] as TaskStatus[]
            ).map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="priority">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            className={styles.select}
            value={form.priority}
            onChange={handleChange}
          >
            {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as TaskPriority[]).map(
              (p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ),
            )}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="type">
            Type
          </label>
          <select
            id="type"
            name="type"
            className={styles.select}
            value={form.type}
            onChange={handleChange}
          >
            {(["FEATURE", "BUG"] as TaskType[]).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* assignee / due date row */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="assignedDevId">
            Assign to (user ID)
          </label>
          <input
            id="assignedDevId"
            name="assignedDevId"
            className={styles.input}
            value={form.assignedDevId ?? ""}
            onChange={handleChange}
            placeholder="user-uuid"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="dueDate">
            Due date
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            className={styles.input}
            value={form.dueDate ?? ""}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* actions */}
      <div className={styles.actions}>
        {onCancel && (
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button type="submit" className={styles.btnPrimary} disabled={loading}>
          {loading ? "Creating…" : "Create Task"}
        </button>
      </div>
    </form>
  );
}
