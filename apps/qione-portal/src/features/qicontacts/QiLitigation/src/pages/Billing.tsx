import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Receipt,
  Timer,
  AttachMoney,
  TrendingUp,
  Payment,
  Description,
  Add,
  Edit,
  Delete,
  Download,
  Email,
  Print,
  CheckCircle,
  Schedule,
  Warning,
  PlayArrow,
  Pause,
  Stop,
  CalendarToday,
  Person,
  Gavel,
  Assignment,
  PictureAsPdf,
  Send,
  History,
} from '@mui/icons-material';
import { format, formatDistanceToNow, parseISO, differenceInMinutes } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getConfig } from '../utils/config';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

interface TimeEntry {
  id: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in minutes
  description: string;
  caseId: string;
  caseName: string;
  clientId: string;
  clientName: string;
  billable: boolean;
  rate: number;
  amount?: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'INVOICED';
  createdBy: string;
  category: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientId: string;
  clientName: string;
  caseId?: string;
  caseName?: string;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'OVERDUE' | 'PARTIAL';
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  lineItems: InvoiceLineItem[];
  notes?: string;
}

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  timeEntryIds?: string[];
}

interface BillingStats {
  totalBilled: number;
  totalCollected: number;
  outstanding: number;
  thisMonthBilled: number;
  averageCollectionTime: number;
  billableHours: number;
  nonBillableHours: number;
  realization: number;
}

const Billing: React.FC = () => {
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [openTimeDialog, setOpenTimeDialog] = useState(false);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [selectedTimeEntry, setSelectedTimeEntry] = useState<TimeEntry | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [timerDuration, setTimerDuration] = useState(0);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [filterCase, setFilterCase] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [cases, setCases] = useState<any[]>([]);
  const [newTimeEntry, setNewTimeEntry] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: format(new Date(), 'HH:mm'),
    endTime: '',
    description: '',
    caseId: '',
    billable: true,
    rate: 300,
    category: 'Legal Research',
  });

  useEffect(() => {
    fetchBillingData();
    // Update timer every minute if active
    const interval = setInterval(() => {
      if (activeTimer) {
        const start = parseISO(`${activeTimer.date}T${activeTimer.startTime}`);
        setTimerDuration(differenceInMinutes(new Date(), start));
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      
      // Fetch all billing data in parallel
      const [timeEntriesRes, invoicesRes, statsRes, casesRes] = await Promise.all([
        api.get('/billing/time-entries'),
        api.get('/billing/invoices'),
        api.get('/billing/stats'),
        api.get('/cases')
      ]);

      if (timeEntriesRes.success) {
        setTimeEntries(timeEntriesRes.data);
      }
      
      if (invoicesRes.success) {
        setInvoices(invoicesRes.data);
      }
      
      if (statsRes.success) {
        setStats(statsRes.data);
      }
      
      if (casesRes.success) {
        setCases(casesRes.data.data || []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      showNotification('Error loading billing data', 'error');
      setLoading(false);
    }
  };

  const handleStartTimer = () => {
    const newTimer: TimeEntry = {
      id: Date.now().toString(),
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: format(new Date(), 'HH:mm'),
      description: '',
      caseId: '',
      caseName: '',
      clientId: '',
      clientName: '',
      billable: true,
      rate: 300,
      status: 'DRAFT',
      createdBy: user?.firstName + ' ' + user?.lastName || 'Current User',
      category: 'Legal Research',
    };
    setActiveTimer(newTimer);
    setTimerDuration(0);
    showNotification('Timer started', 'success');
  };

  const handleStopTimer = () => {
    if (activeTimer) {
      const endTime = format(new Date(), 'HH:mm');
      const start = parseISO(`${activeTimer.date}T${activeTimer.startTime}`);
      const end = parseISO(`${activeTimer.date}T${endTime}`);
      const duration = differenceInMinutes(end, start);
      
      const completedEntry: TimeEntry = {
        ...activeTimer,
        endTime,
        duration,
        amount: activeTimer.billable ? (duration / 60) * activeTimer.rate : 0,
      };
      
      setTimeEntries([completedEntry, ...timeEntries]);
      setActiveTimer(null);
      setTimerDuration(0);
      setSelectedTimeEntry(completedEntry);
      setOpenTimeDialog(true);
      showNotification('Timer stopped. Please complete the time entry details.', 'info');
    }
  };

  const handleSaveTimeEntry = async () => {
    try {
      if (selectedTimeEntry) {
        // Update existing entry
        const res = await api.put(`/billing/time-entries/${selectedTimeEntry.id}`, selectedTimeEntry);
        if (res.success) {
          setTimeEntries(timeEntries.map(entry =>
            entry.id === selectedTimeEntry.id ? res.data : entry
          ));
          showNotification('Time entry updated', 'success');
        }
      } else {
        // Create new entry
        const duration = newTimeEntry.endTime
          ? differenceInMinutes(
              parseISO(`${newTimeEntry.date}T${newTimeEntry.endTime}`),
              parseISO(`${newTimeEntry.date}T${newTimeEntry.startTime}`)
            )
          : 0;
        
        const entryData = {
          ...newTimeEntry,
          duration,
          amount: newTimeEntry.billable ? (duration / 60) * newTimeEntry.rate : 0,
          status: 'DRAFT',
          // Add case and client info
          caseName: cases.find(c => c.caseId === newTimeEntry.caseId)?.title || '',
          clientId: cases.find(c => c.caseId === newTimeEntry.caseId)?.clientId || '',
          clientName: cases.find(c => c.caseId === newTimeEntry.caseId)?.clientName || '',
        };
        
        const res = await api.post('/billing/time-entries', entryData);
        if (res.success) {
          setTimeEntries([res.data, ...timeEntries]);
          showNotification('Time entry created', 'success');
        }
      }
      
      setOpenTimeDialog(false);
      setSelectedTimeEntry(null);
      // Reset new time entry form
      setNewTimeEntry({
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: format(new Date(), 'HH:mm'),
        endTime: '',
        description: '',
        caseId: '',
        billable: true,
        rate: 300,
        category: 'Legal Research',
      });
    } catch (error) {
      console.error('Error saving time entry:', error);
      showNotification('Error saving time entry', 'error');
    }
  };

  const handleCreateInvoice = () => {
    // Group selected time entries by client/case
    const selectedEntries = timeEntries.filter(entry =>
      entry.status === 'APPROVED'
    );
    
    if (selectedEntries.length === 0) {
      showNotification('No approved time entries to invoice', 'warning');
      return;
    }
    
    const subtotal = selectedEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
    const tax = subtotal * 0.08; // 8% tax
    
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: '', // Will be generated by server
      date: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(new Date(Date.now() + 30 * 86400000), 'yyyy-MM-dd'), // 30 days
      clientId: selectedEntries[0].clientId,
      clientName: selectedEntries[0].clientName,
      caseId: selectedEntries[0].caseId,
      caseName: selectedEntries[0].caseName,
      status: 'DRAFT',
      subtotal,
      tax,
      total: subtotal + tax,
      paidAmount: 0,
      lineItems: [
        {
          id: Date.now().toString(),
          description: 'Legal Services',
          quantity: selectedEntries.reduce((sum, entry) => sum + (entry.duration || 0) / 60, 0),
          rate: Math.round(subtotal / (selectedEntries.reduce((sum, entry) => sum + (entry.duration || 0) / 60, 0) || 1)), // Average rate
          amount: subtotal,
          timeEntryIds: selectedEntries.map(e => e.id),
        },
      ],
    };
    
    setSelectedInvoice(newInvoice);
    setOpenInvoiceDialog(true);
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status: string): any => {
    switch (status) {
      case 'PAID': return 'success';
      case 'SENT': return 'info';
      case 'OVERDUE': return 'error';
      case 'PARTIAL': return 'warning';
      case 'DRAFT': return 'default';
      default: return 'default';
    }
  };

  const chartData = [
    { month: 'Jan', billed: 12000, collected: 10000 },
    { month: 'Feb', billed: 15000, collected: 14000 },
    { month: 'Mar', billed: 11000, collected: 9000 },
    { month: 'Apr', billed: 18000, collected: 16000 },
    { month: 'May', billed: 14000, collected: 13000 },
    { month: 'Jun', billed: 16000, collected: 15000 },
  ];

  const pieData = [
    { name: 'Legal Research', value: 35, color: '#1976d2' },
    { name: 'Court Appearance', value: 25, color: '#dc004e' },
    { name: 'Client Meeting', value: 20, color: '#388e3c' },
    { name: 'Document Drafting', value: 15, color: '#f57c00' },
    { name: 'Administrative', value: 5, color: '#7b1fa2' },
  ];

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Billing & Time Tracking</Typography>
        <Box display="flex" gap={2}>
          {activeTimer ? (
            <>
              <Chip
                icon={<Timer />}
                label={`Timer: ${formatDuration(timerDuration)}`}
                color="primary"
                sx={{ px: 2 }}
              />
              <Button
                variant="contained"
                color="error"
                startIcon={<Stop />}
                onClick={handleStopTimer}
              >
                Stop Timer
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              startIcon={<PlayArrow />}
              onClick={handleStartTimer}
            >
              Start Timer
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => {
              setSelectedTimeEntry(null);
              setOpenTimeDialog(true);
            }}
          >
            Add Time Entry
          </Button>
          <Button
            variant="contained"
            startIcon={<Receipt />}
            onClick={handleCreateInvoice}
          >
            Create Invoice
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Billed
                  </Typography>
                  <Typography variant="h4">
                    ${stats?.totalBilled.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +12% from last month
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <AttachMoney />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Outstanding
                  </Typography>
                  <Typography variant="h4">
                    ${stats?.outstanding.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats?.averageCollectionTime} days avg
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  <Schedule />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Billable Hours
                  </Typography>
                  <Typography variant="h4">
                    {stats?.billableHours}h
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    This month
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light' }}>
                  <Timer />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Realization Rate
                  </Typography>
                  <Typography variant="h4">
                    {((stats?.realization || 0) * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Billed vs worked
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.light' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Time Entries" icon={<Timer />} iconPosition="start" />
          <Tab label="Invoices" icon={<Receipt />} iconPosition="start" />
          <Tab label="Analytics" icon={<TrendingUp />} iconPosition="start" />
        </Tabs>

        {tabValue === 0 && (
          /* Time Entries Tab */
          <Box p={3}>
            {/* Filters */}
            <Box display="flex" gap={2} mb={3}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Case</InputLabel>
                <Select
                  value={filterCase}
                  onChange={(e) => setFilterCase(e.target.value)}
                  label="Case"
                >
                  <MenuItem value="all">All Cases</MenuItem>
                  {cases.map(c => (
                    <MenuItem key={c.caseId} value={c.caseId}>{c.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="SUBMITTED">Submitted</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="INVOICED">Invoiced</MenuItem>
                </Select>
              </FormControl>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, v) => v && setViewMode(v)}
                size="small"
              >
                <ToggleButton value="day">Day</ToggleButton>
                <ToggleButton value="week">Week</ToggleButton>
                <ToggleButton value="month">Month</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Time Entries Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Case/Client</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{format(parseISO(entry.date), 'MMM dd')}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{entry.description}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {entry.startTime} - {entry.endTime || 'In progress'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{entry.caseName}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {entry.clientName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {entry.duration ? formatDuration(entry.duration) : '-'}
                      </TableCell>
                      <TableCell>
                        {entry.billable ? `$${entry.rate}/hr` : 'Non-billable'}
                      </TableCell>
                      <TableCell>
                        {entry.billable && entry.amount ? `$${entry.amount.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={entry.status}
                          size="small"
                          color={
                            entry.status === 'APPROVED' ? 'success' :
                            entry.status === 'SUBMITTED' ? 'info' :
                            entry.status === 'INVOICED' ? 'default' : 'warning'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedTimeEntry(entry);
                            setOpenTimeDialog(true);
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={async () => {
                            if (window.confirm('Delete this time entry?')) {
                              try {
                                const res = await api.delete(`/billing/time-entries/${entry.id}`);
                                if (res.success) {
                                  setTimeEntries(timeEntries.filter(e => e.id !== entry.id));
                                  showNotification('Time entry deleted', 'success');
                                }
                              } catch (error) {
                                console.error('Error deleting time entry:', error);
                                showNotification('Error deleting time entry', 'error');
                              }
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tabValue === 1 && (
          /* Invoices Tab */
          <Box p={3}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Paid</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{invoice.clientName}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {invoice.caseName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{format(parseISO(invoice.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(parseISO(invoice.dueDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>${invoice.total.toLocaleString()}</TableCell>
                      <TableCell>${invoice.paidAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.status}
                          size="small"
                          color={getStatusColor(invoice.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View">
                          <IconButton size="small">
                            <Description />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download PDF">
                          <IconButton size="small">
                            <PictureAsPdf />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Send">
                          <IconButton size="small">
                            <Send />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tabValue === 2 && (
          /* Analytics Tab */
          <Box p={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Billing Trends
                </Typography>
                <Paper sx={{ p: 2, height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip />
                      <Bar dataKey="billed" fill="#1976d2" name="Billed" />
                      <Bar dataKey="collected" fill="#388e3c" name="Collected" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Time by Category
                </Typography>
                <Paper sx={{ p: 2, height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Top Clients by Revenue
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Client</TableCell>
                        <TableCell>Cases</TableCell>
                        <TableCell>Hours</TableCell>
                        <TableCell>Billed</TableCell>
                        <TableCell>Collected</TableCell>
                        <TableCell>Outstanding</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>John Smith</TableCell>
                        <TableCell>2</TableCell>
                        <TableCell>45.5</TableCell>
                        <TableCell>$13,650</TableCell>
                        <TableCell>$10,000</TableCell>
                        <TableCell>$3,650</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Williams Estate</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>32.0</TableCell>
                        <TableCell>$11,200</TableCell>
                        <TableCell>$11,200</TableCell>
                        <TableCell>$0</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>ABC Corporation</TableCell>
                        <TableCell>3</TableCell>
                        <TableCell>68.0</TableCell>
                        <TableCell>$23,800</TableCell>
                        <TableCell>$20,000</TableCell>
                        <TableCell>$3,800</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Time Entry Dialog */}
      <Dialog
        open={openTimeDialog}
        onClose={() => {
          setOpenTimeDialog(false);
          setSelectedTimeEntry(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedTimeEntry ? 'Edit Time Entry' : 'New Time Entry'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={selectedTimeEntry?.description || newTimeEntry.description}
                onChange={(e) => {
                  if (selectedTimeEntry) {
                    setSelectedTimeEntry({ ...selectedTimeEntry, description: e.target.value });
                  } else {
                    setNewTimeEntry({ ...newTimeEntry, description: e.target.value });
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={selectedTimeEntry?.date || newTimeEntry.date}
                onChange={(e) => {
                  if (selectedTimeEntry) {
                    setSelectedTimeEntry({ ...selectedTimeEntry, date: e.target.value });
                  } else {
                    setNewTimeEntry({ ...newTimeEntry, date: e.target.value });
                  }
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                type="time"
                label="Start Time"
                value={selectedTimeEntry?.startTime || newTimeEntry.startTime}
                onChange={(e) => {
                  if (selectedTimeEntry) {
                    setSelectedTimeEntry({ ...selectedTimeEntry, startTime: e.target.value });
                  } else {
                    setNewTimeEntry({ ...newTimeEntry, startTime: e.target.value });
                  }
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                type="time"
                label="End Time"
                value={selectedTimeEntry?.endTime || newTimeEntry.endTime}
                onChange={(e) => {
                  if (selectedTimeEntry) {
                    setSelectedTimeEntry({ ...selectedTimeEntry, endTime: e.target.value });
                  } else {
                    setNewTimeEntry({ ...newTimeEntry, endTime: e.target.value });
                  }
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Case</InputLabel>
                <Select
                  value={selectedTimeEntry?.caseId || newTimeEntry.caseId}
                  onChange={(e) => {
                    if (selectedTimeEntry) {
                      setSelectedTimeEntry({ ...selectedTimeEntry, caseId: e.target.value });
                    } else {
                      setNewTimeEntry({ ...newTimeEntry, caseId: e.target.value });
                    }
                  }}
                  label="Case"
                >
                  <MenuItem value="">None</MenuItem>
                  {cases.map(c => (
                    <MenuItem key={c.caseId} value={c.caseId}>{c.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedTimeEntry?.category || newTimeEntry.category}
                  onChange={(e) => {
                    if (selectedTimeEntry) {
                      setSelectedTimeEntry({ ...selectedTimeEntry, category: e.target.value });
                    } else {
                      setNewTimeEntry({ ...newTimeEntry, category: e.target.value });
                    }
                  }}
                  label="Category"
                >
                  <MenuItem value="Legal Research">Legal Research</MenuItem>
                  <MenuItem value="Client Meeting">Client Meeting</MenuItem>
                  <MenuItem value="Court Appearance">Court Appearance</MenuItem>
                  <MenuItem value="Document Drafting">Document Drafting</MenuItem>
                  <MenuItem value="Administrative">Administrative</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Rate ($/hr)"
                value={selectedTimeEntry?.rate || newTimeEntry.rate}
                onChange={(e) => {
                  if (selectedTimeEntry) {
                    setSelectedTimeEntry({ ...selectedTimeEntry, rate: Number(e.target.value) });
                  } else {
                    setNewTimeEntry({ ...newTimeEntry, rate: Number(e.target.value) });
                  }
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Billable</InputLabel>
                <Select
                  value={selectedTimeEntry?.billable !== undefined ? selectedTimeEntry.billable : newTimeEntry.billable}
                  onChange={(e) => {
                    if (selectedTimeEntry) {
                      setSelectedTimeEntry({ ...selectedTimeEntry, billable: e.target.value === 'true' });
                    } else {
                      setNewTimeEntry({ ...newTimeEntry, billable: e.target.value === 'true' });
                    }
                  }}
                  label="Billable"
                >
                  <MenuItem value="true">Billable</MenuItem>
                  <MenuItem value="false">Non-billable</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenTimeDialog(false);
            setSelectedTimeEntry(null);
          }}>
            Cancel
          </Button>
          <Button onClick={handleSaveTimeEntry} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog
        open={openInvoiceDialog}
        onClose={() => {
          setOpenInvoiceDialog(false);
          setSelectedInvoice(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create Invoice
        </DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Invoice Number</Typography>
                  <Typography variant="h6">{selectedInvoice.invoiceNumber}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Client</Typography>
                  <Typography variant="h6">{selectedInvoice.clientName}</Typography>
                </Grid>
              </Grid>
              
              <TableContainer sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Hours</TableCell>
                      <TableCell align="right">Rate</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedInvoice.lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity.toFixed(1)}</TableCell>
                        <TableCell align="right">${item.rate}</TableCell>
                        <TableCell align="right">${item.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right">Subtotal</TableCell>
                      <TableCell align="right">${selectedInvoice.subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} align="right">Tax (8%)</TableCell>
                      <TableCell align="right">${selectedInvoice.tax.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} align="right"><strong>Total</strong></TableCell>
                      <TableCell align="right"><strong>${selectedInvoice.total.toFixed(2)}</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                placeholder="Add any notes or payment instructions..."
                sx={{ mt: 3 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenInvoiceDialog(false);
            setSelectedInvoice(null);
          }}>
            Cancel
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Description />}
            onClick={async () => {
              if (selectedInvoice) {
                try {
                  const { id, invoiceNumber, ...invoiceDataWithoutIdAndNumber } = selectedInvoice;
                  const invoiceData = {
                    ...invoiceDataWithoutIdAndNumber,
                    status: 'DRAFT',
                    timeEntryIds: selectedInvoice.lineItems.flatMap(item => item.timeEntryIds || [])
                  };
                  
                  const res = await api.post('/billing/invoices', invoiceData);
                  if (res.success) {
                    setInvoices([res.data, ...invoices]);
                    setOpenInvoiceDialog(false);
                    setSelectedInvoice(null);
                    showNotification('Invoice saved as draft', 'success');
                    // Refresh data to get updated time entry statuses
                    fetchBillingData();
                  }
                } catch (error) {
                  console.error('Error saving invoice:', error);
                  showNotification('Error saving invoice', 'error');
                }
              }
            }}
          >
            Save as Draft
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Send />}
            onClick={async () => {
              if (selectedInvoice) {
                try {
                  const { id, invoiceNumber, ...invoiceDataWithoutIdAndNumber } = selectedInvoice;
                  const invoiceData = {
                    ...invoiceDataWithoutIdAndNumber,
                    status: 'SENT',
                    timeEntryIds: selectedInvoice.lineItems.flatMap(item => item.timeEntryIds || [])
                  };
                  
                  const res = await api.post('/billing/invoices', invoiceData);
                  if (res.success) {
                    setInvoices([res.data, ...invoices]);
                    setOpenInvoiceDialog(false);
                    setSelectedInvoice(null);
                    showNotification('Invoice sent successfully', 'success');
                    // Refresh data to get updated time entry statuses
                    fetchBillingData();
                  }
                } catch (error) {
                  console.error('Error sending invoice:', error);
                  showNotification('Error sending invoice', 'error');
                }
              }
            }}
          >
            Send Invoice
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Billing;