import type { AxiosResponse } from "axios";
import type {
  ActivityLogItem,
  DashboardStats,
  PendingAction,
  SprintVelocityEntry,
  TaskStatusEntry,
  Team,
  User,
  WorkloadMember,
} from "../types";
import * as fixtures from "./fixtures";

const MOCK_DELAY = 300; // in ms to simulate network
let mockTeamsStore: Team[] = [...fixtures.mockTeams];

// promise-based delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// mock API responses
export const mockAuthAPI = {
  signIn: async (
    email: string,
    _password: string,
  ): Promise<AxiosResponse<{ user: User; token: string }>> => {
    await delay(MOCK_DELAY);

    return {
      data: {
        user: {
          userId: fixtures.mockUser.id,
          username: `${fixtures.mockUser.firstName} ${fixtures.mockUser.lastName}`,
          email: email || fixtures.mockUser.email,
          role: fixtures.mockUser.role as User["role"],
          currentTeamId: fixtures.mockUser.currentTeamId,
        },
        token: "mock-jwt-token-" + Date.now(),
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} as any },
    };
  },

  verify2FA: async (
    _challengeToken: string,
    _code: string,
  ): Promise<AxiosResponse<{ user: User; token: string }>> => {
    await delay(MOCK_DELAY);
    return {
      data: {
        user: {
          userId: fixtures.mockUser.id,
          username: `${fixtures.mockUser.firstName} ${fixtures.mockUser.lastName}`,
          email: fixtures.mockUser.email,
          role: fixtures.mockUser.role as User["role"],
          currentTeamId: fixtures.mockUser.currentTeamId,
        },
        token: "mock-jwt-token-" + Date.now(),
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;
  },

  createAccount: async (_data: any): Promise<AxiosResponse<{ message: string }>> => {
    await delay(MOCK_DELAY);
    return {
      data: { message: "Account created successfully" },
      status: 201,
      statusText: "Created",
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;
  },

  signOut: async (): Promise<AxiosResponse<void>> => {
    await delay(MOCK_DELAY);
    return {
      data: undefined,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;
  },
};

export const mockDashboardAPI = {
  getPendingActions: async (
    _teamId?: string | null,
  ): Promise<AxiosResponse<PendingAction[]>> => {
    await delay(MOCK_DELAY);
    return {
      data: fixtures.mockPendingActions,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;
  },

  getStats: async (_teamId?: string | null): Promise<AxiosResponse<DashboardStats>> => {
    await delay(MOCK_DELAY);
    return {
      data: fixtures.mockStats,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;
  },

  getRecentActivity: async (
    _teamId?: string | null,
    _limit = 20,
  ): Promise<AxiosResponse<ActivityLogItem[]>> => {
    await delay(MOCK_DELAY);
    return {
      data: fixtures.mockActivity,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;
  },

  getWorkload: async (
    _teamId?: string | null,
  ): Promise<AxiosResponse<WorkloadMember[]>> => {
    await delay(MOCK_DELAY);
    return {
      data: fixtures.mockWorkload,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;
  },

  getTaskStatusSummary: async (
    _teamId?: string | null,
  ): Promise<AxiosResponse<TaskStatusEntry[]>> => {
    await delay(MOCK_DELAY);
    return {
      data: fixtures.mockTaskStatus,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;
  },

  getSprintVelocity: async (
    _teamId?: string | null,
  ): Promise<AxiosResponse<SprintVelocityEntry[]>> => {
    await delay(MOCK_DELAY);
    return {
      data: fixtures.mockSprintVelocity,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;
  },

  getDueDateDistribution: async (
    _teamId?: string | null,
  ): Promise<AxiosResponse<SprintVelocityEntry[]>> => {
    await delay(MOCK_DELAY);
    return {
      data: fixtures.mockSprintVelocity,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;
  },

  getTeams: async (): Promise<AxiosResponse<Team[]>> => {
    await delay(MOCK_DELAY);
    return {
      data: fixtures.mockTeams,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;
  },
};

export const mockTeamsAPI = {
  getAll: async (): Promise<AxiosResponse<Team[]>> => {
    await delay(MOCK_DELAY);
    return {
      data: mockTeamsStore,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;
  },

  create: async (name: string): Promise<AxiosResponse<Team>> => {
    await delay(MOCK_DELAY);
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name,
      memberCount: 0,
    };
    mockTeamsStore = [...mockTeamsStore, newTeam];

    return {
      data: newTeam,
      status: 201,
      statusText: "Created",
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;
  },

  rename: async (teamId: string, name: string): Promise<AxiosResponse<Team>> => {
    await delay(MOCK_DELAY);
    const idx = mockTeamsStore.findIndex((t) => t.id === teamId);
    if (idx < 0) {
      throw new Error("Team not found");
    }

    const updated = { ...mockTeamsStore[idx], name };
    mockTeamsStore = mockTeamsStore.map((t) => (t.id === teamId ? updated : t));

    return {
      data: updated,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;
  },

  delete: async (teamId: string): Promise<AxiosResponse<void>> => {
    await delay(MOCK_DELAY);
    mockTeamsStore = mockTeamsStore.filter((t) => t.id !== teamId);

    return {
      data: undefined,
      status: 204,
      statusText: "No Content",
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;
  },

  addMember: async (_teamId: string, _userId: string): Promise<AxiosResponse<void>> => {
    await delay(MOCK_DELAY);
    return {
      data: undefined,
      status: 204,
      statusText: "No Content",
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;
  },

  searchUsers: async (query: string): Promise<AxiosResponse<User[]>> => {
    await delay(MOCK_DELAY);
    const q = query.trim().toLowerCase();
    const users = fixtures.mockUsers.filter(
      (u) =>
        q.length === 0 ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );

    return {
      data: users as User[],
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} as any },
    } as AxiosResponse;
  },
};
