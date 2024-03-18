// services/timesheetService.tsx (or any appropriate directory and filename)

import instance from "./axiosInstance";
import { AxiosResponse } from 'axios';

export function getTimeSheetById(employeeId: string): Promise<AxiosResponse<any>> {
  return instance.get(`timesheet//timesheets/employee/${employeeId}`);
}

export function getTimeSheetByMId(managerId: string): Promise<AxiosResponse<any>> {
  return instance.get(`timesheet//timesheets/manager/${managerId}`);
}
