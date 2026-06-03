/*
 * task creation form. file kept as NewItem (not NewTask)
 * only ADMIN / MANAGER roles may create tasks
 * calls onCreated(newTask) on success so the parent can append to its list
 */

import React, { type JSX, useState } from 'react'
import { tasksAPI } from '../../API'
import { useAuth } from '../../hooks/AuthContext'
import type { NewTaskPayload, Task, TaskStatus, TaskPriority } from '../../types'
import styles from './NewItem.module.css'

interface Props {
  onCreated?: (task: Task) => void
  onCancel?: () => void
}

type TaskFormState = {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  startDate: string
  estimatedHours: string
  dueDate: string
}

const DEFAULT_FORM: TaskFormState = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  startDate: '',
  estimatedHours: '',
  dueDate: '',
}

const toIsoString = (dateValue?: string): string | undefined => {
  if (!dateValue) return undefined
  const parsed = new Date(`${dateValue}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
}

export default function NewItem({ onCreated, onCancel }: Props): JSX.Element {
  const { isManager } = useAuth()
  const [form, setForm] = useState<TaskFormState>(DEFAULT_FORM)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  if (!isManager) {
    return (
      <p className={styles.denied}>Only Admins and Managers can create tasks.</p>
    )
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ): void => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return

    setLoading(true)
    setError(null)

    try {
      const isoStartDate = toIsoString(form.startDate)
      const isoDueDate = toIsoString(form.dueDate)

      // 1. Regresamos al objeto Task real que tu base de datos y negocio necesitan
      const payload = {
        title: form.title.trim(),
        description: form.description?.trim() || null,
        startDate: isoStartDate || null,
        dueDate: isoDueDate || null,
        estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : null,
        actualHours: 0.0,
        status: form.status,     
        priority: form.priority, 
      }

      console.log("Enviando petición autenticada a la API:", payload);

      // 2. Apuntamos al endpoint real de tareas de tu controlador principal
      const response = await fetch("/api/tasks", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Si usas tokens JWT guardados en localStorage, descomenta la siguiente línea:
          // "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        // CRUCIAL: Le indica al navegador que envíe las cookies de sesión (JSESSIONID) 
        // creadas en el puerto 8080 a través del proxy de Vite.
        credentials: "include", 
        body: JSON.stringify(payload),
      })

      if (response.status === 401 || response.status === 403) {
        throw new Error("Tu sesión en el backend ha expirado. Por favor, recarga o inicia sesión en localhost:8080 primero.");
      }

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`)
      }

      const newTask = await response.json()
      if (onCreated) onCreated(newTask)
      
      setForm(DEFAULT_FORM) 
      alert("¡Tarea guardada exitosamente en Oracle Cloud Base de Datos!");

    } catch (err: any) {
      console.error("Error al crear la tarea:", err)
      setError(err.message || "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.heading}>New Task</h2>

      {error && <div className={styles.error} role="alert">{error}</div>}

      {/* title */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="title">Title *</label>
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
        <label className={styles.label} htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          className={styles.textarea}
          value={form.description ?? ''}
          onChange={handleChange}
          placeholder="What needs to be done?"
          rows={3}
        />
      </div>

      {/* start date / due date / hours row */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="startDate">Start date</label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            className={styles.input}
            value={form.startDate}
            onChange={handleChange}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="estimatedHours">Estimated hours</label>
          <input
            id="estimatedHours"
            name="estimatedHours"
            type="number"
            min="0"
            step="0.5"
            className={styles.input}
            value={form.estimatedHours}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            className={styles.select}
            value={form.priority}
            onChange={handleChange}
          >
            {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as TaskPriority[]).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* status / due date row */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            className={styles.select}
            value={form.status}
            onChange={handleChange}
          >
            {(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE'] as TaskStatus[]).map(
              (s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ),
            )}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="dueDate">Due date</label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            className={styles.input}
            value={form.dueDate ?? ''}
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
          {loading ? 'Creating…' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}
