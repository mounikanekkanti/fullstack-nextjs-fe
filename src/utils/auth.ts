// auth.ts

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export const authenticateUser = async (username: string, password: string, role: string): Promise<string> => {
    try {
      const requestOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          role,
        }),
      };
  
      const response = await fetch(
        `http://localhost:3000/auth/login`,
        requestOptions
      );
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.message || 'Failed to authenticate user');
      }
  
      return result.role;
    } catch (error) {
      throw new Error(error.message || 'An error occurred during authentication');
    }
};

export const isLoggedIn = (): boolean => {
    const username = localStorage.getItem('username');
    return !!username;
};

export const logout = (): void => {
        localStorage.removeItem('username');
};

