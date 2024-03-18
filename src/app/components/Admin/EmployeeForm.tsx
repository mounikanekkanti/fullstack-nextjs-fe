import React, { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";
import {
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
} from "@material-ui/core";
import {
  updateEmployee,
  getAllEmployee,
  addEmployee,
  deleteEmployee,
  getManagerList,
} from "../../api/adminService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  emailValidationConfig,
  phoneValidationConfig,
  validateEmail,
  validatePhone,
} from "../../common/validationConfig";
import Link from "next/link"; // Import Link from Next.js
import { useRouter } from "next/router"; // Import useRouter from Next.js
import ExitToAppIcon from "@mui/icons-material/ExitToApp"; // Import the ExitToApp icon
import ErrorBoundary from "../../common/ErrorBoundary";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

interface EmployeeFormProps {
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

const EmployeeForm: React.FC<EmployeeFormProps> = ({userRole,employeeId,username}) => {
  const [activeCard, setActiveCard] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [open, setOpen] = useState<boolean>(false);
  const [openDelete, setDelete] = useState<boolean>(false);
  const [employeeRows, setEmployeeRows] = useState<any[]>([]);
  const [managerList, setManagerList] = useState<any[]>([]);
  const [statusCounts, setStatusCounts] = useState<any>({
    All: 0,
    Pending: 0,
    Approved: 0,
    Rejected: 0,
    Cancelled: 0,
  });
  const [formData, setFormData] = useState<any>({
    first_name: "",
    last_name: "",
    email: "",
    manager_id: "",
    emp_id: "",
    phone_number: "",
    role_id: "",
    country_code: "+91",
  });
  const [mode, setMode] = useState<string>("add");
  const [roleOptions, setRoleOptions] = useState<
    { value: string; label: string }[]
  >([
    { value: "1", label: "Admin" },
    { value: "2", label: "Manager" },
    { value: "3", label: "Employee" },
  ]);
  const [logout, setLogout] = useState(false);
  const router = useRouter();
  const handleLogout = () => {
    setLogout(false);
    router.push("/login");
  };

  useEffect(() => {
    getAllEmployee()
      .then((response) => {
        if (response.status === 200) {
          setEmployeeRows(response.data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch Employees:", error);
      });
  }, []);

  useEffect(() => {
    getManagerList()
      .then((response) => {
        if (response.status === 200) {
          setManagerList(response.data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch Managers:", error);
      });
  }, []);

  const handleChangeRole = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFormData((prevState: any) => ({
      ...prevState,
      role_id: event.target.value as string,
    }));
  };

  const handleCountryCodeChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const countryCode = event.target.value as string;
    setFormData((prevState) => ({
      ...prevState,
      country_code: countryCode,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleEdit = (id: string) => {
    const selectedEmployee = employeeRows.find(
      (employee) => employee.emp_id === id
    );
    const selectedManager = managerList.find(
      (manager) => manager.manager_id === selectedEmployee.manager_id
    );
    setMode("edit");
    setFormData((prevState: any) => ({
      ...prevState,
      emp_id: selectedEmployee.emp_id,
      first_name: selectedEmployee.first_name,
      last_name: selectedEmployee.last_name,
      email: selectedEmployee.email,
      password: selectedEmployee.password,
      manager_id: selectedEmployee.manager_id,
      manager_name: selectedManager ? selectedManager.manager_name : "",
      phone_number: selectedEmployee.phone_number,
      role_id: selectedEmployee.role_id,
    }));
    setOpen(true);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleChangeManager = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setFormData((prevState: any) => ({
      ...prevState,
      manager_id: event.target.value as string,
    }));
  };

  const handleClickOpen = () => {
    setMode("add");
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      manager_id: "",
      emp_id: "",
      phone_number: "",
      password: "",
      country_code: "+91",
    });
    setOpen(true);
  };

  const handleApplyEmployee = () => {
    const isValidEmail = validateEmail(formData.email);
    const isValidPhone = validatePhone(formData.phone_number);

    if (!isValidEmail) {
      toast.error(emailValidationConfig.message);
      return;
    }

    if (!isValidPhone) {
      toast.error(phoneValidationConfig.message);
      return;
    }

    const requiredFields = [
      "emp_id",
      "first_name",
      "last_name",
      "email",
      "password",
      "manager_id",
      "role_id",
      "phone_number",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      toast.error(`Please fill all the required fields`);
      return;
    }

    const newEmployee = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      manager_id: parseInt(formData.manager_id, 10),
      emp_id: formData.emp_id,
      phone_number: formData.country_code + formData.phone_number,
      role_id: parseInt(formData.role_id, 10),
    };

    addEmployee(newEmployee)
      .then((response) => {
        toast.success("Employee Added successfully");
        return getAllEmployee();
      })
      .then((response) => {
        setEmployeeRows(response.data);
        handleClose();
      })
      .catch((error) => {
        if (error.message.includes("400")) {
          toast.error("Employee ID already exists");
        } else {
          toast.error("Error Adding employee:", error);
        }
      });
  };

  const handleUpdateEmployee = () => {
    const employeeIndex = employeeRows.findIndex(
      (employee) => employee.emp_id === formData.emp_id
    );
    const isValidEmail = validateEmail(formData.email);
    const isValidPhone = validatePhone(formData.phone_number);

    if (!isValidEmail) {
      toast.error(emailValidationConfig.message);
      return;
    }

    if (!isValidPhone) {
      toast.error(phoneValidationConfig.message);
      return;
    }

    const requiredFields = [
      "emp_id",
      "first_name",
      "last_name",
      "email",
      "password",
      "manager_id",
      "role_id",
      "phone_number",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      toast.error(`Please fill all the required fields`);
      return;
    }
    updateEmployee(formData.emp_id, formData)
      .then((response) => {
        toast.success("Employee updated successfully");
        return getAllEmployee();
      })
      .then((response) => {
        setEmployeeRows(response.data);
        handleClose();
      })
      .catch((error) => {
        if (error.message.includes("404")) {
          toast.error("Please change any input to update");
        } else {
          toast.error("Error updating employee:", error);
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
    setFormData({ ...formData, emp_id: id });
  };

  const handleDelete = () => {
    deleteEmployee(formData.emp_id)
      .then((response) => {
        toast.success("Employee Delete successfully");
        return getAllEmployee();
      })
      .then((response) => {
        setEmployeeRows(response.data);
      })
      .catch((error) => {
        console.error("Error Delete Employee:", error);
        toast.error("Failed to Delete Employee");
      });
    setDelete(false);
  };

  const getFilteredEmployeeRows = () => {
    if (selectedStatus === "All") {
      return employeeRows;
    } else {
      return employeeRows.filter((row) => row.status === selectedStatus);
    }
  };

  const [value, setValue] = useState<string>("employee");

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setValue(newValue);
  };

  const formatDate = (dateString: string) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const columns: GridColDef[] = [
    { field: "emp_id", headerName: "Employee Id", width: 100 },
    { field: "first_name", headerName: "First Name", width: 140 },
    { field: "last_name", headerName: "Last Name", width: 140 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "manager_name", headerName: "Manager Name", width: 150 },
    { field: "phone_number", headerName: "Phone", width: 140 },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <Stack direction="row" spacing={2}>
          <Tooltip title="Update">
            <ModeEditIcon
              color="primary"
              onClick={() => handleEdit(params.row.emp_id)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <DeleteIcon
              color="error"
              onClick={() => handleCancel(params.row.emp_id)}
            />
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <ErrorBoundary>
      <div>
        <header className="bg-gray-800 text-white py-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-lg font-semibold">Admin Portal</h1>
            <nav>
              <ul className="flex space-x-4">
                <MenuLink href="/admin">Employee</MenuLink>
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
        {/* Tab Panels */}
        <div>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              textColor="secondary"
              indicatorColor="secondary"
              aria-label="secondary tabs example"
            >
              <Tab value="employee" label="Employee Details" />
            </Tabs>
            {/* Add Employee Modal */}
            <React.Fragment>
              <Button
                className="override-btn"
                variant="contained"
                size="small"
                onClick={handleClickOpen}
                style={{ position: "absolute", top: "70px", right: "90px" }}
              >
                Add Employee
              </Button>

              <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
              >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                  {mode === "add" ? "Add Employee" : "Update Employee"}
                </DialogTitle>
                <IconButton
                  aria-label="close"
                  onClick={handleClose}
                  sx={{
                    position: "absolute",
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
                          name="emp_id"
                          label="Employee ID"
                          value={formData.emp_id}
                          onChange={onChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="first_name"
                          label="First Name"
                          value={formData.first_name}
                          onChange={onChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="last_name"
                          label="Last Name"
                          value={formData.last_name}
                          onChange={onChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="email"
                          label="Email"
                          value={formData.email}
                          onChange={onChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="password"
                          label="Password"
                          value={formData.password}
                          onChange={onChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel id="manager-label" required>
                            Manager Name
                          </InputLabel>
                          <Select
                            labelId="manager-label"
                            id="manager_id"
                            name="manager_id"
                            value={formData.manager_id}
                            onChange={handleChangeManager}
                          >
                            {managerList.map((manager) => (
                              <MenuItem
                                key={manager.manager_id}
                                value={manager.manager_id}
                              >
                                {manager.manager_name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel id="role-id-label" required>
                            Role
                          </InputLabel>
                          <Select
                            labelId="role-id-label"
                            id="role-id"
                            name="role_id"
                            value={formData.role_id}
                            onChange={handleChangeRole}
                          >
                            {roleOptions.map((role) => (
                              <MenuItem key={role.value} value={role.value}>
                                {role.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid
                        container
                        spacing={2}
                        alignItems="center"
                        style={{ padding: "10px" }}
                      >
                        <Grid item xs={4}>
                          <FormControl fullWidth>
                            <InputLabel id="country-code-label">
                              Country Code
                            </InputLabel>
                            <Select
                              labelId="country-code-label"
                              name="country_code"
                              value={formData.country_code}
                              onChange={handleCountryCodeChange}
                            >
                              <MenuItem value="+91">India (+91)</MenuItem>
                              <MenuItem value="+1">USA (+1)</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={8}>
                          <TextField
                            fullWidth
                            name="phone_number"
                            label="Phone"
                            value={formData.phone_number}
                            onChange={onChange}
                            required
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </form>
                </DialogContent>
                <DialogActions style={{ justifyContent: "left" }}>
                  <Button
                    className="override-btn"
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={
                      mode === "add"
                        ? handleApplyEmployee
                        : handleUpdateEmployee
                    }
                  >
                    {mode === "add" ? "Add Employee" : "Update Employee"}
                  </Button>
                </DialogActions>
              </BootstrapDialog>
            </React.Fragment>
            <Dialog open={openDelete} onClose={() => setDelete(false)}>
              <DialogTitle>Employee Delete Confirmation</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to Delete?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDelete(false)}>Cancel</Button>
                <Button onClick={handleDelete}>OK</Button>{" "}
                {/* Call handleDeleteEmployee */}
              </DialogActions>
            </Dialog>
          </Box>

          <div>
            {/* ToastContainer for displaying notifications */}
            <ToastContainer
              theme="colored"
              position="top-right"
              autoClose={10000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>

          {/* Employee Table */}
          <div
            style={{
              minHeight: "400px",
              width: "100%",
              maxWidth: "85%",
              margin: "10px auto 10px",
            }}
          >
            {getFilteredEmployeeRows().length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                No records found
              </div>
            ) : (
              <DataGrid
                rows={employeeRows}
                columns={columns}
                getRowId={(row) => row.emp_id}
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

export default EmployeeForm;
