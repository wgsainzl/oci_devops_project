import { type JSX, useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/AuthContext";
import { useAPI } from "../../useAPI";
import type { Team } from "../../types";
import styles from "./TeamSwitcher.module.css";

// icons
const IconPlus = (): JSX.Element => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M7 1v12M1 7h12" />
  </svg>
);
const IconDots = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
    <circle cx="7" cy="2" r="1.2" />
    <circle cx="7" cy="7" r="1.2" />
    <circle cx="7" cy="12" r="1.2" />
  </svg>
);
const IconAddPerson = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path d="M8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-5 8a5 5 0 0 1 10 0H3zm14-8v2h2v2h-2v2h-2v-2h-2v-2h2v-2h2z" />
  </svg>
);
const IconEdit = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-.793.793-2.828-2.828.793-.793zm-2.207 2.207L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);
const IconTrash = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path d="M6 2a1 1 0 0 0-1 1v1H3a1 1 0 0 0 0 2h1v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6h1a1 1 0 0 0 0-2h-2V3a1 1 0 0 0-1-1H6zm1 2h6v1H7V4zm-1 3h8v9H6V7z" />
  </svg>
);

// placeholder teams shown before backend connected (mock)
const PLACEHOLDER_TEAMS: Team[] = [
  { id: "1", name: "EasyMoneySnipers" },
  { id: "2", name: "Parlocos" },
];

// team switcher component
export default function TeamSwitcher(): JSX.Element {
  const { isManager } = useAuth();
  const teamsAPI = useAPI.teams;
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    teamsAPI
      .getAll()
      .then((res) => {
        setTeams(res.data);
        if (res.data.length > 0) setActiveTeamId(res.data[0].id);
      })
      .catch(() => {
        setTeams(PLACEHOLDER_TEAMS);
        setActiveTeamId(PLACEHOLDER_TEAMS[0].id);
      });
  }, []);

  // close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCreateTeam = async (): Promise<void> => {
    const name = window.prompt("Team name:");
    if (!name?.trim()) return;
    try {
      const res = await teamsAPI.create(name.trim());
      setTeams((prev) => [...prev, res.data]);
    } catch {
      alert("Failed to create team.");
    }
  };

  const handleRename = async (team: Team): Promise<void> => {
    const name = window.prompt("New name:", team.name);
    if (!name?.trim() || name === team.name) return;
    try {
      await teamsAPI.rename(team.id, name.trim());
      setTeams((prev) => prev.map((t) => (t.id === team.id ? { ...t, name } : t)));
    } catch {
      alert("Failed to rename team.");
    }
    setOpenMenuId(null);
  };

  const handleDelete = async (team: Team): Promise<void> => {
    if (!window.confirm(`Delete team "${team.name}"? This cannot be undone.`)) return;
    try {
      await teamsAPI.delete(team.id);
      setTeams((prev) => {
        const filtered = prev.filter((t) => t.id !== team.id);
        if (activeTeamId === team.id) setActiveTeamId(filtered[0]?.id ?? null);
        return filtered;
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to delete team (may have active tasks).";
      alert(msg);
    }
    setOpenMenuId(null);
  };

  const handleAddPeople = async (team: Team): Promise<void> => {
    const query = window.prompt("Search users by name or email:");
    if (query == null) return;

    try {
      const res = await teamsAPI.searchUsers(query.trim());
      if (res.data.length === 0) {
        alert("No users found for that search.");
        return;
      }

      const options = res.data
        .map((u) => `${u.userId}: TEAMSWITCHER.TSX LN 126 u.username (${u.email})`)
        .join("\n");

      const selectedUserId = window.prompt(
        `Found users:\n${options}\n\nPaste the userId to add to "${team.name}":`,
      );
      if (!selectedUserId?.trim()) return;

      await teamsAPI.addMember(team.id, selectedUserId.trim());
      alert("User added to team.");
    } catch {
      alert("Failed to add user to team.");
    } finally {
      setOpenMenuId(null);
    }
  };

  return (
    <div className={styles.section} ref={menuRef}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>Teams</span>
        {isManager && (
          <button
            className={styles.addBtn}
            onClick={handleCreateTeam}
            aria-label="Create team"
          >
            <IconPlus />
          </button>
        )}
      </div>

      {teams.map((team) => (
        <div
          key={team.id}
          className={`${styles.teamRow} ${activeTeamId === team.id ? styles.teamRowActive : ""}`}
        >
          <button className={styles.teamName} onClick={() => setActiveTeamId(team.id)}>
            {team.name}
          </button>

          {isManager && (
            <div className={styles.dotsWrap}>
              <button
                className={styles.dotsBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === team.id ? null : team.id);
                }}
                aria-label={`Options for ${team.name}`}
              >
                <IconDots />
              </button>

              {openMenuId === team.id && (
                <div className={styles.contextMenu} role="menu">
                  <button
                    className={styles.menuItem}
                    role="menuitem"
                    onClick={() => handleAddPeople(team)}
                  >
                    <IconAddPerson /> Add People
                  </button>
                  <button
                    className={styles.menuItem}
                    role="menuitem"
                    onClick={() => handleRename(team)}
                  >
                    <IconEdit /> Edit Name
                  </button>
                  <button
                    className={`${styles.menuItem} ${styles.menuItemDanger}`}
                    role="menuitem"
                    onClick={() => handleDelete(team)}
                  >
                    <IconTrash /> Delete Team
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
