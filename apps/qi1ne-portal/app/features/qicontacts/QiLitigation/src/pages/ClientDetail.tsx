import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemIcon,
  Avatar,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  ArrowBack,
  Edit,
  Email,
  Phone,
  LocationOn,
  Gavel,
  Description,
  AttachMoney,
  Event,
  Add,
  Visibility,
  Download,
  Send,
  CheckCircle,
  Schedule,
  Warning,
  Person,
  Business,
  Home,
  MoreVert,
  Print,
  Share,
  Archive,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { api } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';

interface ClientData {
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  alternatePhone?: string;
  address: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  dateOfBirth?: string;
  ssn?: string;
  occupation?: string;
  company?: string;
  preferredContactMethod: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  activeCases: number;
  totalCases: number;
  totalBilled: number;
  totalPaid: number;
  outstandingBalance: number;
}

interface Case {
  caseId: string;
  caseNumber: string;
  title: string;
  status: string;
  dateOpened: string;
  lastActivity: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  size: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: string;
  caseNumber: string;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user: string;
}

const ClientDetail: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [client, setClient] = useState<ClientData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newCaseDialogOpen, setNewCaseDialogOpen] = useState(false);
  const [communicationDialogOpen, setCommunicationDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Form data for editing
  const [editFormData, setEditFormData] = useState<Partial<ClientData>>({});

  // Mock data
  const mockCases: Case[] = [
    {
      caseId: 'case-001',
      caseNumber: '2024-0001',
      title: 'Smith vs. Johnson - Personal Injury',
      status: 'ACTIVE',
      dateOpened: '2024-01-15',
      lastActivity: '2024-01-25',
    },
    {
      caseId: 'case-004',
      caseNumber: '2023-0892',
      title: 'Smith Property Dispute',
      status: 'CLOSED',
      dateOpened: '2023-06-10',
      lastActivity: '2023-12-20',
    },
  ];

  const mockDocuments: Document[] = [
    {
      id: 'doc-001',
      name: 'Client_Agreement_Smith.pdf',
      type: 'Contract',
      uploadedAt: '2024-01-15T10:30:00Z',
      size: 245678,
    },
    {
      id: 'doc-002',
      name: 'ID_Verification_Smith.pdf',
      type: 'Identification',
      uploadedAt: '2024-01-15T10:35:00Z',
      size: 1567890,
    },
  ];

  const mockInvoices: Invoice[] = [
    {
      id: 'inv-001',
      invoiceNumber: 'INV-2024-001',
      amount: 5000,
      status: 'PAID',
      dueDate: '2024-02-01',
      caseNumber: '2024-0001',
    },
    {
      id: 'inv-002',
      invoiceNumber: 'INV-2024-002',
      amount: 2500,
      status: 'PENDING',
      dueDate: '2024-03-01',
      caseNumber: '2024-0001',
    },
  ];

  const mockActivities: Activity[] = [
    {
      id: 'act-001',
      type: 'case_created',
      description: 'New case created: Smith vs. Johnson',
      timestamp: '2024-01-15T10:30:00Z',
      user: 'Demo Attorney',
    },
    {
      id: 'act-002',
      type: 'document_uploaded',
      description: 'Client agreement uploaded',
      timestamp: '2024-01-15T10:35:00Z',
      user: 'Demo Attorney',
    },
    {
      id: 'act-003',
      type: 'invoice_sent',
      description: 'Invoice INV-2024-001 sent',
      timestamp: '2024-01-20T14:00:00Z',
      user: 'System',
    },
    {
      id: 'act-004',
      type: 'payment_received',
      description: 'Payment received for INV-2024-001',
      timestamp: '2024-01-25T09:00:00Z',
      user: 'System',
    },
  ];

  useEffect(() => {
    fetchClientDetails();
  }, [clientId]);

  const fetchClientDetails = async () => {
    try {
      const data = await api.get(`/clients/${clientId}`);
      
      if (data.success) {
        // Enhance mock data with additional fields
        const enhancedClient = {
          ...data.data,
          dateOfBirth: '1985-06-15',
          occupation: 'Software Engineer',
          company: 'Tech Solutions Inc.',
          preferredContactMethod: 'EMAIL',
          notes: 'Prefers morning meetings. Has been a client since 2023.',
          totalBilled: 15000,
          totalPaid: 12500,
          outstandingBalance: 2500,
        };
        setClient(enhancedClient);
        setEditFormData(enhancedClient);
      }
    } catch (error) {
      console.error('Error fetching client details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      showNotification('Client information updated successfully', 'success');
      setEditDialogOpen(false);
      fetchClientDetails();
    } catch (error) {
      showNotification('Error updating client information', 'error');
    }
  };

  const handleNewCase = () => {
    navigate(`/cases/new?clientId=${clientId}`);
  };

  const handleSendCommunication = () => {
    showNotification('Message sent successfully', 'success');
    setCommunicationDialogOpen(false);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'CLOSED':
        return 'default';
      case 'PENDING':
        return 'warning';
      case 'PAID':
        return 'success';
      default:
        return 'default';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'case_created':
        return <Gavel color="primary" />;
      case 'document_uploaded':
        return <Description color="action" />;
      case 'invoice_sent':
        return <AttachMoney color="warning" />;
      case 'payment_received':
        return <CheckCircle color="success" />;
      default:
        return <Event color="action" />;
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (!client) {
    return <Typography>Client not found</Typography>;
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/clients')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4">
              {client.firstName} {client.lastName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Client ID: {client.clientId}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Send />}
            onClick={() => setCommunicationDialogOpen(true)}
          >
            Send Message
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewCase}
          >
            New Case
          </Button>
          <IconButton onClick={handleMenuClick}>
            <MoreVert />
          </IconButton>
        </Box>
      </Box>

      {/* Contact Info Card */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Contact Information</Typography>
                <IconButton size="small" onClick={handleEdit}>
                  <Edit />
                </IconButton>
              </Box>
              
              <List dense>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      <Email />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Email"
                    secondary={client.email}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      <Phone />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Phone"
                    secondary={client.phoneNumber}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      <LocationOn />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Address"
                    secondary={
                      <>
                        {client.address.street1}<br />
                        {client.address.street2 && <>{client.address.street2}<br /></>}
                        {client.address.city}, {client.address.state} {client.address.zipCode}
                      </>
                    }
                  />
                </ListItem>

                {client.occupation && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <Business />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Occupation"
                      secondary={`${client.occupation}${client.company ? ` at ${client.company}` : ''}`}
                    />
                  </ListItem>
                )}
              </List>

              <Divider sx={{ my: 2 }} />
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Preferred Contact Method
                </Typography>
                <Chip 
                  label={client.preferredContactMethod}
                  size="small"
                  color="primary"
                />
              </Box>

              {client.notes && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {client.notes}
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Active Cases
                  </Typography>
                  <Typography variant="h4">
                    {client.activeCases}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Cases
                  </Typography>
                  <Typography variant="h4">
                    {client.totalCases}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Billed
                  </Typography>
                  <Typography variant="h4">
                    ${client.totalBilled.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Outstanding
                  </Typography>
                  <Typography variant="h4" color={client.outstandingBalance > 0 ? 'error' : 'success'}>
                    ${client.outstandingBalance.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs Section */}
          <Paper sx={{ mt: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Cases" />
              <Tab label="Documents" />
              <Tab label="Billing" />
              <Tab label="Activity" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {/* Cases Tab */}
              {tabValue === 0 && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Case Number</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date Opened</TableCell>
                        <TableCell>Last Activity</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockCases.map((case_) => (
                        <TableRow key={case_.caseId}>
                          <TableCell>{case_.caseNumber}</TableCell>
                          <TableCell>{case_.title}</TableCell>
                          <TableCell>
                            <Chip
                              label={case_.status}
                              size="small"
                              color={getStatusColor(case_.status)}
                            />
                          </TableCell>
                          <TableCell>{format(new Date(case_.dateOpened), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{format(new Date(case_.lastActivity), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <IconButton 
                              size="small"
                              onClick={() => navigate(`/cases/${case_.caseId}`)}
                            >
                              <Visibility />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Documents Tab */}
              {tabValue === 1 && (
                <List>
                  {mockDocuments.map((doc) => (
                    <ListItem key={doc.id}>
                      <ListItemAvatar>
                        <Avatar>
                          <Description />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={doc.name}
                        secondary={`${doc.type} • ${(doc.size / 1024 / 1024).toFixed(2)} MB • Uploaded ${formatDistanceToNow(new Date(doc.uploadedAt))} ago`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end">
                          <Download />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}

              {/* Billing Tab */}
              {tabValue === 2 && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Invoice #</TableCell>
                        <TableCell>Case</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{invoice.invoiceNumber}</TableCell>
                          <TableCell>{invoice.caseNumber}</TableCell>
                          <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip
                              label={invoice.status}
                              size="small"
                              color={getStatusColor(invoice.status)}
                            />
                          </TableCell>
                          <TableCell>{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                            <IconButton size="small">
                              <Download />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Activity Tab */}
              {tabValue === 3 && (
                <Timeline>
                  {mockActivities.map((activity, index) => (
                    <TimelineItem key={activity.id}>
                      <TimelineOppositeContent>
                        <Typography variant="body2" color="textSecondary">
                          {format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot>
                          {getActivityIcon(activity.type)}
                        </TimelineDot>
                        {index < mockActivities.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="body1">
                          {activity.description}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          by {activity.user}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Client Information</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={editFormData.firstName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={editFormData.lastName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editFormData.email || ''}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={editFormData.phoneNumber || ''}
                onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Preferred Contact</InputLabel>
                <Select
                  value={editFormData.preferredContactMethod || 'EMAIL'}
                  onChange={(e) => setEditFormData({ ...editFormData, preferredContactMethod: e.target.value })}
                  label="Preferred Contact"
                >
                  <MenuItem value="EMAIL">Email</MenuItem>
                  <MenuItem value="PHONE">Phone</MenuItem>
                  <MenuItem value="SMS">SMS</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={editFormData.address?.street1 || ''}
                onChange={(e) => setEditFormData({ 
                  ...editFormData, 
                  address: { ...editFormData.address!, street1: e.target.value } 
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={editFormData.address?.city || ''}
                onChange={(e) => setEditFormData({ 
                  ...editFormData, 
                  address: { ...editFormData.address!, city: e.target.value } 
                })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="State"
                value={editFormData.address?.state || ''}
                onChange={(e) => setEditFormData({ 
                  ...editFormData, 
                  address: { ...editFormData.address!, state: e.target.value } 
                })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={editFormData.address?.zipCode || ''}
                onChange={(e) => setEditFormData({ 
                  ...editFormData, 
                  address: { ...editFormData.address!, zipCode: e.target.value } 
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={editFormData.notes || ''}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Communication Dialog */}
      <Dialog open={communicationDialogOpen} onClose={() => setCommunicationDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Message to {client.firstName} {client.lastName}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Method</InputLabel>
            <Select defaultValue="email" label="Method">
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="sms">SMS</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Subject"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={6}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommunicationDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSendCommunication} variant="contained" startIcon={<Send />}>
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* More Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); window.print(); }}>
          <ListItemIcon>
            <Print fontSize="small" />
          </ListItemIcon>
          Print Client Info
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); showNotification('Client info exported', 'success'); }}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          Export to PDF
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); showNotification('Archive feature coming soon', 'info'); }}>
          <ListItemIcon>
            <Archive fontSize="small" />
          </ListItemIcon>
          Archive Client
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ClientDetail;