/**
 * conditional API selector
 * when VITE_USE_MOCKS=true, returns mock API functions, 
   otherwise returns real API functions
 */

import { dashboardAPI, tasksAPI, teamsAPI, timelineAPI } from './API'
import { mockDashboardAPI, mockTeamsAPI, mockTimelineAPI } from './mocks'

const useMocks = import.meta.env.VITE_USE_MOCKS

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
  get timeline() { // Add this block
    return useMocks ? mockTimelineAPI : timelineAPI
  }
}