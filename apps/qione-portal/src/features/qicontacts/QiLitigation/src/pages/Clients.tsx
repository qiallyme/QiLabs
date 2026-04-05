import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Avatar,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Visibility,
  PersonAdd,
  CheckCircle,
  Warning,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';

interface Client {
  clientId: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  address?: {
    street1: string;
    city: string;
    state: string;
    zipCode: string;
  } | string;
  clientType?: 'Individual' | 'Corporate';
  status?: string;
  createdAt: string;
  activeCases?: number;
  totalCases?: number;
}

const Clients: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [conflictCheckDialog, setConflictCheckDialog] = useState(false);
  const [conflictCheckData, setConflictCheckData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    ssn: '',
  });
  const [conflictResults, setConflictResults] = useState<any[]>([]);
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: {
      street1: '',
      street2: '',
      city: '',
      state: '',
      zipCode: '',
    },
    preferredContactMethod: 'EMAIL',
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await api.get('/clients');
      if (data.success && data.data) {
        // Add mock case counts
        const clientsWithCounts = (data.data || []).map((client: Client) => ({
          ...client,
          activeCases: Math.floor(Math.random() * 5) + 1,
          totalCases: Math.floor(Math.random() * 10) + 5,
        }));
        setClients(clientsWithCounts);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      showNotification('Error loading clients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConflictCheck = async () => {
    setCheckingConflicts(true);
    // Simulate conflict check
    setTimeout(() => {
      const hasConflict = Math.random() > 0.7; // 30% chance of conflict
      if (hasConflict) {
        setConflictResults([
          {
            type: 'Existing Client',
            name: 'John Smith (Different)',
            caseNumber: '2023-0456',
            conflictType: 'Name similarity',
            severity: 'Low',
          },
          {
            type: 'Opposing Party',
            name: 'Smith Industries',
            caseNumber: '2023-0789',
            conflictType: 'Business relationship',
            severity: 'High',
          },
        ]);
      } else {
        setConflictResults([]);
      }
      setCheckingConflicts(false);
    }, 2000);
  };

  const handleAddClient = async () => {
    try {
      const data = await api.post('/clients', newClient);
      if (data.success) {
        setOpenDialog(false);
        showNotification('Client added successfully', 'success');
        await fetchClients(); // Refresh the list
      } else {
        showNotification(data.error?.message || 'Failed to add client', 'error');
      }
    } catch (error) {
      showNotification('Error adding client', 'error');
    }
    // Reset form
    setNewClient({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: {
        street1: '',
        street2: '',
        city: '',
        state: '',
        zipCode: '',
      },
      preferredContactMethod: 'EMAIL',
    });
  };

  const filteredClients = clients.filter(client => {
    const clientName = client.firstName && client.lastName 
      ? `${client.firstName} ${client.lastName}`
      : client.companyName || '';
    return clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const activeClients = filteredClients.filter(c => (c.activeCases || 0) > 0);
  const inactiveClients = filteredClients.filter(c => (c.activeCases || 0) === 0);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Clients</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Warning />}
            onClick={() => setConflictCheckDialog(true)}
            sx={{ mr: 2 }}
          >
            Conflict Check
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => setOpenDialog(true)}
          >
            New Client
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search clients by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`All Clients (${filteredClients.length})`} />
          <Tab label={`Active (${activeClients.length})`} />
          <Tab label={`Inactive (${inactiveClients.length})`} />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Client Name</TableCell>
                <TableCell>Contact Information</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Active Cases</TableCell>
                <TableCell>Total Cases</TableCell>
                <TableCell>Client Since</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                (tabValue === 0 ? filteredClients : tabValue === 1 ? activeClients : inactiveClients)
                  .map((client) => (
                    <TableRow key={client.clientId} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2 }}>
                            {client.firstName && client.lastName 
                              ? `${client.firstName[0]}${client.lastName[0]}`
                              : client.companyName ? client.companyName[0] : '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {client.firstName && client.lastName 
                                ? `${client.firstName} ${client.lastName}`
                                : client.companyName || 'Unknown'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Email fontSize="small" color="action" />
                          <Typography variant="body2">{client.email}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                          <Phone fontSize="small" color="action" />
                          <Typography variant="body2">{client.phoneNumber || client.phone || 'N/A'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2">
                            {typeof client.address === 'string' 
                              ? client.address 
                              : client.address 
                                ? `${client.address.city}, ${client.address.state}`
                                : 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={client.activeCases || 0}
                          size="small"
                          color={(client.activeCases || 0) > 0 ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{client.totalCases || 0}</TableCell>
                      <TableCell>{new Date(client.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/clients/${client.clientId}`)}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton size="small">
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Client Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Client</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={newClient.firstName}
                onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={newClient.lastName}
                onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={newClient.phoneNumber}
                onChange={(e) => setNewClient({ ...newClient, phoneNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={newClient.address.street1}
                onChange={(e) => setNewClient({
                  ...newClient,
                  address: { ...newClient.address, street1: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={newClient.address.city}
                onChange={(e) => setNewClient({
                  ...newClient,
                  address: { ...newClient.address, city: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="State"
                value={newClient.address.state}
                onChange={(e) => setNewClient({
                  ...newClient,
                  address: { ...newClient.address, state: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={newClient.address.zipCode}
                onChange={(e) => setNewClient({
                  ...newClient,
                  address: { ...newClient.address, zipCode: e.target.value }
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddClient} variant="contained">Add Client</Button>
        </DialogActions>
      </Dialog>

      {/* Conflict Check Dialog */}
      <Dialog open={conflictCheckDialog} onClose={() => setConflictCheckDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Conflict Check</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            Check for potential conflicts of interest before adding a new client.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={conflictCheckData.firstName}
                onChange={(e) => setConflictCheckData({ ...conflictCheckData, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={conflictCheckData.lastName}
                onChange={(e) => setConflictCheckData({ ...conflictCheckData, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={conflictCheckData.dateOfBirth}
                onChange={(e) => setConflictCheckData({ ...conflictCheckData, dateOfBirth: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SSN (Last 4)"
                inputProps={{ maxLength: 4 }}
                value={conflictCheckData.ssn}
                onChange={(e) => setConflictCheckData({ ...conflictCheckData, ssn: e.target.value })}
              />
            </Grid>
          </Grid>

          {checkingConflicts && (
            <Box display="flex" justifyContent="center" mt={3}>
              <CircularProgress />
            </Box>
          )}

          {conflictResults.length > 0 && (
            <Box mt={3}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Potential conflicts found! Review carefully before proceeding.
              </Alert>
              {conflictResults.map((conflict, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle1">{conflict.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {conflict.type} • Case {conflict.caseNumber}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Conflict: {conflict.conflictType}
                      </Typography>
                    </Box>
                    <Chip
                      label={conflict.severity}
                      color={conflict.severity === 'High' ? 'error' : 'warning'}
                      size="small"
                    />
                  </Box>
                </Paper>
              ))}
            </Box>
          )}

          {!checkingConflicts && conflictResults.length === 0 && conflictCheckData.firstName && (
            <Alert severity="success" sx={{ mt: 3 }}>
              <Box display="flex" alignItems="center">
                <CheckCircle sx={{ mr: 1 }} />
                No conflicts found. Safe to proceed with new client.
              </Box>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConflictCheckDialog(false)}>Close</Button>
          <Button onClick={handleConflictCheck} variant="contained" disabled={checkingConflicts}>
            Check for Conflicts
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Clients;