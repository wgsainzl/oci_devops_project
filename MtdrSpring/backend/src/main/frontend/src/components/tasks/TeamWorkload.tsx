import { type JSX } from "react";
import type { WorkloadMember } from "../../types";
import styles from "./TeamWorkload.module.css";

interface Props {
  members: WorkloadMember[];
}

const PROFILE_COLOR: string[] = ["#5aacbe", "#8ab4c8", "#a0c8b8"];
const BACKGROUND_COLOR: string[] = ["#FBF9F8", "#EBEBEB"];

export default function TeamWorkload({ members }: Props): JSX.Element {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.col}>Task</span>
        <span className={styles.col}>Work distribution</span>
      </div>

      {members.map((m, i) => (
        <div
          key={m.name}
          className={styles.row}
          style={{ background: BACKGROUND_COLOR[i % BACKGROUND_COLOR.length] }}
        >
          <div className={styles.memberInfo}>
            <div
              className={styles.avatar}
              style={{ background: PROFILE_COLOR[i % PROFILE_COLOR.length] }}
            >
              {m.name.charAt(0).toUpperCase()}
            </div>
            <span className={styles.name}>{m.name}</span>
          </div>

          <div className={styles.barTrack}>
            <div
              className={styles.bar}
              style={{ width: `${m.pct}%`, background: "#222222" }}
            >
              {m.pct >= 10 && <span className={styles.pct}>{m.pct}%</span>}
            </div>

            {m.pct < 10 && (
              <span
                className={styles.pct}
                style={{
                  color: "#000",
                  position: "absolute",
                  left: `${m.pct}%`,
                  paddingLeft: "8px",
                }}
              >
                {m.pct}%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
