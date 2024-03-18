// services/leaveService.tsx (or any appropriate directory and filename)

import instance from "./axiosInstance";
import { AxiosResponse } from 'axios';

export function getLeavesByMId(employeeId: string): Promise<AxiosResponse<any>> {
  return instance.get(`/manager/${employeeId}/leaverequests`);
}

export function approveRejectLeave(managerId: string, leaveId: string, status: string, comment: string): Promise<AxiosResponse<any>> {
  return instance.put(`/manager/${managerId}/leaverequest/${leaveId} `, { status, comment });
}
