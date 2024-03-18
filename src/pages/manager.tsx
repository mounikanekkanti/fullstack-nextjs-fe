import React from 'react';
import ManagerDashboard from '../app/components/Manager/ManagerDashboard';
import { useEmployeeContext } from '../app/common/EmployeeContext';

const ManagerPage = () => {
  const { employeeId } = useEmployeeContext();
  const { username } = useEmployeeContext(); 

  const employeeIdValue = employeeId ?? '';
  const userNameValue = username ?? '';
  return (
    <div>
      <ManagerDashboard employeeId={employeeIdValue} username={userNameValue}/>
    </div>
  );
};

export default ManagerPage;
