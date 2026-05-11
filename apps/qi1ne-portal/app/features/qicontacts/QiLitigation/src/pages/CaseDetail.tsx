import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Button,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  LinearProgress,
  Menu,
  MenuItem,
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
  MoreVert,
  Gavel,
  Description,
  Assignment,
  Person,
  AttachFile,
  Comment,
  Schedule,
  Add,
  CloudUpload,
  Download,
  Visibility,
  Email,
  Phone,
  LocationOn,
  Event,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { api } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';
import CollaborationPanel from '../components/CollaborationPanel';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CaseDetail: React.FC = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [caseData, setCaseData] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [noteDialog, setNoteDialog] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [taskDialog, setTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', assignedTo: '' });

  useEffect(() => {
    fetchCaseDetails();
    fetchDocuments();
    fetchTasks();
    fetchNotes();
    fetchTimeline();
  }, [caseId]);

  const fetchCaseDetails = async () => {
    try {
      const data = await api.get(`/cases/${caseId}`);
      if (data.success) {
        setCaseData(data.data);
      }
    } catch (error) {
      console.error('Error fetching case details:', error);
      showNotification('Error loading case details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    // Mock documents for demo
    setDocuments([
      { id: '1', name: 'Initial Complaint.pdf', type: 'Legal Document', uploadedBy: 'John Attorney', uploadedAt: '2024-01-15', size: '2.5 MB' },
      { id: '2', name: 'Evidence_Photos.zip', type: 'Evidence', uploadedBy: 'Jane Paralegal', uploadedAt: '2024-01-18', size: '15.3 MB' },
      { id: '3', name: 'Client_Statement.docx', type: 'Statement', uploadedBy: 'John Attorney', uploadedAt: '2024-01-20', size: '145 KB' },
    ]);
  };

  const fetchTasks = async () => {
    // Mock tasks for demo
    setTasks([
      { id: '1', title: 'File initial complaint', status: 'Completed', assignedTo: 'John Attorney', dueDate: '2024-01-20', priority: 'High' },
      { id: '2', title: 'Collect medical records', status: 'In Progress', assignedTo: 'Jane Paralegal', dueDate: '2024-02-01', priority: 'High' },
      { id: '3', title: 'Schedule deposition', status: 'Pending', assignedTo: 'John Attorney', dueDate: '2024-02-15', priority: 'Medium' },
    ]);
  };

  const fetchNotes = async () => {
    // Mock notes for demo
    setNotes([
      { id: '1', author: 'John Attorney', content: 'Client provided additional witness information. Need to follow up.', createdAt: '2024-01-22T10:30:00Z' },
      { id: '2', author: 'Jane Paralegal', content: 'Medical records request sent to three hospitals.', createdAt: '2024-01-21T14:15:00Z' },
      { id: '3', author: 'John Attorney', content: 'Opposing counsel requested extension for discovery deadline.', createdAt: '2024-01-20T09:00:00Z' },
    ]);
  };

  const fetchTimeline = async () => {
    // Mock timeline for demo
    setTimeline([
      { date: '2024-01-15', event: 'Case opened', type: 'milestone' },
      { date: '2024-01-16', event: 'Initial client meeting', type: 'meeting' },
      { date: '2024-01-18', event: 'Complaint filed with court', type: 'filing' },
      { date: '2024-01-20', event: 'Evidence collected', type: 'evidence' },
      { date: '2024-02-15', event: 'Discovery deadline', type: 'deadline' },
      { date: '2024-03-01', event: 'Pre-trial conference', type: 'court' },
    ]);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddNote = async () => {
    if (newNote.trim()) {
      // In real app, would save to backend
      const note = {
        id: Date.now().toString(),
        author: 'Current User',
        content: newNote,
        createdAt: new Date().toISOString(),
      };
      setNotes([note, ...notes]);
      setNewNote('');
      setNoteDialog(false);
      showNotification('Note added successfully', 'success');
    }
  };

  const handleAddTask = async () => {
    if (newTask.title.trim()) {
      // In real app, would save to backend
      const task = {
        id: Date.now().toString(),
        ...newTask,
        status: 'Pending',
        priority: 'Medium',
      };
      setTasks([...tasks, task]);
      setNewTask({ title: '', description: '', dueDate: '', assignedTo: '' });
      setTaskDialog(false);
      showNotification('Task added successfully', 'success');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PENDING': return 'warning';
      case 'DISCOVERY': return 'info';
      case 'CLOSED': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (!caseData) {
    return <Typography>Case not found</Typography>;
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/cases')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4">{caseData.title}</Typography>
            <Box display="flex" gap={1} mt={1}>
              <Chip label={caseData.caseNumber} size="small" />
              <Chip label={caseData.status} size="small" color={getStatusColor(caseData.status) as any} />
              <Chip label={caseData.priority} size="small" color={getPriorityColor(caseData.priority) as any} variant="outlined" />
            </Box>
          </Box>
        </Box>
        <Box>
          <Button variant="contained" startIcon={<Edit />} sx={{ mr: 1 }}>
            Edit Case
          </Button>
          <IconButton onClick={handleMenuClick}>
            <MoreVert />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleMenuClose}>Archive Case</MenuItem>
            <MenuItem onClick={handleMenuClose}>Export Case Data</MenuItem>
            <MenuItem onClick={handleMenuClose}>Print Summary</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Case Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Overview" />
              <Tab label="Documents" />
              <Tab label="Tasks" />
              <Tab label="Timeline" />
              <Tab label="Billing" />
              <Tab label="Communications" />
              <Tab label="Collaboration" icon={<Comment />} iconPosition="end" />
            </Tabs>

            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Case Description</Typography>
                  <Typography variant="body1" paragraph>
                    {caseData.description}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Case Details</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Practice Area" secondary={caseData.practiceArea} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Court" secondary={caseData.courtName || 'Not specified'} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Judge" secondary={caseData.judgeAssigned || 'Not assigned'} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Opposing Counsel" secondary={caseData.opposingCounsel || 'Not specified'} />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Important Dates</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Date Opened" secondary={format(new Date(caseData.dateOpened), 'MMM dd, yyyy')} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Statute of Limitations" secondary={caseData.statute_of_limitations || 'Not specified'} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Next Court Date" secondary="March 1, 2024" />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Notes</Typography>
                  <Button startIcon={<Add />} variant="outlined" size="small" onClick={() => setNoteDialog(true)} sx={{ mb: 2 }}>
                    Add Note
                  </Button>
                  <List>
                    {notes.map((note) => (
                      <ListItem key={note.id} alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>{note.author[0]}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={note.content}
                          secondary={`${note.author} - ${format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm')}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Documents Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Documents</Typography>
                <Button variant="contained" startIcon={<CloudUpload />}>
                  Upload Document
                </Button>
              </Box>
              <List>
                {documents.map((doc) => (
                  <ListItem key={doc.id} secondaryAction={
                    <Box>
                      <IconButton><Visibility /></IconButton>
                      <IconButton><Download /></IconButton>
                    </Box>
                  }>
                    <ListItemAvatar>
                      <Avatar>
                        <Description />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={doc.name}
                      secondary={`${doc.type} • ${doc.size} • Uploaded by ${doc.uploadedBy} on ${doc.uploadedAt}`}
                    />
                  </ListItem>
                ))}
              </List>
            </TabPanel>

            {/* Tasks Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Tasks</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setTaskDialog(true)}>
                  Add Task
                </Button>
              </Box>
              <List>
                {tasks.map((task) => (
                  <ListItem key={task.id}>
                    <ListItemAvatar>
                      <Avatar>
                        <Assignment />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={task.title}
                      secondary={`Assigned to ${task.assignedTo} • Due ${task.dueDate}`}
                    />
                    <Chip label={task.status} size="small" color={task.status === 'Completed' ? 'success' : 'warning'} />
                  </ListItem>
                ))}
              </List>
            </TabPanel>

            {/* Timeline Tab */}
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>Case Timeline</Typography>
              <Timeline>
                {timeline.map((item, index) => (
                  <TimelineItem key={index}>
                    <TimelineOppositeContent color="text.secondary">
                      {format(new Date(item.date), 'MMM dd, yyyy')}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color={item.type === 'deadline' ? 'error' : 'primary'}>
                        {item.type === 'court' && <Gavel />}
                        {item.type === 'filing' && <Description />}
                        {item.type === 'deadline' && <Schedule />}
                      </TimelineDot>
                      {index < timeline.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography>{item.event}</Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </TabPanel>

            {/* Billing Tab */}
            <TabPanel value={tabValue} index={4}>
              <Typography variant="h6" gutterBottom>Billing & Time Tracking</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Total Hours</Typography>
                      <Typography variant="h4">127.5</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Billable Amount</Typography>
                      <Typography variant="h4">$45,900</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Invoiced</Typography>
                      <Typography variant="h4">$32,500</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              <Button variant="contained" sx={{ mt: 3 }}>Generate Invoice</Button>
            </TabPanel>

            {/* Communications Tab */}
            <TabPanel value={tabValue} index={5}>
              <Typography variant="h6" gutterBottom>Communications</Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar><Email /></Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Email to opposing counsel"
                    secondary="Re: Discovery extension request • Jan 20, 2024"
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar><Phone /></Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Phone call with client"
                    secondary="Discussed settlement options • Jan 18, 2024"
                  />
                </ListItem>
              </List>
            </TabPanel>

            {/* Collaboration Tab */}
            <TabPanel value={tabValue} index={6}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <CollaborationPanel
                    entityType="CASE"
                    entityId={caseId || ''}
                    entityTitle={caseData.title}
                  />
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>

        {/* Right Column - Quick Info */}
        <Grid item xs={12} md={4}>
          {/* Client Information */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Client Information</Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ mr: 2 }}>{caseData.clientName?.[0]}</Avatar>
              <Box>
                <Typography variant="subtitle1">{caseData.clientName}</Typography>
                <Typography variant="body2" color="textSecondary">Primary Client</Typography>
              </Box>
            </Box>
            <List dense>
              <ListItem>
                <ListItemAvatar>
                  <Email />
                </ListItemAvatar>
                <ListItemText primary="john.smith@email.com" />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Phone />
                </ListItemAvatar>
                <ListItemText primary="+1 234 567 8900" />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <LocationOn />
                </ListItemAvatar>
                <ListItemText primary="123 Main St, New York, NY" />
              </ListItem>
            </List>
            <Button fullWidth variant="outlined" sx={{ mt: 1 }}>View Full Profile</Button>
          </Paper>

          {/* Team Members */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Team Members</Typography>
            <List dense>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>JA</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={caseData.assignedAttorney}
                  secondary="Lead Attorney"
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>JP</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Jane Paralegal"
                  secondary="Paralegal"
                />
              </ListItem>
            </List>
            <Button fullWidth variant="outlined" sx={{ mt: 1 }}>Manage Team</Button>
          </Paper>

          {/* Quick Actions */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Button fullWidth variant="outlined" size="small" startIcon={<Schedule />}>
                  Schedule
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button fullWidth variant="outlined" size="small" startIcon={<Email />}>
                  Email
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button fullWidth variant="outlined" size="small" startIcon={<Phone />}>
                  Call
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button fullWidth variant="outlined" size="small" startIcon={<Comment />}>
                  Note
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Note Dialog */}
      <Dialog open={noteDialog} onClose={() => setNoteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            placeholder="Enter your note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialog(false)}>Cancel</Button>
          <Button onClick={handleAddNote} variant="contained">Add Note</Button>
        </DialogActions>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={taskDialog} onClose={() => setTaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Task Title"
            variant="outlined"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            variant="outlined"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="date"
            label="Due Date"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Assign To"
            variant="outlined"
            value={newTask.assignedTo}
            onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialog(false)}>Cancel</Button>
          <Button onClick={handleAddTask} variant="contained">Add Task</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CaseDetail;