// utils/leaveApi.ts

import instance from "./axiosInstance";
import { AxiosResponse } from "axios";

export interface UpdateLeaveData {
  // Define the structure of the updatedLeaveData object if applicable
}

export function getLeavesById(employeeId: string): Promise<AxiosResponse<any>> {
  console.log("Employee ID:", employeeId); 
  return instance.get(`/leave/${employeeId}/getallleaves`);
}

export function cancelLeave(leaveId: string, comment: string): Promise<AxiosResponse<any>> {
  return instance.put(`/leave/${leaveId}/cancelleave`, { comment });
}

export function updateLeave(leaveId: string, updatedLeaveData: UpdateLeaveData): Promise<AxiosResponse<any>> {
  return instance.put(`/leave/${leaveId}/updateleave`, updatedLeaveData );
}

export function applyLeave(employeeId: string, data: any): Promise<AxiosResponse<any>> {
   return instance.post(
     `/leave/${employeeId}/applyleave`,
      data
    );
 }
