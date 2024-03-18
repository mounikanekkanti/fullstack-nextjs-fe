// Import necessary modules and types
import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { TextField, Grid } from '@mui/material';
import { getTimeSheetById, getTimeSheetByMId } from '../../api/timesheetService';

// Define styled dialog using styled-component from Material-UI
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

// Define interface for form data
interface FormData {
  empName: string;
  WorkDate: string;
  HoursWorked: string;
  Task: string;
}

// Define props interface
interface TimesheetFormProps {
  userRole: string;
  employeeId: string;
  managerId: string;
}

// Define functional component
const TimesheetForm: React.FC<TimesheetFormProps> = ({ userRole, employeeId, managerId }) => {
  // State variables
  const [timesheetRows, setTimesheetRows] = useState<any[]>([]);
  const [viewTimesheet, setViewTimesheet] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    empName: '',
    WorkDate: '',
    HoursWorked: '',
    Task: '',
  });
  const [mode, setMode] = useState<string>("add");

  // Fetch timesheet data based on user role and ID
  useEffect(() => {
    if (userRole === 'employee') {
      getTimeSheetById(employeeId)
        .then((response) => {
          if (response.status === 200) {
            const processedData = response.data.map((timesheet: any) => ({
              ...timesheet,
              Task: typeof timesheet.Task === 'string' ? JSON.parse(timesheet.Task) : timesheet.Task,
            }));
            setTimesheetRows(processedData);
          }
        })
        .catch((error) => {
          console.error('Failed to fetch timesheets:', error);
        });
    } else if (userRole === 'manager') {
      getTimeSheetByMId(managerId)
        .then((response) => {
          if (response.status === 200) {
            const processedData = response.data.map((timesheet: any) => ({
              ...timesheet,
              Task: typeof timesheet.Task === 'string' ? JSON.parse(timesheet.Task) : timesheet.Task,
            }));
            setTimesheetRows(processedData);
          }
        })
        .catch((error) => {
          console.error('Failed to fetch employee timesheets:', error);
        });
    }
  }, [managerId, userRole]);

  // Event handler for form input change
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Event handler for form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
  };

  // Event handler for opening the dialog
  const handleClickOpen = () => {
    setMode("add");
    setFormData({
      empName: '',
      WorkDate: '',
      HoursWorked: '',
      Task: '',
    });
    setOpen(true);
  };

  // Event handler for closing the dialog
  const handleClose = () => {
    setOpen(false);
  };

  // Event handler for changing tab
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setViewTimesheet(newValue);
  };

  // Define columns for the timesheet table
  const timesheetColumns: GridColDef[] = [
    { field: 'TimesheetID', headerName: 'ID', width: 70 },
    { field: 'employee_id', headerName: 'EmployeeId', width: 110 },
    { field: 'WorkDate', headerName: 'Date', width: 120 },
    { field: 'HoursWorked', headerName: 'Hours Worked', width: 140 },
    {
      field: 'Task',
      headerName: 'Comments',
      width: 350,
      renderCell: (params) => (
        <div style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
          {Array.isArray(params.value) ? (
            params.value.map((task: any, index: number) => (
              <div key={index}>
                <strong>Task Name:</strong> {task.description}, <strong>Hours Worked:</strong> {task['hours worked']}
              </div>
            ))
          ) : (
            <div>
              <strong>Task Name:</strong> {params.value.description}, <strong>Hours Worked:</strong> {params.value['hours worked']}
            </div>
          )}
        </div>
      ),
    },
    userRole === "employee"
    && (
      {
        field: 'actions',
        headerName: 'Actions',
        width: 200,
        renderCell: (params) => (
          <Stack direction="row" spacing={2}>
            <Button variant="contained" size="small" onClick={() => handleEdit(params.row.TimesheetID)}>Edit</Button>
            <Button variant="contained" color="error" size="small" onClick={() => handleCancel(params.row.TimesheetID)}>Delete</Button>
          </Stack>
        ),
      }
    )
  ].filter(Boolean);

  // Format task value for display
  const formatTaskValue = (task: string | any[]) => {
    if (Array.isArray(task)) {
      return task.map((t) => `Task Name: ${t.description}, Hours Worked: ${t['hours worked']}`).join('\n');
    } else if (typeof task === 'object') {
      return `Task Name: ${task.description}, Hours Worked: ${task['hours worked']}`;
    } else {
      return task;
    }
  };

  // Event handler for editing a timesheet entry
  const handleEdit = (id: string) => {
    // Implement logic to fetch timesheet data based on id
    const selectedTimesheet = timesheetRows.find((timesheet) => timesheet.TimesheetID === id);

    // Set the modal into "edit" mode and populate the form data
    setMode("edit");
    setFormData(selectedTimesheet);

    // Open the modal
    setOpen(true);
  };

  // Event handler for canceling a timesheet entry
  const handleCancel = (id: string) => {
    // Implement cancel logic here
    console.log(`Cancel timesheet with ID ${id}`);
  };

  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={viewTimesheet}
          onChange={handleChange}
          textColor="secondary"
          indicatorColor="secondary"
          aria-label="secondary tabs example"
        >
          <Tab label="Timesheet Details" />
        </Tabs>
        {/* Add Timesheet Modal */}
        <React.Fragment>
          {userRole === "employee" && (
            <Button variant="contained" size="small" onClick={handleClickOpen} style={{ position: "absolute", top: "74px", right: "90px" }}>Add Timesheet</Button>
          )}
          <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              {mode === "add" ? "Add Timesheet" : "Update Timesheet"}
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
                      name="empName"
                      label="Employee Name"
                      value={formData.empName}
                      onChange={onChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="WorkDate"
                      label="Date"
                      type="date"
                      value={formData.WorkDate}
                      onChange={onChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="HoursWorked"
                      label="Hours Worked"
                      value={formData.HoursWorked}
                      onChange={onChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="Task"
                      label="Comment"
                      value={formatTaskValue(formData.Task)}
                      onChange={onChange}
                    />
                  </Grid>
                </Grid>
              </form>
            </DialogContent>
            <DialogActions style={{ justifyContent: 'left' }}>
              <Button type="submit" variant="contained" color="primary" onClick={handleClose}>
                {mode === "add" ? "Add Timesheet" : "Update Timesheet"}
              </Button>
            </DialogActions>
          </BootstrapDialog>
        </React.Fragment>
      </Box>

      {viewTimesheet === 0 && (
        <div style={{ minHeight: '400px', width: '100%', maxWidth: '85%', margin: '10px auto 10px' }}>
          {timesheetRows && timesheetRows.length > 0 ? (
            <DataGrid
              columns={timesheetColumns}
              rows={timesheetRows}
              getRowId={(row) => row.TimesheetID}
              pageSize={5}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>No records found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimesheetForm;
