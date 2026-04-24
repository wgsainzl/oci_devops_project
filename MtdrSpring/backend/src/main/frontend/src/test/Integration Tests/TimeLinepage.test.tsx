// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { screen, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import React from "react";

vi.mock("../../hooks/AuthContext", () => ({
  useAuth: () => ({
    user: { currentTeamId: "team-1" },
  }),
}));

const mockGetTasks = vi.fn();

vi.mock("../../API", () => ({
  timelineAPI: {
    getTasks: (...args: any[]) => mockGetTasks(...args),
  },
}));

import TimelinePage from "../../pages/TimelinePage";

it("Req 1: Timeline muestra tareas asignadas (Responsible visible)", async () => {
  mockGetTasks.mockResolvedValueOnce({
    data: [
      {
        id: "ORC-100",
        title: "API Gateway Implementation",
        responsible: "Guillermo Sainz",
        status: "IN_PROGRESS",
        priority: "CRITICAL",
        type: "FEATURE",
        createdAt: "2026-01-15",
        startDate: "2026-01-15",
        dueDate: "2026-03-01",
      },
    ],
  });

  render(
    <MemoryRouter initialEntries={["/timeline"]}>
      <TimelinePage />
    </MemoryRouter>,
  );

  expect(await screen.findByText("ORC-100")).toBeInTheDocument();
  expect(screen.getByText("API Gateway Implementation")).toBeInTheDocument();
  expect(screen.getByText("Guillermo Sainz")).toBeInTheDocument();
});
