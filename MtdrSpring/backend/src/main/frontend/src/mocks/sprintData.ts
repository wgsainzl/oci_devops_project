import type { TaskStatusEntry } from "../types";
import type { HoursEntry } from "../components/charts/HoursChart";

// task counts based on status
export const SPRINT_TASK_STATUS: TaskStatusEntry[] = [
  {
    developer: "Guillermo",
    userId: "user-mock-1",
    todo: 0,
    inProgress: 0,
    inReview: 0,
    blocked: 0,
    done: 5,
  },
  {
    developer: "Sebastián",
    userId: "user-mock-2",
    todo: 0,
    inProgress: 1,
    inReview: 0,
    blocked: 0,
    done: 5,
  },
  {
    developer: "Mauricio",
    userId: "user-mock-3",
    todo: 0,
    inProgress: 0,
    inReview: 0,
    blocked: 0,
    done: 4,
  },
  {
    developer: "Juan Manuel",
    userId: "user-mock-4",
    todo: 0,
    inProgress: 3,
    inReview: 0,
    blocked: 0,
    done: 3,
  },
  {
    developer: "Diego",
    userId: "user-mock-5",
    todo: 0,
    inProgress: 1,
    inReview: 0,
    blocked: 0,
    done: 2,
  },
];

// sprint hours (Actual)
export const SPRINT_HOURS: HoursEntry[] = [
  { developer: "Guillermo", estimated: 7.5, actual: 5.0 },
  { developer: "Sebastián", estimated: 14.5, actual: 12.5 },
  { developer: "Mauricio", estimated: 5.5, actual: 6.25 },
  { developer: "Juan Manuel", estimated: 13.5, actual: 22.8 },
  { developer: "Diego", estimated: 8.5, actual: 6.5 },
];
