import React, { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
} from "@material-ui/core";
import ErrorBoundary from "../../common/ErrorBoundary";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import Stack from "@mui/material/Stack";
import { getLeavesByMId, approveRejectLeave } from "../../api/managerService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Link from "next/link"; // Import Link from Next.js
import { useRouter } from "next/router"; // Import useRouter from Next.js
import ExitToAppIcon from "@mui/icons-material/ExitToApp"; // Import the ExitToApp icon

interface ManagerDashboardProps {
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

interface LeaveRow {
  leave_id: string;
  employee: {
    emp_id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  start_date: string;
  end_date: string;
  no_of_days: number;
  leave_type: string;
  status: string;
  comment: string;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  employeeId,
  username,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [activeCard, setActiveCard] = useState<string>("All");
  const [leaveRows, setLeaveRows] = useState<LeaveRow[]>([]);
  const [value, setValue] = useState<string>("leave");
  const [openApprove, setApprove] = useState<boolean>(false);
  const [openReject, setReject] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    leave_id: string;
    comment: string;
  }>({
    leave_id: "",
    comment: "",
  });

  const [logout, setLogout] = useState(false);
  const router = useRouter();
  const handleLogout = () => {
    setLogout(false);
    router.push("/login");
  };

  useEffect(() => {
    getLeavesByMId(employeeId)
      .then((response) => {
        if (response.status === 200) {
          console.log("Leaves:", response.data);
          setLeaveRows(response.data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch leaves:", error);
      });
  }, []);

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

  useEffect(() => {
    const counts = leaveRows.reduce(
      (acc, row) => {
        acc.All++;
        acc[row.status]++;
        return acc;
      },
      { All: 0, Pending: 0, Approved: 0, Rejected: 0, Cancelled: 0 }
    );

    setStatusCounts(counts);
  }, [leaveRows]);

  const handleCardClick = (status: string) => {
    setSelectedStatus(status);
    setActiveCard(status);
  };

  const handleCancel = (id: string) => {
    formData.comment = "";
    setApprove(true);
    setFormData({ ...formData, leave_id: id });
  };

  const handleApprove = () => {
    setApprove(true);
    approveRejectLeave(
      employeeId,
      formData.leave_id,
      "Approved",
      formData.comment
    )
      .then((response) => {
        toast.success("Leave Approved successfully");
        return getLeavesByMId(employeeId);
      })
      .then((response) => {
        setLeaveRows(response.data);
      })
      .catch((error) => {
        console.error("Error Approved leave:", error);
        toast.error("Failed to cancel leave");
      });
    setApprove(false);
  };

  const handleRejectLeave = (id: string) => {
    formData.comment = "";
    setReject(true);
    setFormData({ ...formData, leave_id: id });
  };

  const handleReject = (leaveId: string) => {
    const comment = "Leave request Rejected";
    approveRejectLeave(
      employeeId,
      formData.leave_id,
      "Rejected",
      formData.comment
    )
      .then((response) => {
        toast.success("Leave Rejected successfully");
        return getLeavesByMId(employeeId);
      })
      .then((response) => {
        setLeaveRows(response.data);
      })
      .catch((error) => {
        console.error("Error Rejected leave:", error);
        toast.error("Failed to Rejected leave");
      });
    setReject(false);
  };

  const getFilteredLeaveRows = () => {
    if (selectedStatus === "All") {
      return leaveRows;
    } else if (selectedStatus === "Pending") {
      return leaveRows.filter((row) => row.status === "Pending");
    } else {
      return leaveRows.filter((row) => row.status === selectedStatus);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const leaveColumns: GridColDef[] = [
    { field: "leave_id", headerName: "LeaveId", width: 70 },
    {
      field: "employee.emp_id",
      headerName: "EmployeeId",
      width: 100,
      valueGetter: (params) => `${params.row.employee?.emp_id || ""}`,
    },
    {
      field: "employee.username",
      headerName: "EmployeeName",
      width: 130,
      valueGetter: (params) =>
        `${params.row.employee?.first_name || ""} ${
          params.row.employee?.last_name || ""
        }`,
    },
    {
      field: "start_date",
      headerName: "Start Date",
      width: 100,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: "end_date",
      headerName: "End Date",
      width: 100,
      valueFormatter: (params) => formatDate(params.value),
    },
    { field: "no_of_days", headerName: "No. of Days", width: 80 },
    {
      field: "leave_type",
      headerName: "Leave Type",
      width: 120,
      renderCell: (params) => (
        <span>
          {Object.keys(leaveTypeMapping).find(
            (key) => leaveTypeMapping[key] === params.row.leave_type
          )}
        </span>
      ),
    },
    { field: "status", headerName: "Status", width: 90 },
    { field: "comment", headerName: "Comment", width: 100 },
    {
      field: "actions",
      headerName: "Actions",
      width: 90,
      renderCell: (params) => (
        <div>
          {params.row.status === "Pending" && (
            <Stack direction="row" spacing={2}>
              <Tooltip title="Approve">
                <CheckIcon
                  color="success"
                  onClick={() => handleCancel(params.row.leave_id)}
                />
              </Tooltip>
              <Tooltip title="Reject">
                <CloseIcon
                  color="error"
                  onClick={() => handleRejectLeave(params.row.leave_id)}
                />
              </Tooltip>
            </Stack>
          )}
        </div>
      ),
    },
  ];

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setValue(newValue);
  };

  const formatDate = (dateString: string) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const leaveTypeMapping = {
    "Casual Leave": 1,
    "Sick Leave": 2,
    "Maternity Leave": 3,
    "Personal Leave": 4,
    Other: 5,
  };

  return (
    <ErrorBoundary>
      <div>
        <header className="bg-gray-800 text-white py-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-lg font-semibold">Manager Portal</h1>
            <nav>
              <ul className="flex space-x-4">
                <MenuLink href="/manager">Dashboard</MenuLink>
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
              <div
                className={`card leave-count shadow-xl text-center ${
                  activeCard === "All" ? "active" : ""
                }`}
                onClick={() => handleCardClick("All")}
                style={{ cursor: "pointer" }}
              >
                <div className="count">{statusCounts.All}</div>
                <div className="status">Total Request</div>
              </div>
              <div
                className={`card leave-count shadow-xl text-center ${
                  activeCard === "Pending" ? "active" : ""
                }`}
                onClick={() => handleCardClick("Pending")}
                style={{ cursor: "pointer" }}
              >
                <div className="count">{statusCounts.Pending}</div>
                <div className="status">Pending</div>
              </div>
              <div
                className={`card leave-count shadow-xl text-center ${
                  activeCard === "Approved" ? "active" : ""
                }`}
                onClick={() => handleCardClick("Approved")}
                style={{ cursor: "pointer" }}
              >
                <div className="count">{statusCounts.Approved}</div>
                <div className="status">Approved</div>
              </div>
              <div
                className={`card leave-count shadow-xl text-center ${
                  activeCard === "Rejected" ? "active" : ""
                }`}
                onClick={() => handleCardClick("Rejected")}
                style={{ cursor: "pointer" }}
              >
                <div className="count">{statusCounts.Rejected}</div>
                <div className="status">Rejected</div>
              </div>
              <div
                className={`card leave-count shadow-xl text-center ${
                  activeCard === "Cancelled" ? "active" : ""
                }`}
                onClick={() => handleCardClick("Cancelled")}
                style={{ cursor: "pointer" }}
              >
                <div className="count">{statusCounts.Cancelled}</div>
                <div className="status">Cancelled</div>
              </div>
            </div>
          </div>
        </header>
        <div>
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
        <Dialog open={openApprove} onClose={() => setApprove(false)}>
          <DialogTitle>Approval Confirmation</DialogTitle>
          <DialogContent>
            <TextField
              className="mt-4"
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
            <Button onClick={() => setApprove(false)}>Cancel</Button>
            <Button onClick={handleApprove}>Approve</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={openReject} onClose={() => setReject(false)}>
          <DialogTitle>Reject Confirmation</DialogTitle>
          <DialogContent>
            <TextField
              className="mt-4"
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
            <Button onClick={() => setReject(false)}>Cancel</Button>
            <Button onClick={handleReject}>Reject</Button>
          </DialogActions>
        </Dialog>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="secondary"
            indicatorColor="secondary"
            aria-label="secondary tabs example"
          >
            <Tab value="leave" label="Leave Details" />
          </Tabs>
        </Box>
        <div>
          {value === "leave" && (
            <div
              style={{
                minHeight: "400px",
                width: "100%",
                maxWidth: "85%",
                margin: "10px auto 10px",
              }}
            >
              {value === "leave" && getFilteredLeaveRows().length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  No records found
                </div>
              ) : (
                <DataGrid
                  rows={value === "leave" ? getFilteredLeaveRows() : []}
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
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ManagerDashboard;
