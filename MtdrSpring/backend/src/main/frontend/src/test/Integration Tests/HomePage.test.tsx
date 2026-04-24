// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import HomePage from "../../pages/HomePage";

let authState: { userId: string; role: "MANAGER" | "DEVELOPER" } = {
  userId: "101",
  role: "MANAGER",
};

vi.mock("../../hooks/AuthContext", () => ({
  useAuth: () => ({
    user: {
      userId: authState.userId,
      role: authState.role,
      email: "test@oracle.com",
      username: "Test User",
      currentTeamId: "team-1",
    },
    isManager: authState.role === "MANAGER",
  }),
}));

const mockGetAll = vi.fn();

vi.mock("../../useAPI", () => ({
  useAPI: {
    tasks: {
      getAll: (...args: any[]) => mockGetAll(...args),
    },
  },
}));

function renderHome(): void {
  render(
    <MemoryRouter initialEntries={["/home"]}>
      <HomePage />
    </MemoryRouter>,
  );
}

// Fixture con shape que HomePage usa para computar dashboard
const TASKS = [
  {
    taskId: 1,
    title: "API Gateway",
    status: "IN_PROGRESS",
    dueDate: "2026-02-20",
    updatedAt: "2026-02-10",
    estimatedHours: 5,
    actualHours: 3,
    responsible: { userId: 101, name: "Alice Dev" },
    sprint: { sprintId: 1, sprintName: "Sprint 1" },
  },
  {
    taskId: 2,
    title: "DB Migration",
    status: "DONE",
    dueDate: "2026-02-18",
    updatedAt: "2026-02-11",
    estimatedHours: 8,
    actualHours: 10,
    responsible: { userId: 102, name: "Bob Dev" },
    sprint: { sprintId: 1, sprintName: "Sprint 1" },
  },
  {
    taskId: 3,
    title: "Refactor Auth",
    status: "IN_REVIEW",
    dueDate: "2026-02-25",
    updatedAt: "2026-02-12",
    estimatedHours: 3,
    actualHours: 2,
    responsible: { userId: 101, name: "Alice Dev" },
    sprint: { sprintId: 2, sprintName: "Sprint 2" },
  },
  {
    taskId: 4,
    title: "Fix CI",
    status: "BLOCKED",
    dueDate: "2026-02-17",
    updatedAt: "2026-02-12",
    estimatedHours: 2,
    actualHours: 1,
    responsible: { userId: 101, name: "Alice Dev" },
    sprint: { sprintId: 2, sprintName: "Sprint 2" },
  },
];

beforeEach(() => {
  mockGetAll.mockReset();
  authState = { userId: "101", role: "MANAGER" };
});

it("Req 5: Manager ve dashboard de TEAM ('Team Tasks Status')", async () => {
  mockGetAll.mockResolvedValueOnce(TASKS);

  renderHome();

  await waitFor(() => {
    expect(screen.getByText("Pending actions")).toBeInTheDocument();
  });

  expect(screen.getByText("Team Tasks Status")).toBeInTheDocument();
  expect(screen.queryByText("My Tasks Status")).not.toBeInTheDocument();
});

it("Req 1 + 5 + 7 (estado actual): aun como Developer muestra TEAM por override en HomePage", async () => {
  authState = { userId: "101", role: "DEVELOPER" };
  mockGetAll.mockResolvedValueOnce(TASKS);

  renderHome();
  await screen.findByText("Pending actions");

  // Debido a `isManager = true;` en HomePage [47]
  expect(screen.getByText("Team Tasks Status")).toBeInTheDocument();
  expect(screen.queryByText("My Tasks Status")).not.toBeInTheDocument();
});

it("Req 6: KPIs de TEAM aparecen (Hours per Developer)", async () => {
  mockGetAll.mockResolvedValueOnce(TASKS);

  renderHome();

  await screen.findByText("Pending actions");
  expect(screen.getByText(/Hours per Developer/i)).toBeInTheDocument();
});

it("Req 3 (UI actual): secciones por sprint existen ('Sprint Totals' y 'Cost per Developer by Sprint')", async () => {
  mockGetAll.mockResolvedValueOnce(TASKS);

  renderHome();

  await screen.findByText("Pending actions");
  expect(screen.getByText("Sprint Totals")).toBeInTheDocument();
  expect(screen.getByText(/Cost per Developer by Sprint/i)).toBeInTheDocument();
});

it("Req 2 (derivado): Pending actions incluye tasks BLOCKED/IN_REVIEW", async () => {
  mockGetAll.mockResolvedValueOnce(TASKS);

  renderHome();

  await screen.findByText("Pending actions");

  // HomePage crea ids `Task-${taskId}`
  expect(screen.getByText("Task-3")).toBeInTheDocument();
  expect(screen.getByText("Task-4")).toBeInTheDocument();
});
