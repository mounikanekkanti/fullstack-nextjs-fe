import React from 'react';
import EmployeeForm from '../app/components/Admin/EmployeeForm';
import { useEmployeeContext } from '../app/common/EmployeeContext';

const AdminPage = () => {
  const { employeeId } = useEmployeeContext(); // Retrieve employeeId from the context
  const { username } = useEmployeeContext(); 

   const employeeIdValue = employeeId ?? '';
   const userNameValue = username ?? '';

  return (
    <div>
      <EmployeeForm userRole="admin" employeeId={employeeIdValue} username={userNameValue} />
    </div>
  );
};

export default AdminPage;
