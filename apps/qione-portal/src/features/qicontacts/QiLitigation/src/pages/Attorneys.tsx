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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  InputAdornment,
  Alert,
  TablePagination,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Email,
  Phone,
  AccountBalance,
  Gavel,
  School,
  WorkHistory,
  Badge,
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import { api } from '../utils/api';

interface Attorney {
  attorneyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  barNumber: string;
  states: string[];
  practiceAreas: string[];
  education: string;
  yearAdmitted: number;
  role: 'Partner' | 'Associate' | 'Of Counsel' | 'Contract';
  status: 'Active' | 'Inactive';
  activeCases: number;
  totalCases: number;
  billableRate: number;
  bio?: string;
}

const Attorneys: React.FC = () => {
  const { showNotification } = useNotification();
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAttorney, setSelectedAttorney] = useState<Attorney | null>(null);
  const [formData, setFormData] = useState<Partial<Attorney>>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    barNumber: '',
    states: [],
    practiceAreas: [],
    education: '',
    yearAdmitted: new Date().getFullYear(),
    role: 'Associate',
    status: 'Active',
    billableRate: 250,
    bio: '',
  });

  const statesList = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
    'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia',
    'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'Federal'
  ];

  const practiceAreasList = [
    'Corporate Law', 'Criminal Defense', 'Family Law', 'Personal Injury',
    'Real Estate', 'Employment Law', 'Immigration', 'Intellectual Property',
    'Bankruptcy', 'Tax Law', 'Estate Planning', 'Environmental Law',
    'Healthcare Law', 'Securities Law', 'Maritime Law', 'Civil Rights'
  ];

  useEffect(() => {
    fetchAttorneys();
  }, []);

  const fetchAttorneys = async () => {
    setLoading(true);
    try {
      const data = await api.get('/attorneys');
      if (data.success) {
        setAttorneys(data.data);
      }
    } catch (error) {
      console.error('Error fetching attorneys:', error);
      showNotification('Error loading attorneys', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (attorney?: Attorney) => {
    if (attorney) {
      setSelectedAttorney(attorney);
      setFormData({
        ...attorney,
      });
    } else {
      setSelectedAttorney(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        barNumber: '',
        states: [],
        practiceAreas: [],
        education: '',
        yearAdmitted: new Date().getFullYear(),
        role: 'Associate',
        status: 'Active',
        billableRate: 250,
        bio: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAttorney(null);
  };

  const handleSave = async () => {
    try {
      const data = selectedAttorney
        ? await api.put(`/attorneys/${selectedAttorney.attorneyId}`, formData)
        : await api.post('/attorneys', formData);
      
      if (data.success) {
        showNotification(
          selectedAttorney ? 'Attorney updated successfully' : 'Attorney added successfully',
          'success'
        );
        fetchAttorneys();
        handleCloseDialog();
      } else {
        showNotification(data.error || 'Error saving attorney', 'error');
      }
    } catch (error) {
      console.error('Error saving attorney:', error);
      showNotification('Error saving attorney', 'error');
    }
  };

  const handleDelete = async (attorneyId: string) => {
    if (!window.confirm('Are you sure you want to delete this attorney?')) {
      return;
    }

    try {
      const data = await api.delete(`/attorneys/${attorneyId}`);
      
      if (data.success) {
        showNotification('Attorney deleted successfully', 'success');
        fetchAttorneys();
      } else {
        showNotification(data.error || 'Error deleting attorney', 'error');
      }
    } catch (error) {
      console.error('Error deleting attorney:', error);
      showNotification('Error deleting attorney', 'error');
    }
  };

  const filteredAttorneys = attorneys.filter(attorney => {
    const searchLower = searchQuery.toLowerCase();
    return (
      attorney.firstName.toLowerCase().includes(searchLower) ||
      attorney.lastName.toLowerCase().includes(searchLower) ||
      attorney.email.toLowerCase().includes(searchLower) ||
      attorney.barNumber.toLowerCase().includes(searchLower) ||
      attorney.practiceAreas.some(area => area.toLowerCase().includes(searchLower))
    );
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Partner': return 'primary';
      case 'Associate': return 'secondary';
      case 'Of Counsel': return 'info';
      case 'Contract': return 'warning';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'success' : 'default';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Attorneys
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Attorney
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search attorneys by name, email, bar number, or practice area..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Attorney</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Bar Number</TableCell>
                <TableCell>Practice Areas</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Cases</TableCell>
                <TableCell align="center">Rate</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Loading attorneys...
                  </TableCell>
                </TableRow>
              ) : filteredAttorneys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No attorneys found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAttorneys
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((attorney) => (
                    <TableRow key={attorney.attorneyId} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {attorney.firstName[0]}{attorney.lastName[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {attorney.firstName} {attorney.lastName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Admitted {attorney.yearAdmitted}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Email fontSize="small" color="action" />
                            <Typography variant="body2">{attorney.email}</Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Phone fontSize="small" color="action" />
                            <Typography variant="body2">{attorney.phoneNumber}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{attorney.barNumber}</Typography>
                        <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                          {attorney.states.slice(0, 2).map((state) => (
                            <Chip
                              key={state}
                              label={state}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {attorney.states.length > 2 && (
                            <Chip
                              label={`+${attorney.states.length - 2} more`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5} flexWrap="wrap">
                          {attorney.practiceAreas.slice(0, 2).map((area) => (
                            <Chip
                              key={area}
                              label={area}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                          {attorney.practiceAreas.length > 2 && (
                            <Chip
                              label={`+${attorney.practiceAreas.length - 2} more`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={attorney.role}
                          size="small"
                          color={getRoleColor(attorney.role)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={attorney.status}
                          size="small"
                          color={getStatusColor(attorney.status)}
                          variant={attorney.status === 'Active' ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {attorney.activeCases}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Active / {attorney.totalCases} Total
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="medium">
                          ${attorney.billableRate}/hr
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(attorney)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(attorney.attorneyId)}
                            disabled={attorney.activeCases > 0}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAttorneys.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Add/Edit Attorney Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedAttorney ? 'Edit Attorney' : 'Add New Attorney'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bar Number"
                value={formData.barNumber}
                onChange={(e) => setFormData({ ...formData, barNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year Admitted"
                type="number"
                value={formData.yearAdmitted}
                onChange={(e) => setFormData({ ...formData, yearAdmitted: parseInt(e.target.value) })}
                inputProps={{ min: 1900, max: new Date().getFullYear() }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Admitted States</InputLabel>
                <Select
                  multiple
                  value={formData.states || []}
                  onChange={(e) => setFormData({ ...formData, states: e.target.value as string[] })}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {statesList.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Practice Areas</InputLabel>
                <Select
                  multiple
                  value={formData.practiceAreas || []}
                  onChange={(e) => setFormData({ ...formData, practiceAreas: e.target.value as string[] })}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {practiceAreasList.map((area) => (
                    <MenuItem key={area} value={area}>
                      {area}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Education"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                placeholder="e.g., Harvard Law School, J.D., 2010"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Attorney['role'] })}
                >
                  <MenuItem value="Partner">Partner</MenuItem>
                  <MenuItem value="Associate">Associate</MenuItem>
                  <MenuItem value="Of Counsel">Of Counsel</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Attorney['status'] })}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Billable Rate ($/hr)"
                type="number"
                value={formData.billableRate}
                onChange={(e) => setFormData({ ...formData, billableRate: parseFloat(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                multiline
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief professional biography..."
              />
            </Grid>
          </Grid>

          {selectedAttorney && selectedAttorney.activeCases > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This attorney currently has {selectedAttorney.activeCases} active cases. 
              Deactivating or deleting this attorney will require reassigning those cases.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.barNumber}
          >
            {selectedAttorney ? 'Save Changes' : 'Add Attorney'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Attorneys;