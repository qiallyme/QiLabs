import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
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
  Badge,
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
  Dashboard,
  Description,
  Message,
  Payment,
  CalendarToday,
  Download,
  Upload,
  Send,
  AttachFile,
  CheckCircle,
  Schedule,
  Warning,
  Info,
  Gavel,
  Receipt,
  QuestionAnswer,
  Visibility,
  Lock,
  LockOpen,
  Notifications,
  AccountBalance,
  Timeline as TimelineIcon,
  Assignment,
  Phone,
  Email,
  VideoCall,
  Person,
} from '@mui/icons-material';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { api } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

interface PortalCase {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
  attorney: string;
  nextHearing?: string;
  lastUpdate: string;
  progress: number;
}

interface PortalDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
  size: number;
  caseId: string;
  isClientVisible: boolean;
  requiresSignature?: boolean;
  signedAt?: string;
}

interface PortalMessage {
  id: string;
  subject: string;
  content: string;
  sender: string;
  senderRole: 'CLIENT' | 'ATTORNEY' | 'PARALEGAL';
  timestamp: string;
  read: boolean;
  attachments?: string[];
  caseId?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  paid: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL';
  items: {
    description: string;
    hours?: number;
    rate?: number;
    amount: number;
  }[];
}

interface CaseUpdate {
  id: string;
  caseId: string;
  date: string;
  title: string;
  description: string;
  type: 'FILING' | 'HEARING' | 'DISCOVERY' | 'SETTLEMENT' | 'OTHER';
  documents?: string[];
}

const ClientPortal: React.FC = () => {
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [cases, setCases] = useState<PortalCase[]>([]);
  const [documents, setDocuments] = useState<PortalDocument[]>([]);
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [updates, setUpdates] = useState<CaseUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<string>('all');
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [openDocumentDialog, setOpenDocumentDialog] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    caseId: '',
  });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchPortalData();
  }, [user?.selectedFirmId]); // Refetch when firm changes

  const fetchPortalData = async () => {
    try {
      console.log('Fetching client portal data...');
      
      // Fetch all client portal data
      const [casesRes, documentsRes, messagesRes, invoicesRes, updatesRes] = await Promise.all([
        api.get('/client-portal/cases'),
        api.get('/client-portal/documents'),
        api.get('/client-portal/messages'),
        api.get('/client-portal/invoices'),
        api.get('/client-portal/updates')
      ]);
      
      console.log('API Responses:', {
        cases: casesRes,
        documents: documentsRes,
        messages: messagesRes,
        invoices: invoicesRes,
        updates: updatesRes
      });

      let transformedCases: PortalCase[] = [];
      
      if (casesRes && casesRes.success) {
        // Transform cases data to match PortalCase interface
        transformedCases = (casesRes.data || []).map((c: any) => ({
          id: c.id,
          caseNumber: c.caseNumber,
          title: c.title,
          status: c.status,
          attorney: c.attorney || 'Your Attorney',
          nextHearing: c.nextHearing === 'No upcoming hearings' ? undefined : c.nextHearing,
          lastUpdate: c.lastUpdate,
          progress: c.progress || 50
        }));
        setCases(transformedCases);
      } else {
        console.error('Cases API failed:', casesRes);
      }

      if (documentsRes && documentsRes.success) {
        // Transform documents data to match PortalDocument interface
        const transformedDocs: PortalDocument[] = (documentsRes.data || []).map((doc: any) => ({
          id: doc.id || '',
          name: doc.name || 'Untitled Document',
          type: doc.type || 'application/octet-stream',
          uploadedAt: doc.uploadedAt || new Date().toISOString(),
          uploadedBy: doc.uploadedBy || 'Unknown',
          size: doc.size || 0,
          caseId: doc.caseId || '',
          isClientVisible: true,
          requiresSignature: doc.name && (doc.name.includes('Agreement') || doc.name.includes('Contract')),
          signedAt: doc.name && doc.name.includes('Agreement') ? '2024-01-11T14:30:00Z' : undefined
        }));
        setDocuments(transformedDocs);
      }

      if (messagesRes && messagesRes.success) {
        // Transform messages data to match PortalMessage interface
        const transformedMessages: PortalMessage[] = (messagesRes.data || []).map((msg: any) => ({
          id: msg.id || '',
          subject: msg.subject || 'No subject',
          content: msg.preview || msg.content || '',
          sender: msg.from || 'Unknown',
          senderRole: (msg.from && typeof msg.from === 'string' && msg.from.includes('Attorney')) ? 'ATTORNEY' : 'PARALEGAL',
          timestamp: (msg.date || '2024-01-01') + 'T00:00:00Z', // Ensure valid ISO date format
          read: !msg.unread,
          attachments: [],
          caseId: transformedCases[0]?.id || 'case-001' // Associate with first case for demo
        }));
        setMessages(transformedMessages);
        setUnreadCount(transformedMessages.filter(m => !m.read).length);
      }

      if (invoicesRes && invoicesRes.success) {
        // Transform invoices data to match Invoice interface
        const transformedInvoices: Invoice[] = (invoicesRes.data || []).map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          date: inv.date,
          dueDate: inv.dueDate,
          amount: inv.total,
          paid: inv.paidAmount,
          status: inv.status === 'PARTIALLY_PAID' ? 'PARTIAL' : inv.status,
          items: [
            { description: 'Legal Services', amount: inv.total * 0.9 },
            { description: 'Expenses', amount: inv.total * 0.1 }
          ]
        }));
        setInvoices(transformedInvoices);
      }

      if (updatesRes && updatesRes.success) {
        // Transform updates data to match CaseUpdate interface
        const transformedUpdates: CaseUpdate[] = (updatesRes.data || []).map((update: any) => {
          const typeMap: Record<string, CaseUpdate['type']> = {
            'case_update': 'OTHER',
            'document': 'DISCOVERY',
            'deadline': 'FILING',
            'meeting': 'OTHER'
          };
          
          return {
            id: update.id,
            caseId: update.caseId || transformedCases[0]?.id || 'case-001',
            date: update.date + 'T00:00:00Z', // Ensure valid ISO date format
            title: update.title,
            description: update.description,
            type: typeMap[update.type] || 'OTHER',
            documents: []
          };
        });
        setUpdates(transformedUpdates);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching portal data:', error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      showNotification('Error loading portal data', 'error');
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    const message: PortalMessage = {
      id: Date.now().toString(),
      ...newMessage,
      sender: user?.firstName + ' ' + user?.lastName || 'Client',
      senderRole: 'CLIENT',
      timestamp: new Date().toISOString(),
      read: true,
    };
    setMessages([message, ...messages]);
    setOpenMessageDialog(false);
    showNotification('Message sent successfully', 'success');
    setNewMessage({ subject: '', content: '', caseId: '' });
  };

  const handleMarkAsRead = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string): any => {
    switch (status) {
      case 'PAID': return 'success';
      case 'PENDING': return 'warning';
      case 'OVERDUE': return 'error';
      case 'PARTIAL': return 'info';
      default: return 'default';
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'FILING': return <Description />;
      case 'HEARING': return <Gavel />;
      case 'DISCOVERY': return <Assignment />;
      case 'SETTLEMENT': return <AccountBalance />;
      default: return <Info />;
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">Client Portal</Typography>
          <Typography variant="body2" color="textSecondary">
            Welcome back, {user?.firstName} {user?.lastName}
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => setOpenDocumentDialog(true)}
          >
            Upload Document
          </Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={() => setOpenMessageDialog(true)}
          >
            Send Message
          </Button>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Cases
                  </Typography>
                  <Typography variant="h4">
                    {cases.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <Gavel />
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
                    Documents
                  </Typography>
                  <Typography variant="h4">
                    {documents.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.light' }}>
                  <Description />
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
                    Unread Messages
                  </Typography>
                  <Typography variant="h4">
                    {unreadCount}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  <Badge badgeContent={unreadCount} color="error">
                    <Message />
                  </Badge>
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
                    Balance Due
                  </Typography>
                  <Typography variant="h4">
                    ${invoices.reduce((sum, inv) => sum + (inv.amount - inv.paid), 0).toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light' }}>
                  <Payment />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Overview" icon={<Dashboard />} iconPosition="start" />
          <Tab label="Cases" icon={<Gavel />} iconPosition="start" />
          <Tab 
            label="Messages" 
            icon={
              <Badge badgeContent={unreadCount} color="error">
                <Message />
              </Badge>
            } 
            iconPosition="start" 
          />
          <Tab label="Documents" icon={<Description />} iconPosition="start" />
          <Tab label="Billing" icon={<Receipt />} iconPosition="start" />
        </Tabs>

        <Box p={3}>
          {tabValue === 0 && (
            /* Overview Tab */
            <Grid container spacing={3}>
              {/* Recent Updates */}
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Recent Case Updates
                </Typography>
                <Timeline>
                  {updates.slice(0, 3).map((update, index) => (
                    <TimelineItem key={update.id}>
                      <TimelineOppositeContent sx={{ py: '12px', px: 2 }}>
                        <Typography variant="caption" color="textSecondary">
                          {format(parseISO(update.date), 'PPp')}
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color="primary">
                          {getUpdateIcon(update.type)}
                        </TimelineDot>
                        {index < updates.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent sx={{ py: '12px', px: 2 }}>
                        <Typography variant="subtitle2">
                          {update.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {update.description}
                        </Typography>
                        {update.documents && (
                          <Box display="flex" gap={1} mt={1}>
                            {update.documents.map((doc, idx) => (
                              <Chip
                                key={idx}
                                label={doc}
                                size="small"
                                icon={<AttachFile />}
                                onClick={() => showNotification('Download functionality would be implemented here', 'info')}
                              />
                            ))}
                          </Box>
                        )}
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </Grid>

              {/* Upcoming Events */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Upcoming Events
                </Typography>
                <List>
                  {cases
                    .filter(c => c.nextHearing)
                    .map(case_ => (
                      <ListItem key={case_.id}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            <CalendarToday />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={case_.title}
                          secondary={
                            <>
                              <Typography variant="body2">
                                {format(parseISO(case_.nextHearing!), 'PPP')}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {formatDistanceToNow(parseISO(case_.nextHearing!), { addSuffix: true })}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <List>
                  <ListItem button onClick={() => setOpenMessageDialog(true)}>
                    <ListItemAvatar>
                      <Avatar>
                        <Email />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Send Message" secondary="Contact your attorney" />
                  </ListItem>
                  <ListItem button onClick={() => setTabValue(3)}>
                    <ListItemAvatar>
                      <Avatar>
                        <Upload />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Upload Document" secondary="Share files securely" />
                  </ListItem>
                  <ListItem button>
                    <ListItemAvatar>
                      <Avatar>
                        <VideoCall />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Schedule Meeting" secondary="Book a consultation" />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && (
            /* Cases Tab */
            <Box>
              {cases.map(case_ => (
                <Card key={case_.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start">
                      <Box>
                        <Typography variant="h6">
                          {case_.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Case #: {case_.caseNumber} • Attorney: {case_.attorney}
                        </Typography>
                        <Box mt={2}>
                          <Typography variant="body2" gutterBottom>
                            Case Progress
                          </Typography>
                          <Box display="flex" alignItems="center" gap={2}>
                            <LinearProgress
                              variant="determinate"
                              value={case_.progress}
                              sx={{ flex: 1, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2">
                              {case_.progress}%
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box textAlign="right">
                        <Chip label={case_.status} color="primary" />
                        {case_.nextHearing && (
                          <Box mt={1}>
                            <Typography variant="caption" color="textSecondary">
                              Next Hearing
                            </Typography>
                            <Typography variant="body2">
                              {format(parseISO(case_.nextHearing), 'PPP')}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" gap={2}>
                      <Button size="small" startIcon={<Visibility />}>
                        View Details
                      </Button>
                      <Button size="small" startIcon={<Description />}>
                        Documents ({documents.filter(d => d.caseId === case_.id).length})
                      </Button>
                      <Button size="small" startIcon={<TimelineIcon />}>
                        Updates ({updates.filter(u => u.caseId === case_.id).length})
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {tabValue === 2 && (
            /* Messages Tab */
            <Box>
              <List>
                {messages.map(message => (
                  <ListItem
                    key={message.id}
                    alignItems="flex-start"
                    sx={{
                      bgcolor: message.read ? 'transparent' : 'action.hover',
                      borderRadius: 1,
                      mb: 1,
                    }}
                    onClick={() => !message.read && handleMarkAsRead(message.id)}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        {message.senderRole === 'ATTORNEY' ? <Gavel /> : <Person />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="subtitle1" fontWeight={message.read ? 'normal' : 'bold'}>
                            {message.subject}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatDistanceToNow(parseISO(message.timestamp), { addSuffix: true })}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="textSecondary">
                            From: {message.sender} ({message.senderRole})
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {message.content}
                          </Typography>
                          {message.attachments && (
                            <Box display="flex" gap={1} mt={1}>
                              {message.attachments.map((att, idx) => (
                                <Chip
                                  key={idx}
                                  label={att}
                                  size="small"
                                  icon={<AttachFile />}
                                />
                              ))}
                            </Box>
                          )}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      {!message.read && (
                        <Chip label="New" size="small" color="primary" />
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {tabValue === 3 && (
            /* Documents Tab */
            <Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Document Name</TableCell>
                      <TableCell>Case</TableCell>
                      <TableCell>Uploaded</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documents.map(document => (
                      <TableRow key={document.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Description />
                            {document.name}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {cases.find(c => c.id === document.caseId)?.title || '-'}
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {format(parseISO(document.uploadedAt), 'PP')}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              by {document.uploadedBy}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{formatFileSize(document.size)}</TableCell>
                        <TableCell>
                          {document.requiresSignature && (
                            <Chip
                              label={document.signedAt ? 'Signed' : 'Pending Signature'}
                              color={document.signedAt ? 'success' : 'warning'}
                              size="small"
                              icon={document.signedAt ? <CheckCircle /> : <Schedule />}
                            />
                          )}
                        </TableCell>
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
            </Box>
          )}

          {tabValue === 4 && (
            /* Billing Tab */
            <Box>
              {invoices.map(invoice => (
                <Card key={invoice.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start">
                      <Box>
                        <Typography variant="h6">
                          Invoice #{invoice.invoiceNumber}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Issued: {format(parseISO(invoice.date), 'PP')} • Due: {format(parseISO(invoice.dueDate), 'PP')}
                        </Typography>
                      </Box>
                      <Chip
                        label={invoice.status}
                        color={getStatusColor(invoice.status)}
                      />
                    </Box>
                    <TableContainer sx={{ mt: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Hours</TableCell>
                            <TableCell align="right">Rate</TableCell>
                            <TableCell align="right">Amount</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {invoice.items.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{item.description}</TableCell>
                              <TableCell align="right">{item.hours || '-'}</TableCell>
                              <TableCell align="right">{item.rate ? `$${item.rate}` : '-'}</TableCell>
                              <TableCell align="right">${item.amount.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} align="right">
                              <strong>Total</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>${invoice.amount.toLocaleString()}</strong>
                            </TableCell>
                          </TableRow>
                          {invoice.paid > 0 && (
                            <>
                              <TableRow>
                                <TableCell colSpan={3} align="right">
                                  Paid
                                </TableCell>
                                <TableCell align="right">
                                  ${invoice.paid.toLocaleString()}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell colSpan={3} align="right">
                                  <strong>Balance Due</strong>
                                </TableCell>
                                <TableCell align="right">
                                  <strong>${(invoice.amount - invoice.paid).toLocaleString()}</strong>
                                </TableCell>
                              </TableRow>
                            </>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box display="flex" gap={2} mt={2}>
                      <Button variant="outlined" size="small" startIcon={<Download />}>
                        Download PDF
                      </Button>
                      {invoice.status !== 'PAID' && (
                        <Button variant="contained" size="small" startIcon={<Payment />}>
                          Pay Now
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Send Message Dialog */}
      <Dialog
        open={openMessageDialog}
        onClose={() => setOpenMessageDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Message</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Subject"
            value={newMessage.subject}
            onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Related Case</InputLabel>
            <Select
              value={newMessage.caseId}
              onChange={(e) => setNewMessage({ ...newMessage, caseId: e.target.value })}
              label="Related Case"
            >
              <MenuItem value="">None</MenuItem>
              {cases.map(case_ => (
                <MenuItem key={case_.id} value={case_.id}>
                  {case_.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Message"
            value={newMessage.content}
            onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            Your attorney will respond within 24-48 hours during business days.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMessageDialog(false)}>Cancel</Button>
          <Button onClick={handleSendMessage} variant="contained">
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientPortal;