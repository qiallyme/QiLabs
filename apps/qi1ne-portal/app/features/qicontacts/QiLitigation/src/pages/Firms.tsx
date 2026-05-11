import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Business,
  LocationOn,
  Phone,
  Email,
  People,
  Gavel,
  Assignment,
  TrendingUp,
  Settings,
  Description,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { api } from '../utils/api';

interface Firm {
  firmId: string;
  firmName: string;
  firmInfo: {
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
    founded: string;
    practiceAreas: string[];
    size: string;
  };
  statistics: {
    totalCases: number;
    activeCases: number;
    totalClients: number;
    activeClients: number;
    totalUsers: number;
    attorneys: number;
    partners: number;
    paralegals: number;
    totalBilledAmount: number;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Firms: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  console.log('Current selectedFirm state:', selectedFirm?.firmId, selectedFirm?.firmName);
  const [activeTab, setActiveTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [usersDialogOpen, setUsersDialogOpen] = useState(false);
  const [firmUsers, setFirmUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    firmName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    size: '',
    practiceAreas: [] as string[],
  });

  useEffect(() => {
    fetchFirms();
  }, []);

  // Clear users when selected firm changes
  useEffect(() => {
    setFirmUsers([]);
  }, [selectedFirm?.firmId]);

  // Log when dialog opens
  useEffect(() => {
    if (usersDialogOpen && selectedFirm) {
      console.log('User Management Dialog opened for:', selectedFirm.firmName, '(', selectedFirm.firmId, ')');
    }
  }, [usersDialogOpen, selectedFirm]);

  const fetchFirms = async () => {
    try {
      const data = await api.get('/firms');
      console.log('Fetched firms data:', data);
      console.log('Firms data type:', typeof data.data);
      console.log('Firms data is array:', Array.isArray(data.data));
      console.log('First firm:', data.data?.[0]);
      
      if (data.success && data.data) {
        console.log('Setting firms from API:', data.data);
        console.log('Firms details:', data.data.map((f: any) => ({ id: f.firmId, name: f.firmName })));
        setFirms(data.data);
        
        // Check if we should select a firm based on localStorage
        const savedUserStr = localStorage.getItem('demoUser');
        let savedSelectedFirmId: string | null = null;
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          savedSelectedFirmId = savedUser.selectedFirmId || null;
        }
        console.log('Saved selectedFirmId from localStorage:', savedSelectedFirmId);
        
        if (savedSelectedFirmId) {
          const firmToSelect = data.data.find((f: any) => f.firmId === savedSelectedFirmId);
          if (firmToSelect) {
            console.log('Setting selectedFirm from localStorage:', firmToSelect.firmId, firmToSelect.firmName);
            setSelectedFirm(firmToSelect);
          } else if (data.data.length > 0) {
            setSelectedFirm(data.data[0]);
          }
        } else if (data.data.length > 0 && !selectedFirm) {
          setSelectedFirm(data.data[0]);
        }
      } else {
        console.error('Firms API error:', data.error);
        // If error due to permissions, still load mock data
        throw new Error(data.error?.message || 'Failed to fetch firms');
      }
    } catch (error) {
      console.error('Error fetching firms:', error);
      console.log('Loading mock data due to API error');
      console.log('API endpoint used:', '/firms');
      console.log('User role:', user?.role);
      console.log('User data:', user);
      // Load mock data for demo
      const mockFirms: Firm[] = [
        {
          firmId: 'firm-001',
          firmName: 'Davidson & Associates',
          firmInfo: {
            address: '100 Market Street, Suite 2000',
            city: 'San Francisco',
            state: 'CA',
            zip: '94105',
            phone: '(415) 555-0100',
            email: 'info@davidsonlaw.com',
            founded: '1985',
            practiceAreas: ['Personal Injury', 'Estate Planning', 'Corporate Law', 'Real Estate'],
            size: 'Medium (25-50 attorneys)'
          },
          statistics: {
            totalCases: 5,
            activeCases: 4,
            totalClients: 5,
            activeClients: 5,
            totalUsers: 8,
            attorneys: 3,
            partners: 2,
            paralegals: 2,
            totalBilledAmount: 79500
          }
        },
        {
          firmId: 'firm-002',
          firmName: 'Smith Legal Partners',
          firmInfo: {
            address: '500 SW 5th Avenue, Suite 1500',
            city: 'Portland',
            state: 'OR',
            zip: '97204',
            phone: '(503) 555-0200',
            email: 'contact@smithlegal.com',
            founded: '1990',
            practiceAreas: ['Civil Rights', 'Intellectual Property', 'Employment Law', 'Immigration'],
            size: 'Small (10-25 attorneys)'
          },
          statistics: {
            totalCases: 4,
            activeCases: 4,
            totalClients: 4,
            activeClients: 4,
            totalUsers: 8,
            attorneys: 3,
            partners: 2,
            paralegals: 2,
            totalBilledAmount: 63000
          }
        },
        {
          firmId: 'firm-003',
          firmName: 'Wilson & Chen Law Group',
          firmInfo: {
            address: '2000 Sand Hill Road, Suite 300',
            city: 'Palo Alto',
            state: 'CA',
            zip: '94301',
            phone: '(650) 555-0300',
            email: 'info@wilsonchen.com',
            founded: '2008',
            practiceAreas: ['Corporate Law', 'M&A', 'Securities', 'Venture Capital', 'Tax Law'],
            size: 'Large (50+ attorneys)'
          },
          statistics: {
            totalCases: 6,
            activeCases: 5,
            totalClients: 6,
            activeClients: 6,
            totalUsers: 10,
            attorneys: 3,
            partners: 3,
            paralegals: 3,
            totalBilledAmount: 1243000
          }
        }
      ];
      setFirms(mockFirms);
      setSelectedFirm(mockFirms[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditFirm = (firm: Firm) => {
    setFormData({
      firmName: firm.firmName,
      address: firm.firmInfo.address,
      city: firm.firmInfo.city,
      state: firm.firmInfo.state,
      zip: firm.firmInfo.zip,
      phone: firm.firmInfo.phone,
      email: firm.firmInfo.email,
      size: firm.firmInfo.size,
      practiceAreas: firm.firmInfo.practiceAreas || [],
    });
    setEditDialogOpen(true);
  };

  const handleSaveFirm = async () => {
    try {
      if (!selectedFirm) return;
      
      const data = await api.put(`/firms/${selectedFirm.firmId}`, formData);
      
      if (data.success) {
        showNotification('Firm information updated successfully', 'success');
        setEditDialogOpen(false);
        // Refresh firms
        await fetchFirms();
      } else {
        throw new Error(data.error?.message || 'Failed to update firm');
      }
    } catch (error) {
      console.error('Error updating firm:', error);
      showNotification('Failed to update firm information', 'error');
    }
  };

  const handleAddFirm = () => {
    setFormData({
      firmName: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      email: '',
      size: 'Small (2-10 attorneys)',
      practiceAreas: [],
    });
    setAddDialogOpen(true);
  };

  const handleCreateFirm = async () => {
    try {
      const data = await api.post('/firms', formData);
      
      if (data.success) {
        showNotification('New firm created successfully', 'success');
        setAddDialogOpen(false);
        // Refresh firms list
        await fetchFirms();
        // Select the new firm
        if (data.data) {
          setSelectedFirm(data.data);
        }
      } else {
        throw new Error(data.error?.message || 'Failed to create firm');
      }
    } catch (error) {
      console.error('Error creating firm:', error);
      showNotification('Failed to create new firm', 'error');
    }
  };

  const handleOpenSettings = () => {
    if (!selectedFirm) return;
    setFormData({
      firmName: selectedFirm.firmName,
      address: selectedFirm.firmInfo.address,
      city: selectedFirm.firmInfo.city,
      state: selectedFirm.firmInfo.state,
      zip: selectedFirm.firmInfo.zip,
      phone: selectedFirm.firmInfo.phone,
      email: selectedFirm.firmInfo.email,
      size: selectedFirm.firmInfo.size,
      practiceAreas: selectedFirm.firmInfo.practiceAreas || [],
    });
    setSettingsDialogOpen(true);
  };

  const handleOpenUserManagement = async () => {
    if (!selectedFirm) return;
    
    console.log('Opening user management for firm:', selectedFirm.firmId, selectedFirm.firmName);
    console.log('Full selected firm data:', selectedFirm);
    
    try {
      // Clear previous users first
      setFirmUsers([]);
      
      const data = await api.get(`/firm-users/${selectedFirm.firmId}?t=${Date.now()}`);
      console.log('Fetched users for', selectedFirm.firmId, ':', data);
      
      if (data.success) {
        setFirmUsers(data.data);
        setUsersDialogOpen(true);
      } else {
        console.error('Failed to fetch users:', data);
        showNotification('Failed to load firm users', 'error');
      }
    } catch (error) {
      console.error('Error fetching firm users:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      showNotification('Failed to load firm users', 'error');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Check loading state first
  if (loading) {
    return <LinearProgress />;
  }

  // Then check permissions
  if (user?.role !== 'master') {
    return (
      <Box>
        <Alert severity="error">
          You do not have permission to access this page. Only master accounts can manage firms.
          <br />
          Current role: {user?.role || 'Not logged in'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Firm Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddFirm}
        >
          Add New Firm
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Firms List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Law Firms
              </Typography>
              <List>
                {firms.map((firm) => (
                  <ListItem
                    key={firm.firmId}
                    button
                    selected={selectedFirm?.firmId === firm.firmId}
                    onClick={() => {
                      console.log('Firm clicked:', firm.firmName, firm.firmId);
                      setSelectedFirm(firm);
                      
                      // Save to localStorage to persist selection
                      const savedUserStr = localStorage.getItem('demoUser');
                      if (savedUserStr) {
                        const savedUser = JSON.parse(savedUserStr);
                        savedUser.selectedFirmId = firm.firmId;
                        localStorage.setItem('demoUser', JSON.stringify(savedUser));
                        console.log('Updated user selectedFirmId in localStorage:', firm.firmId);
                      }
                      
                      // Close any open dialogs when switching firms
                      setEditDialogOpen(false);
                      setSettingsDialogOpen(false);
                      setUsersDialogOpen(false);
                      setAddDialogOpen(false);
                    }}
                  >
                    <ListItemText
                      primary={firm.firmName}
                      secondary={`${firm.firmInfo.city}, ${firm.firmInfo.state} • ${firm.statistics.totalUsers} users`}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={`${firm.statistics.activeCases} active`}
                        size="small"
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Firm Details */}
        <Grid item xs={12} md={8}>
          {selectedFirm && (
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h5">{selectedFirm.firmName}</Typography>
                  <IconButton onClick={() => handleEditFirm(selectedFirm)}>
                    <Edit />
                  </IconButton>
                </Box>

                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                  <Tab label="Overview" />
                  <Tab label="Statistics" />
                  <Tab label="Practice Areas" />
                  <Tab label="Settings" />
                </Tabs>

                <TabPanel value={activeTab} index={0}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box mb={2}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="subtitle1">Address</Typography>
                        </Box>
                        <Typography variant="body2">
                          {selectedFirm.firmInfo.address}<br />
                          {selectedFirm.firmInfo.city}, {selectedFirm.firmInfo.state} {selectedFirm.firmInfo.zip}
                        </Typography>
                      </Box>

                      <Box mb={2}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="subtitle1">Phone</Typography>
                        </Box>
                        <Typography variant="body2">
                          {selectedFirm.firmInfo.phone}
                        </Typography>
                      </Box>

                      <Box mb={2}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Email sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="subtitle1">Email</Typography>
                        </Box>
                        <Typography variant="body2">
                          {selectedFirm.firmInfo.email}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box mb={2}>
                        <Typography variant="subtitle1" gutterBottom>
                          Firm Size
                        </Typography>
                        <Typography variant="body2">
                          {selectedFirm.firmInfo.size}
                        </Typography>
                      </Box>

                      <Box mb={2}>
                        <Typography variant="subtitle1" gutterBottom>
                          Founded
                        </Typography>
                        <Typography variant="body2">
                          {selectedFirm.firmInfo.founded}
                        </Typography>
                      </Box>

                      <Box mb={2}>
                        <Typography variant="subtitle1" gutterBottom>
                          Total Billed (YTD)
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {formatCurrency(selectedFirm.statistics.totalBilledAmount)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                  <Grid container spacing={3}>
                    <Grid item xs={6} md={3}>
                      <Box textAlign="center">
                        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mx: 'auto', mb: 1 }}>
                          <Gavel />
                        </Avatar>
                        <Typography variant="h4">{selectedFirm.statistics.totalCases}</Typography>
                        <Typography variant="body2" color="textSecondary">Total Cases</Typography>
                        <Typography variant="caption" color="primary">
                          {selectedFirm.statistics.activeCases} active
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box textAlign="center">
                        <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56, mx: 'auto', mb: 1 }}>
                          <People />
                        </Avatar>
                        <Typography variant="h4">{selectedFirm.statistics.totalClients}</Typography>
                        <Typography variant="body2" color="textSecondary">Total Clients</Typography>
                        <Typography variant="caption" color="success.main">
                          {selectedFirm.statistics.activeClients} active
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box textAlign="center">
                        <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56, mx: 'auto', mb: 1 }}>
                          <People />
                        </Avatar>
                        <Typography variant="h4">{selectedFirm.statistics.totalUsers}</Typography>
                        <Typography variant="body2" color="textSecondary">Total Staff</Typography>
                        <Typography variant="caption">
                          {selectedFirm.statistics.attorneys} attorneys
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box textAlign="center">
                        <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56, mx: 'auto', mb: 1 }}>
                          <TrendingUp />
                        </Avatar>
                        <Typography variant="h4">
                          {formatCurrency(selectedFirm.statistics.totalBilledAmount)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Revenue (YTD)</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" gutterBottom>Staff Breakdown</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box p={2} bgcolor="background.paper" borderRadius={1}>
                        <Typography variant="h5">{selectedFirm.statistics.partners}</Typography>
                        <Typography variant="body2" color="textSecondary">Partners</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box p={2} bgcolor="background.paper" borderRadius={1}>
                        <Typography variant="h5">{selectedFirm.statistics.attorneys}</Typography>
                        <Typography variant="body2" color="textSecondary">Attorneys</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box p={2} bgcolor="background.paper" borderRadius={1}>
                        <Typography variant="h5">{selectedFirm.statistics.paralegals}</Typography>
                        <Typography variant="body2" color="textSecondary">Paralegals</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                  <Typography variant="h6" gutterBottom>Practice Areas</Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedFirm.firmInfo.practiceAreas.map((area) => (
                      <Chip
                        key={area}
                        label={area}
                        color="primary"
                        variant="outlined"
                        icon={<Description />}
                      />
                    ))}
                  </Box>
                </TabPanel>

                <TabPanel value={activeTab} index={3}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        startIcon={<Settings />}
                        fullWidth
                        onClick={handleOpenSettings}
                      >
                        Firm Settings
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        startIcon={<People />}
                        fullWidth
                        onClick={handleOpenUserManagement}
                      >
                        Manage Users
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        fullWidth
                        onClick={() => showNotification('Cannot delete firm in demo mode', 'warning')}
                      >
                        Delete Firm
                      </Button>
                    </Grid>
                  </Grid>
                </TabPanel>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Edit Firm Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Firm Information</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Firm Name"
                value={formData.firmName}
                onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="ZIP"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Firm Size</InputLabel>
                <Select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  label="Firm Size"
                >
                  <MenuItem value="Solo">Solo Practice</MenuItem>
                  <MenuItem value="Small (2-10 attorneys)">Small (2-10 attorneys)</MenuItem>
                  <MenuItem value="Small (10-25 attorneys)">Small (10-25 attorneys)</MenuItem>
                  <MenuItem value="Medium (25-50 attorneys)">Medium (25-50 attorneys)</MenuItem>
                  <MenuItem value="Large (50+ attorneys)">Large (50+ attorneys)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveFirm} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Add Firm Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Law Firm</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Firm Name"
                value={formData.firmName}
                onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                inputProps={{ maxLength: 2 }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="ZIP"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 000-0000"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Firm Size</InputLabel>
                <Select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  label="Firm Size"
                >
                  <MenuItem value="Solo">Solo Practice</MenuItem>
                  <MenuItem value="Small (2-10 attorneys)">Small (2-10 attorneys)</MenuItem>
                  <MenuItem value="Small (10-25 attorneys)">Small (10-25 attorneys)</MenuItem>
                  <MenuItem value="Medium (25-50 attorneys)">Medium (25-50 attorneys)</MenuItem>
                  <MenuItem value="Large (50+ attorneys)">Large (50+ attorneys)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Practice Areas
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {['Corporate Law', 'Personal Injury', 'Estate Planning', 'Real Estate', 
                  'Criminal Defense', 'Family Law', 'Immigration', 'Intellectual Property',
                  'Employment Law', 'Tax Law', 'Bankruptcy', 'Civil Rights'].map((area) => (
                  <Chip
                    key={area}
                    label={area}
                    onClick={() => {
                      const currentAreas = formData.practiceAreas || [];
                      if (currentAreas.includes(area)) {
                        setFormData({
                          ...formData,
                          practiceAreas: currentAreas.filter(a => a !== area)
                        });
                      } else {
                        setFormData({
                          ...formData,
                          practiceAreas: [...currentAreas, area]
                        });
                      }
                    }}
                    color={formData.practiceAreas?.includes(area) ? 'primary' : 'default'}
                    variant={formData.practiceAreas?.includes(area) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateFirm} 
            variant="contained"
            disabled={!formData.firmName}
          >
            Create Firm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Firm Settings Dialog */}
      <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Firm Settings - {selectedFirm?.firmName}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Update your firm's basic information and practice areas.
          </Alert>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Firm Name"
                value={formData.firmName}
                onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="ZIP"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Firm Size</InputLabel>
                <Select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  label="Firm Size"
                >
                  <MenuItem value="Solo">Solo Practice</MenuItem>
                  <MenuItem value="Small (2-10 attorneys)">Small (2-10 attorneys)</MenuItem>
                  <MenuItem value="Small (10-25 attorneys)">Small (10-25 attorneys)</MenuItem>
                  <MenuItem value="Medium (25-50 attorneys)">Medium (25-50 attorneys)</MenuItem>
                  <MenuItem value="Large (50+ attorneys)">Large (50+ attorneys)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Practice Areas
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {['Corporate Law', 'Personal Injury', 'Estate Planning', 'Real Estate', 
                  'Criminal Defense', 'Family Law', 'Immigration', 'Intellectual Property',
                  'Employment Law', 'Tax Law', 'Bankruptcy', 'Civil Rights'].map((area) => (
                  <Chip
                    key={area}
                    label={area}
                    onClick={() => {
                      const currentAreas = formData.practiceAreas || [];
                      if (currentAreas.includes(area)) {
                        setFormData({
                          ...formData,
                          practiceAreas: currentAreas.filter(a => a !== area)
                        });
                      } else {
                        setFormData({
                          ...formData,
                          practiceAreas: [...currentAreas, area]
                        });
                      }
                    }}
                    color={formData.practiceAreas?.includes(area) ? 'primary' : 'default'}
                    variant={formData.practiceAreas?.includes(area) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveFirm} variant="contained">Save Settings</Button>
        </DialogActions>
      </Dialog>

      {/* User Management Dialog */}
      <Dialog 
        key={selectedFirm?.firmId} 
        open={usersDialogOpen} 
        onClose={() => setUsersDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          User Management - {selectedFirm?.firmName} ({selectedFirm?.firmId})
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Manage users and their roles within your firm.
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={() => showNotification('Add user feature would be implemented here', 'info')}
            >
              Add User
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {firmUsers.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </Avatar>
                        {user.firstName} {user.lastName}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        size="small" 
                        color={user.role === 'partner' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{user.department || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.status || 'ACTIVE'}
                        size="small"
                        color={user.status === 'ACTIVE' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small"
                        onClick={() => showNotification('Edit user feature would be implemented here', 'info')}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => showNotification('Cannot delete users in demo mode', 'warning')}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {firmUsers.length === 0 && (
            <Box py={4} textAlign="center">
              <Typography color="textSecondary">
                No users found for this firm.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUsersDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Firms;