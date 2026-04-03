/**
 * conditional API selector
 * when VITE_USE_MOCKS=true, returns mock API functions, 
   otherwise returns real API functions
 */

import { dashboardAPI, tasksAPI, teamsAPI } from './API'
import { mockDashboardAPI, mockTeamsAPI } from './mocks'

const useMocks = import.meta.env.VITE_USE_MOCKS

export const useAPI = {
  get dashboard() {
    return useMocks ? mockDashboardAPI : dashboardAPI
  },
  get tasks() {
    return tasksAPI // still no mock for this yet
  },
  get teams() {
    return useMocks ? mockTeamsAPI : teamsAPI
  },
}
