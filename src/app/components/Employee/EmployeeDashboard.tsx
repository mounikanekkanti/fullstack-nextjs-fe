import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { TextField, Grid, Select, MenuItem, FormControl, InputLabel, Tooltip } from '@material-ui/core';
import { applyLeave, getLeavesById, cancelLeave, updateLeave } from '../../api/employeeService';
import { ToastContainer, toast } from 'react-toastify';
import ErrorBoundary from '../../common/ErrorBoundary';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import Link from "next/link"; // Import Link from Next.js
import { useRouter } from "next/router"; // Import useRouter from Next.js
import ExitToAppIcon from "@mui/icons-material/ExitToApp"; // Import the ExitToApp icon

import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

interface EmployeeDashboardProps {
  userRole: string;
  employeeId: string;
  username: string;
}

interface MenuLinkProps {
  href: string;
  children: React.ReactNode;
}

const MenuLink: React.FC<MenuLinkProps> = ({ href, children }) => {
  const router = useRouter();
  const isActive = router.pathname === href;
  return (
    <li className={isActive ? "active" : ""}>
      <Link href={href}>{children}</Link>
    </li>
  );
};


interface LeaveData {
  leave_id: string;
  manager_id: string;
  start_date: string;
  end_date: string;
  no_of_days: string;
  leave_type: string;
  status: string;
  reason: string;
  comment: string;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ userRole, employeeId, username }) => {
  const [managerNames, setManagerNames] = useState<{ [key: string]: string }>({});
  const [managerName, setManagerName] = useState<string>('');

  const [activeCard, setActiveCard] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [open, setOpen] = useState<boolean>(false);
  const [openDelete, setDelete] = useState<boolean>(false);
  const [leaveRows, setLeaveRows] = useState<LeaveData[]>([]);
  const [statusCounts, setStatusCounts] = useState<{
    All: number;
    Pending: number;
    Approved: number;
    Rejected: number;
    Cancelled: number;
  }>({
    All: 0,
    Pending: 0,
    Approved: 0,
    Rejected: 0,
    Cancelled: 0,
  });
  const [formData, setFormData] = useState<LeaveData>({
    leave_id: '',
    start_date: '',
    end_date: '',
    reason: '',
    comment: '',
    leave_type: '',
    no_of_days: '',
    manager_id: '',
    status: '',
  });
  const [mode, setMode] = useState<string>('add');
  const leaveTypeMapping: { [key: string]: number } = {
    "Casual Leave": 1,
    "Sick Leave": 2,
    "Maternity Leave": 3,
    "Personal Leave": 4,
    "Other": 5,
  };

  const [logout, setLogout] = useState(false);
  const router = useRouter();
  const handleLogout = () => {
    setLogout(false);
    router.push("/login");
  };


  // Get call to fetch Manager Name
  useEffect(() => {
    const fetchManagerNames = async () => {
      const managerIds = new Set(leaveRows.map(row => row.manager_id));
      for (const managerId of managerIds) {
        try {
          const response = await axios.get<{ first_name: string; last_name: string }>(`http://localhost:3000/employee/${managerId}`);
          const { first_name, last_name } = response.data;
          const managerName = `${first_name} ${last_name}`;
          console.log(managerName);
          setManagerNames(prevState => ({
            ...prevState,
            [managerId]: managerName,
          }));
        } catch (error) {
          console.error(`Failed to fetch manager name for ID ${managerId}:`, error);
        }
      }
    };
    fetchManagerNames();
  }, [leaveRows]);

  // Get call to Fetch all leaves based on Employee Id
  useEffect(() => {
    getLeavesById(employeeId)
      .then((response) => {
        console.log(employeeId);
        console.log(username);
        console.log(response);
        if (response.status === 200) {
          setLeaveRows(response.data);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch leaves:', error);
      });
  }, [employeeId]);

  useEffect(() => {
    const counts = leaveRows.reduce((acc, row) => {
      acc.All++;
      acc[row.status]++;
      return acc;
    }, { All: 0, Pending: 0, Approved: 0, Rejected: 0, Cancelled: 0 });
    setStatusCounts(counts);
  }, [leaveRows]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  // Populate all leave Data on edit click
  const handleEdit = (id: string) => {
    const selectedLeave = leaveRows.find((leave) => leave.leave_id === id);
    if (selectedLeave) {
      selectedLeave.leave_type = leaveTypeMapping[selectedLeave.leave_type];
      const startDate = selectedLeave.start_date.split('T')[0];
      const endDate = selectedLeave.end_date.split('T')[0];
      setMode("edit");
      setFormData({
        ...selectedLeave,
        start_date: startDate,
        end_date: endDate,
      });
      setOpen(true);
    } else {
      console.error(`Leave with ID ${id} not found`);
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name === 'start_date' || name === 'end_date') {
      const startDate = name === 'start_date' ? new Date(value as string) : new Date(formData.start_date);
      const endDate = name === 'end_date' ? new Date(value as string) : new Date(formData.end_date);
      if (endDate < startDate) {
        console.error('End date cannot be before start date');
        return;
      }
      let totalDays = 0;
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          totalDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      setFormData(prevState => ({
        ...prevState,
        [name as string]: value,
        no_of_days: totalDays,
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name as string]: value
      }));
    }
  };

  const handleClickOpen = async () => {
    setMode("add");
    try {
      const response = await axios.get<{ manager_id: string; first_name: string; last_name: string }>(`http://localhost:3000/employee/${employeeId}`);
      const { manager_id, first_name, last_name } = response.data;

      // Fetch manager details using manager_id
      const managerResponse = await axios.get<{ first_name: string; last_name: string }>(`http://localhost:3000/employee/${manager_id}`);
      const { first_name: managerFirstName, last_name: managerLastName } = managerResponse.data;

      const managerName = `${managerFirstName} ${managerLastName}`;
      setFormData({
        leave_id: '',
        start_date: "",
        end_date: "",
        leave_type: "",
        no_of_days: "",
        reason: "",
        comment: "",
        manager_id: manager_id,
        status: "",
      });
      setManagerName(managerName);
      setOpen(true);
    } catch (error) {
      console.error('Failed to fetch manager name:', error);
      toast.error('Failed to fetch manager name');
    }
  };

  // Apply Leave Post call
  const handleApplyLeave = () => {
    // Check if all required fields are filled out
    const requiredFields = ['start_date', 'end_date', 'leave_type', 'reason'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof LeaveData]);

    if (missingFields.length > 0) {
      // Display an error message or perform any necessary action
      toast.error(`Please fill all the required fields`);
      return;
    }
    const leaveOverlaps = leaveRows.some(leave => {
      if (leave.status === 'Rejected' || leave.status === 'Cancelled') {
        return false;
      }
      const leaveStartDate = new Date(leave.start_date);
      const leaveEndDate = new Date(leave.end_date);
      const newStartDate = new Date(formData.start_date);
      const newEndDate = new Date(formData.end_date);
      const withinExistingLeave = (newStartDate >= leaveStartDate && newStartDate <= leaveEndDate) || (newEndDate >= leaveStartDate && newEndDate <= leaveEndDate);
      const overlapsStartDate = (newStartDate <= leaveStartDate && newEndDate >= leaveStartDate) || (newStartDate <= leaveEndDate && newEndDate >= leaveEndDate);
      return leave.leave_id !== formData.leave_id && (withinExistingLeave || overlapsStartDate);
    });

    if (leaveOverlaps) {
      toast.error('There are existing Pending leaves with the same dates');
      return;
    }

    const newLeave: LeaveData = {
      start_date: formData.start_date,
      end_date: formData.end_date,
      no_of_days: formData.no_of_days,
      leave_type: formData.leave_type,
      status: 'Pending',
      reason: formData.reason,
      manager_id: formData.manager_id,
      leave_id: '',
      comment: '',
    };

    applyLeave(employeeId, newLeave)
      .then(response => {
        const newLeaveRecord = response.data;
        toast.success('Leave Applied successfully');
        return getLeavesById(employeeId);
      })
      .then(response => {
        setLeaveRows(response.data);
        handleClose();
      })
      .catch(error => {
        toast.error('Failed to apply leave');
        console.error('Error applying leave:', error);
      });
  };

  // Update leave put call
  const handleUpdateLeave = () => {
    const leaveIndex = leaveRows.findIndex((leave) => leave.leave_id === formData.leave_id);
    updateLeave(formData.leave_id, formData)
      .then(response => {
        toast.success('Leave updated successfully');
        return getLeavesById(employeeId);
      })
      .then(response => {
        setLeaveRows(response.data);
        handleClose();
      })
      .catch(error => {
        if (error.message.includes('404')) {
          toast.error('Please change any input to update');
        } else {
          toast.error('Failed to update leave');
        }
      });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCardClick = (status: string) => {
    setSelectedStatus(status);
    setActiveCard(status);
  };

  const handleCancel = (id: string) => {
    setDelete(true);
    setFormData({ ...formData, leave_id: id });
  };

  // Cancel Leave put call
  const handleCancelLeave = () => {
    cancelLeave(formData.leave_id, formData.comment)
      .then(response => {
        toast.success('Leave Cancelled successfully');
        return getLeavesById(employeeId);
      })
      .then(response => {
        setLeaveRows(response.data);
      })
      .catch(error => {
        console.error('Error cancelling leave:', error);
        toast.error('Failed to cancel leave');
      });
    setDelete(false);
  };

  const getFilteredLeaveRows = () => {
    if (selectedStatus === 'All') {
      return leaveRows;
    } else {
      return leaveRows.filter((row) => row.status === selectedStatus);
    }
  };

  const [value, setValue] = React.useState<string>('leave');

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setValue(newValue);
  };

  const formatDate = (dateString: string) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Define columns for the leave table
  const leaveColumns: GridColDef[] = [
    { field: 'leave_id', headerName: 'ID', width: 40 },
    { field: 'manager_id', headerName: 'Manager Name', width: 110, valueGetter: (params) => managerNames[params.row.manager_id] || 'Unknown' },
    { field: 'start_date', headerName: 'Start Date', width: 95, valueFormatter: (params) => formatDate(params.value as string) },
    { field: 'end_date', headerName: 'End Date', width: 95, valueFormatter: (params) => formatDate(params.value as string) },
    { field: 'no_of_days', headerName: 'No. of Days', width: 90 },
    {
      field: 'leave_type', headerName: 'Leave Type', width: 120, renderCell: (params) => (
        <span>
          {Object.keys(leaveTypeMapping).find((key) => leaveTypeMapping[key] === params.row.leave_type)}
        </span>
      ),
    },
    { field: 'status', headerName: 'Status', width: 90 },
    { field: 'reason', headerName: 'Reason', width: 100 },
    { field: 'comment', headerName: 'Comment', width: 140 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 90,
      renderCell: (params) => (
        <Stack direction="row" spacing={2} style={{ position: "absolute", right: "35px" }}>
          {params.row.status === 'Pending' && (
            <Tooltip title="Update">
              <ModeEditIcon color="primary" onClick={() => handleEdit(params.row.leave_id as string)} />
            </Tooltip>
          )}
          {(params.row.status === 'Pending' || params.row.status === 'Approved') && new Date(params.row.start_date) > new Date() && (
            <Tooltip title="Cancel">
              <DeleteIcon color="error" onClick={() => handleCancel(params.row.leave_id as string)} />
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <ErrorBoundary>
      <div>
      <header className="bg-gray-800 text-white py-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-lg font-semibold">Employee Portal</h1>
          <nav>
            <ul className="flex space-x-4">
              <MenuLink href="/employee">Dashboard</MenuLink>
              {/* <MenuLink href="/timesheet">Timesheet</MenuLink> */}
            </ul>
          </nav>
          <nav>
            <ul className="flex space-x-4">
              <h1 className="text-lg font-semibold">{username}</h1>
              <li>
                <ExitToAppIcon
                  style={{ cursor: "pointer", fontSize: "1.5rem" }}
                  onClick={() => setLogout(true)}
                />
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <Dialog open={logout} onClose={() => setLogout(false)}>
        <DialogTitle>Logout Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogout(false)}>Cancel</Button>
          <Button onClick={handleLogout} autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
        <header className="bg-white shadow">
          <div className="mx-auto max-w-5xl px-2 py-2 relative">
            <div className="flex">
              <div className={`card leave-count shadow-xl text-center ${activeCard === 'All' ? 'active' : ''}`} onClick={() => handleCardClick('All')} style={{ cursor: 'pointer' }}>
                <div className="count">{statusCounts.All}</div>
                <div className="status">Total Request</div>
              </div>
              <div className={`card leave-count shadow-xl text-center ${activeCard === 'Pending' ? 'active' : ''}`} onClick={() => handleCardClick('Pending')} style={{ cursor: 'pointer' }}>
                <div className="count">{statusCounts.Pending}</div>
                <div className="status">Pending</div>
              </div>
              <div className={`card leave-count shadow-xl text-center ${activeCard === 'Approved' ? 'active' : ''}`} onClick={() => handleCardClick('Approved')} style={{ cursor: 'pointer' }}>
                <div className="count">{statusCounts.Approved}</div>
                <div className="status">Approved</div>
              </div>
              <div className={`card leave-count shadow-xl text-center ${activeCard === 'Rejected' ? 'active' : ''}`} onClick={() => handleCardClick('Rejected')} style={{ cursor: 'pointer' }}>
                <div className="count">{statusCounts.Rejected}</div>
                <div className="status">Rejected</div>
              </div>
              <div className={`card leave-count shadow-xl text-center ${activeCard === 'Cancelled' ? 'active' : ''}`} onClick={() => handleCardClick('Cancelled')} style={{ cursor: 'pointer' }}>
                <div className="count">{statusCounts.Cancelled}</div>
                <div className="status">Cancelled</div>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Panels */}
        <div>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={value}
              onChange={handleChange}
              textColor="secondary"
              indicatorColor="secondary"
              aria-label="secondary tabs example"
            >
              <Tab value="leave" label="Leave Details" />
            </Tabs>
            {/* Add Leave Modal */}
            <React.Fragment>
              <Button className="override-btn" variant="contained" size="small" onClick={handleClickOpen} style={{ position: "absolute", top: "140px", right: "90px" }}>Apply Leave</Button>
              <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
              >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                  {mode === "add" ? "Apply Leave" : "Update Leave"}
                </DialogTitle>
                <IconButton
                  aria-label="close"
                  onClick={handleClose}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <DialogContent dividers>
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="manager_id"
                          label="Manager Name"
                          value={managerName}
                          disabled
                          onChange={onChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="start_date"
                          label="Start Date"
                          type="date"
                          value={formData.start_date}
                          onChange={onChange}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="end_date"
                          label="End Date"
                          type="date"
                          value={formData.end_date}
                          onChange={onChange}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          inputProps={{
                            min: formData.start_date || undefined,
                          }}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="no_of_days"
                          label="Number Of Days"
                          value={formData.no_of_days}
                          onChange={onChange}
                          disabled
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel id="leaveType-label" required>Leave Type</InputLabel>
                          <Select
                            labelId="leaveType-label"
                            id="leaveType"
                            name="leave_type"
                            value={formData.leave_type}
                            onChange={onChange}
                          >
                            <MenuItem value={1}>Casual Leave</MenuItem>
                            <MenuItem value={2}>Sick Leave</MenuItem>
                            <MenuItem value={3}>Maternity Leave</MenuItem>
                            <MenuItem value={4}>Personal Leave</MenuItem>
                            <MenuItem value={5}>Other</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="reason"
                          label="Reason"
                          value={formData.reason}
                          onChange={onChange}
                          required
                        />
                      </Grid>
                    </Grid>
                  </form>
                </DialogContent>
                <DialogActions style={{ justifyContent: 'left' }}>
                  <Button className="override-btn" type="submit" variant="contained" color="primary" onClick={mode === "add" ? handleApplyLeave : handleUpdateLeave}>
                    {mode === "add" ? "Apply Leave" : "Update Leave"} </Button>
                </DialogActions>
              </BootstrapDialog>
            </React.Fragment>
            <Dialog open={openDelete} onClose={() => setDelete(false)}>
              <DialogTitle>Cancel Leave Confirmation</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to Cancel?
                </DialogContentText>
                <TextField
                  className='mt-4'
                  fullWidth
                  id="standard-textarea"
                  name="comment"
                  label="Comment"
                  multiline
                  variant="standard"
                  value={formData.comment}
                  onChange={onChange}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDelete(false)}>Cancel</Button>
                <Button onClick={handleCancelLeave}>OK</Button> {/* Call handleCancelLeave */}
              </DialogActions>
            </Dialog>
          </Box>

          <div>
            {/* ToastContainer for displaying notifications */}
            <ToastContainer theme="colored" position="top-right" autoClose={10000} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnFocusLoss draggable pauseOnHover />
          </div>

          {/* Leave Table */}
          <div style={{ minHeight: '400px', width: '100%', maxWidth: '85%', margin: '10px auto 10px' }}>
            {getFilteredLeaveRows().length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>No records found</div>
            ) : (<DataGrid
              rows={value === 'leave' ? getFilteredLeaveRows() : []}
              columns={leaveColumns}
              getRowId={(row) => row.leave_id}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              pageSizeOptions={[5, 10]}
            />
            )}
          </div>
          </div>
        </div>
    </ErrorBoundary>
  );
};

export default EmployeeDashboard;
