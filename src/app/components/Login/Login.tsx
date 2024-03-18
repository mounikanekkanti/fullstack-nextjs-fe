"use client"; // This is a client component
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Tab, Tabs } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import loginImage from '../../../../public/images/lms-logo.png';
import ErrorBoundary from '../../common/ErrorBoundary'; // Import the ErrorBoundary component
import { Visibility, VisibilityOff } from '@mui/icons-material'; // Import visibility icons
import IconButton from '@mui/material/IconButton';
import Link from 'next/link';
import { useEmployeeContext } from '../../common/EmployeeContext';

const defaultTheme = createTheme();


interface LoginProps {
  onLogin: (
    role: string,
    firstName: string,
    managerId: string,
    employeeId: string
  ) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [userid, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'employee' | 'manager' | 'hradmin'>('employee');
  const [showPassword, setShowPassword] = useState<boolean>(false); // State to track password visibility
  const router = useRouter();
  const { setEmployeeId } = useEmployeeContext();
  const { setUserName } = useEmployeeContext();
  const handleChange = (event: React.ChangeEvent<{}>, newRole: string) => {
    setRole(newRole as 'employee' | 'manager' | 'hradmin');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emp_id: userid,
          password: password,
          role_id: role === 'employee' ? 3 : role === 'manager' ? 2 : 1,
        }),
      };

      const response = await fetch(`http://localhost:3000/auth/login`, requestOptions);

      if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
      }

      const result = await response.json();

      if (result && result.employee) {
        sessionStorage.setItem('role_id', result.employee.role_id);
        let rolename = '';

        if (role === 'employee') {
          rolename = 'employee';
          router.push("/employee");
        } else if (result.employee.role_id === 2 && role === 'manager') {
          rolename = 'manager';
          router.push("/manager");
        } else if (result.employee.role_id === 1 && role === 'hradmin') {
          rolename = 'admin';
          router.push("/admin");
        }
        console.log(result.employee);
        sessionStorage.setItem('rolename', rolename);
        sessionStorage.setItem('employeeId', result.employee.employee_id);
        setEmployeeId(result.employee.employee_id);
        setUserName(result.employee.first_name);
        console.log(setEmployeeId(result.employee.employee_id));
        onLogin(rolename, result.employee.first_name, result.employee.manager_id, result.employee.employee_id);
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.message.includes('401')) {
        toast.error('Invalid username or password');
      } else if (error.message.includes('403')) {
        toast.error('Role does not match');
      } else if (error.message.includes('404')) {
        toast.error('Employee not found');
      } else {
        toast.error('An error occurred during login');
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider theme={defaultTheme}>
        <Grid container component="main" sx={{ height: '100vh' }}>
          <CssBaseline />
          <Grid
            item
            xs={false}
            sm={4}
            md={7}
            sx={{
              backgroundImage: `url(${loginImage.src})`,
              backgroundRepeat: 'no-repeat',
              backgroundColor: (t) =>
                t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
            <Box
              sx={{
                my: 8,
                mx: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography component="h1" variant="h4" align="center" fontWeight="bold" mt={3}>
                Leave Management System
              </Typography>
              <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Sign in
              </Typography>
              <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="employee-id"
                  label="Employee ID"
                  name="employee-id"
                  placeholder="Enter your employee ID"
                  autoComplete="employee-id"
                  onChange={(e) => setUserId(e.target.value)}
                  autoFocus
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'} // Show password text if showPassword is true
                  id="password"
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{ // Add input properties for password visibility toggle
                    endAdornment: (
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
                <Tabs
                  value={role}
                  onChange={handleChange}
                  indicatorColor="primary"
                  textColor="primary"
                  centered
                  sx={{ mt: 2 }}
                >
                  <Tab label="Employee" value="employee" />
                  <Tab label="Manager" value="manager" />
                  <Tab label="Hradmin" value="hradmin" />
                </Tabs>
                <Button className="login-btn" type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                  Sign In
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
        <div>
          <ToastContainer
            theme="colored"
            position="top-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default Login;
