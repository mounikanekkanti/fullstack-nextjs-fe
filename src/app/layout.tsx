"use client";
import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  userRole: string;
  username: string;
  managerId: string;
  employeeId: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
