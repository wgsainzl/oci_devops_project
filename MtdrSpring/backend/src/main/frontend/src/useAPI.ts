/**
 * conditional API selector
 * when VITE_USE_MOCKS=true, returns mock API functions, 
   otherwise returns real API functions
 */

import { dashboardAPI, tasksAPI, teamsAPI, timelineAPI } from './API'
import { mockDashboardAPI, mockTeamsAPI, mockTimelineAPI } from './mocks'

const useMocks = String(import.meta.env.VITE_USE_MOCKS).toLowerCase() === 'true'

export const useAPI = {
  get dashboard() {
    return useMocks ? mockDashboardAPI : dashboardAPI
  },
  get tasks() {
    return tasksAPI
  },
  get teams() {
    return useMocks ? mockTeamsAPI : teamsAPI
  },
  get timeline() { 
    return useMocks ? mockTimelineAPI : timelineAPI
  }
}