/*
 * task creation form. file kept as NewItem (not NewTask)
 * only ADMIN / MANAGER roles may create tasks
 * calls onCreated(newTask) on success so the parent can append to its list
 */
import React, { type JSX, useState, useEffect } from 'react'
import { useAuth } from '../../hooks/AuthContext'
import type { Task, TaskStatus, TaskPriority } from '../../types'
import styles from './NewItem.module.css'

interface Props {
  onCreated?: (task: Task) => void
  onCancel?: () => void
}

interface DBUser {
  userId: number
  name: string
  email: string
}

type TaskFormState = {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  startDate: string
  estimatedHours: string
  dueDate: string
  responsibleId: string 
}

const DEFAULT_FORM: TaskFormState = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  startDate: '',
  estimatedHours: '',
  dueDate: '',
  responsibleId: '', 
}

const toIsoString = (dateValue?: string): string | undefined => {
  if (!dateValue) return undefined
  const parsed = new Date(`${dateValue}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
}

export default function NewItem({ onCreated, onCancel }: Props): JSX.Element {
  const { user } = useAuth() 
  const [form, setForm] = useState<TaskFormState>(DEFAULT_FORM)
  const [dbUsers, setDbUsers] = useState<DBUser[]>([]) 
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // load members from OCI
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        
        const response = await fetch("/api/users/", { credentials: "include" })
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)
        
        const data = await response.json()
        
        if (Array.isArray(data)) {
          setDbUsers(data)
          if (data.length > 0) {
            setForm(prev => ({ ...prev, responsibleId: data[0].userId.toString() }))
          }
        }
      } catch (err: any) {
        console.error("Network or parsing failure in real catalog:", err)
        setError("Unable to connect to delevopers user catalog.")
      }
    }

    fetchUsers()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.responsibleId) return

    setLoading(true)
    setError(null)

    try {
      const isoStartDate = toIsoString(form.startDate)
      const isoDueDate = toIsoString(form.dueDate)
      const selectedResponsibleId = parseInt(form.responsibleId)

      const payload = {
        title: form.title.trim(),
        description: form.description?.trim() || null,
        startDate: isoStartDate || null,
        dueDate: isoDueDate || null,
        estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : null,
        actualHours: 0.0,
        status: form.status,     
        priority: form.priority, 

        creator: { userId: selectedResponsibleId }, 
        manager: { userId: selectedResponsibleId },     
        responsible: { userId: selectedResponsibleId }, 
        
        sprint: null     
      }

      console.log("Inserting a real task linked to a real user:", payload)

      const response = await fetch("/api/tasks", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify(payload),
      })

      if (response.status === 409) {
        throw new Error("Conflict (409): Verify that Sprint ID 1 exists in your Oracle physical table.")
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const newTask = await response.json()
      if (onCreated) onCreated(newTask)
      
      setForm({ ...DEFAULT_FORM, responsibleId: form.responsibleId }) 
      alert("Task created and successfully assigned to the developer")

    } catch (err: any) {
      console.error("Error creating task:", err)
      setError(err.message || "Unable to connect to the server.")
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

      {/* developers connection */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="responsibleId">Assign Responsible *</label>
        <select
          id="responsibleId"
          name="responsibleId"
          className={styles.select}
          value={form.responsibleId}
          onChange={handleChange}
          required
        >
          {dbUsers.length === 0 ? (
            <option value="">Connecting with Developers...</option>
          ) : (
            dbUsers.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name} - ({member.email})
              </option>
            ))
          )}
        </select>
      </div>

      {/* start date / estimated hours / priority row */}
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
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
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
            {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE'].map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
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
        <button type="submit" className={styles.btnPrimary} disabled={loading || dbUsers.length === 0}>
          {loading ? 'Creating…' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}