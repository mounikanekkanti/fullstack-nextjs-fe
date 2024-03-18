import React from 'react';
import EmployeeDashboard from '../app/components/Employee/EmployeeDashboard';
import { useEmployeeContext } from '../app/common/EmployeeContext';

const EmployeePage = () => {
  const { employeeId } = useEmployeeContext(); // Retrieve employeeId from the context
  const { username } = useEmployeeContext(); 

  const employeeIdValue = employeeId ?? '';
  const userNameValue = username ?? '';

  return (
    <div>
      <EmployeeDashboard userRole="employee" employeeId={employeeIdValue} username={userNameValue}/>
    </div>
  );
};

export default EmployeePage;
