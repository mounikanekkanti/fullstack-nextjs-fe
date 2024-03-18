import React, { useState } from 'react';
import Login from '../app/components/Login/Login';
import EmployeeForm from '../app/components/Admin/EmployeeForm';
import EmployeeDashboard from '../app/components/Employee/EmployeeDashboard';
import ManagerDashboard from '../app/components/Manager/ManagerDashboard';

const LoginPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [username, setUserName] = useState<string>('');
  const [managerId, setManagerId] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');

  const handleLogin = (role: string, name: string, managerId: string, employeeId: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setUserName(name);
    setManagerId(managerId);
    setEmployeeId(employeeId);
    console.log(role, name, managerId, employeeId);
  };

  return (
    <div>
      {!isLoggedIn && <Login onLogin={handleLogin} />}
      {isLoggedIn && (
        <>
          {userRole === 'admin' && <EmployeeForm userRole={userRole} employeeId={employeeId} username={username} />}
          {userRole === 'employee' && <EmployeeDashboard userRole={userRole} employeeId={employeeId} username={username} />}
          {userRole === 'manager' && <ManagerDashboard employeeId={employeeId} username={username} />}
        </>
      )}
    </div>
  );
};

export default LoginPage;
