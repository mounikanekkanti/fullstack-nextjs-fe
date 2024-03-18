// Import AxiosInstance from your Axios configuration file
import instance from "./axiosInstance";

// Define types or interfaces for request and response payloads if necessary

// Function to fetch all employees
export function getAllEmployee() {
  return instance.get(`/employee`);
}

// Function to fetch the list of managers
export function getManagerList() {
  return instance.get(`/employee/managerList`);
}

// Function to update an employee
export function updateEmployee(employeeId: string, data: any) {
  return instance.put(`/employee/${employeeId}`, data);
}

// Function to delete an employee
export function deleteEmployee(employeeId: string) {
  return instance.put(`/employee/${employeeId}/delete`);
}

// Function to add a new employee
export function addEmployee(data: any) {
  return instance.post(`/employee`, data);
}
