import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Grid,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  PersonAdd,
  Lock,
  CheckCircle,
  Block,
  Email,
  Phone,
  AdminPanelSettings,
  Gavel,
  Description,
  AccountBalance,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getConfig } from '../utils/config';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'master' | 'admin' | 'partner' | 'attorney' | 'paralegal';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLogin: string;
  createdAt: string;
}

const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'attorney' as User['role'],
    status: 'ACTIVE' as User['status'],
  });

  // Get available roles based on current user's role
  const getAvailableRoles = (): User['role'][] => {
    switch (currentUser?.role) {
      case 'master':
        return ['admin', 'partner', 'attorney', 'paralegal'];
      case 'admin':
        return ['partner', 'attorney', 'paralegal'];
      case 'partner':
        return ['attorney', 'paralegal'];
      default:
        return [];
    }
  };

  // Check if current user can manage a specific user
  const canManageUser = (targetUser: User): boolean => {
    if (!currentUser) return false;
    if (targetUser.userId === currentUser.userId) return false; // Can't manage self
    
    switch (currentUser.role) {
      case 'master':
        return true; // Master can manage everyone
      case 'admin':
        return targetUser.role !== 'master'; // Admin can manage everyone except master
      case 'partner':
        return targetUser.role === 'attorney' || targetUser.role === 'paralegal';
      default:
        return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const config = getConfig();
      const tokensStr = localStorage.getItem('demoTokens');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (tokensStr) {
        const tokens = JSON.parse(tokensStr);
        headers['Authorization'] = `Bearer ${tokens.accessToken}`;
      }
      
      const response = await fetch(`${config.apiEndpoint}/users`, { headers });
      const data = await response.json();
      if (data.success) {
        // Filter users based on current user's role
        let filteredUsers = data.data;
        if (currentUser?.role === 'partner') {
          // Partners only see attorneys and paralegals
          filteredUsers = data.data.filter((u: User) => 
            u.role === 'attorney' || u.role === 'paralegal'
          );
        }
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    } else {
      setEditingUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'attorney',
        status: 'ACTIVE',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleSaveUser = async () => {
    if (editingUser) {
      showNotification('User updated successfully', 'success');
    } else {
      showNotification('User created successfully', 'success');
    }
    handleCloseDialog();
    fetchUsers();
  };

  const handleDeleteUser = (userId: string) => {
    showNotification('User deleted successfully', 'success');
    fetchUsers();
  };

  const handleResetPassword = (userId: string) => {
    showNotification('Password reset email sent', 'success');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'master':
        return 'error';
      case 'admin':
        return 'error';
      case 'partner':
        return 'warning';
      case 'attorney':
        return 'primary';
      case 'paralegal':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'warning';
      case 'SUSPENDED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'master':
        return <AdminPanelSettings />;
      case 'admin':
        return <AdminPanelSettings />;
      case 'partner':
        return <AccountBalance />;
      case 'attorney':
        return <Gavel />;
      case 'paralegal':
        return <Description />;
      default:
        return <PersonAdd />;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">User Management</Typography>
        {(currentUser?.role === 'admin' || currentUser?.role === 'partner' || currentUser?.role === 'master') && (
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => handleOpenDialog()}
          >
            Add User
          </Button>
        )}
      </Box>

      {!(currentUser?.role === 'admin' || currentUser?.role === 'partner' || currentUser?.role === 'master') && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You need administrator privileges to manage users.
        </Alert>
      )}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {user.firstName[0]}{user.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {user.userId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email fontSize="small" color="action" />
                      {user.email}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getRoleIcon(user.role)}
                      label={user.role}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={getStatusColor(user.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.lastLogin
                      ? format(new Date(user.lastLogin), 'MMM dd, yyyy HH:mm')
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell align="right">
                    {canManageUser(user) && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(user)}
                          title="Edit User"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleResetPassword(user.userId)}
                          title="Reset Password"
                        >
                          <Lock />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteUser(user.userId)}
                          title="Delete User"
                        >
                          <Delete />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                  label="Role"
                >
                  {getAvailableRoles().map((role) => (
                    <MenuItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as User['status'] })}
                  label="Status"
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                  <MenuItem value="SUSPENDED">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          {!editingUser && (
            <Alert severity="info" sx={{ mt: 2 }}>
              A temporary password will be sent to the user's email address.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained">
            {editingUser ? 'Update' : 'Create'} User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;