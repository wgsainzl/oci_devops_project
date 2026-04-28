import { type JSX } from "react";
import type { PendingAction } from "../../../types";
import styles from "./PendingActionsTable.module.css";

interface Props {
  rows: PendingAction[];
}

const ExternalLinkIcon = (): JSX.Element => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M11 3a1 1 0 1 0 0 2h2.586l-6.293 6.293a1 1 0 1 0 1.414 1.414L15 6.414V9a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-5z" />
    <path d="M5 5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a1 1 0 1 0-2 0v3H5V7h3a1 1 0 0 0 0-2H5z" />
  </svg>
);

const AlertIcon = (): JSX.Element => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#b0120a"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default function PendingActionsTable({ rows }: Props): JSX.Element {
  if (rows.length === 0) {
    return (
      <p className={styles.empty}>
        No pending actions, you&apos;re all caught up
      </p>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Task</th>
            <th>Responsible</th>
            <th>Message</th>
            <th>Recommended action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id ?? `row-${idx}`}>
              <td>
                <span className={styles.taskId}>{row.id ?? '—'}</span>
                <span className={styles.taskTitle}>{row.title ?? '—'}</span>
              </td>
              <td className={styles.responsible}>
                <span>{row.responsible ?? 'Unassigned'}</span>
              </td>
              <td className={styles.message}>
                <div className={styles.messageContainer}>
                  <div className={styles.messageDetail}>
                    {(row as any).message ?? row.message ?? 'No details available'}
                    {(row as any).isOverdue ? (
                      <span className={styles.alertInline}>
                        <AlertIcon />
                      </span>
                    ) : null}
                  </div>
                </div>
              </td>
              <td>
                <button className={styles.actionBtn} type="button">
                  {(row.action ?? 'Update')} <ExternalLinkIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
