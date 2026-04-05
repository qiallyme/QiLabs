import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  LinearProgress,
  Checkbox,
  Menu,
} from '@mui/material';
import {
  Add,
  Assignment,
  Schedule,
  CheckCircle,
  Warning,
  AccessTime,
  Person,
  MoreVert,
  Edit,
  Delete,
  Flag,
  CalendarToday,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { format, addDays, differenceInDays, isPast, parseISO } from 'date-fns';
import { api } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

interface Task {
  id: string;
  title: string;
  description: string;
  caseId: string;
  caseName: string;
  assignedTo: string;
  assignedToName: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
  createdAt: string;
  createdBy: string;
  tags: string[];
}

const Tasks: React.FC = () => {
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    caseId: string;
    assignedTo: string;
    dueDate: string;
    priority: Task['priority'];
  }>({
    title: '',
    description: '',
    caseId: '',
    assignedTo: '',
    dueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    priority: 'MEDIUM',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await api.get('/tasks');
      if (data.success) {
        // Add mock data for demo
        const mockTasks: Task[] = [
          {
            id: '1',
            title: 'File initial complaint',
            description: 'Draft and file the initial complaint with the court',
            caseId: 'case-001',
            caseName: 'Smith vs. Johnson',
            assignedTo: 'demo-user-123',
            assignedToName: 'Demo Attorney',
            dueDate: format(addDays(new Date(), -2), 'yyyy-MM-dd'),
            priority: 'HIGH',
            status: 'TODO',
            createdAt: '2024-01-15',
            createdBy: 'Admin',
            tags: ['urgent', 'filing'],
          },
          {
            id: '2',
            title: 'Review discovery documents',
            description: 'Review all discovery documents received from opposing counsel',
            caseId: 'case-002',
            caseName: 'Estate of Williams',
            assignedTo: 'demo-user-123',
            assignedToName: 'Demo Attorney',
            dueDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
            priority: 'MEDIUM',
            status: 'IN_PROGRESS',
            createdAt: '2024-01-18',
            createdBy: 'Demo Attorney',
            tags: ['discovery'],
          },
          {
            id: '3',
            title: 'Client meeting preparation',
            description: 'Prepare materials for upcoming client meeting',
            caseId: 'case-001',
            caseName: 'Smith vs. Johnson',
            assignedTo: 'jane-paralegal',
            assignedToName: 'Jane Paralegal',
            dueDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            createdAt: '2024-01-20',
            createdBy: 'Demo Attorney',
            tags: ['meeting', 'client'],
          },
          {
            id: '4',
            title: 'Legal research on precedents',
            description: 'Research similar cases for settlement strategy',
            caseId: 'case-003',
            caseName: 'ABC Corp vs. XYZ Inc',
            assignedTo: 'demo-user-123',
            assignedToName: 'Demo Attorney',
            dueDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
            priority: 'MEDIUM',
            status: 'TODO',
            createdAt: '2024-01-22',
            createdBy: 'Demo Attorney',
            tags: ['research'],
          },
          {
            id: '5',
            title: 'Draft settlement agreement',
            description: 'Create initial draft of settlement terms',
            caseId: 'case-001',
            caseName: 'Smith vs. Johnson',
            assignedTo: 'demo-user-123',
            assignedToName: 'Demo Attorney',
            dueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
            priority: 'LOW',
            status: 'REVIEW',
            createdAt: '2024-01-23',
            createdBy: 'Demo Attorney',
            tags: ['settlement', 'draft'],
          },
        ];
        setTasks(mockTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showNotification('Error loading tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      const data = await api.post('/tasks', {
        ...newTask,
        status: 'TODO',
      });
      if (data.success) {
        setOpenDialog(false);
        showNotification('Task created successfully', 'success');
        await fetchTasks(); // Refresh the list
      } else {
        showNotification(data.error?.message || 'Failed to create task', 'error');
      }
    } catch (error) {
      showNotification('Error creating task', 'error');
    }
    // Reset form
    setNewTask({
      title: '',
      description: '',
      caseId: '',
      assignedTo: '',
      dueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      priority: 'MEDIUM',
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const updatedTasks = [...tasks];
    const taskIndex = updatedTasks.findIndex(t => t.id === result.draggableId);
    if (taskIndex !== -1) {
      updatedTasks[taskIndex].status = destination.droppableId as Task['status'];
      setTasks(updatedTasks);
      showNotification('Task status updated', 'success');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const getDueDateStatus = (dueDate: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    const daysUntil = differenceInDays(date, today);
    
    if (daysUntil < 0) return { color: 'error', text: `${Math.abs(daysUntil)} days overdue` };
    if (daysUntil === 0) return { color: 'warning', text: 'Due today' };
    if (daysUntil === 1) return { color: 'warning', text: 'Due tomorrow' };
    if (daysUntil <= 3) return { color: 'info', text: `Due in ${daysUntil} days` };
    return { color: 'default', text: format(date, 'MMM dd') };
  };

  const filterTasksByTab = (tasks: Task[]) => {
    switch (tabValue) {
      case 0: return tasks; // All tasks
      case 1: return tasks.filter(t => t.assignedTo === user?.userId); // My tasks
      case 2: return tasks.filter(t => new Date(t.dueDate) < new Date()); // Overdue
      case 3: return tasks.filter(t => t.status === 'COMPLETED'); // Completed
      default: return tasks;
    }
  };

  const columns = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
  const columnTitles = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    REVIEW: 'Review',
    COMPLETED: 'Completed',
  };

  const filteredTasks = filterTasksByTab(tasks);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Tasks</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant={viewMode === 'kanban' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('kanban')}
          >
            Kanban Board
          </Button>
          <Button
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            New Task
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
                    Total Tasks
                  </Typography>
                  <Typography variant="h4">
                    {tasks.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <Assignment />
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
                    My Tasks
                  </Typography>
                  <Typography variant="h4">
                    {tasks.filter(t => t.assignedTo === user?.userId).length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.light' }}>
                  <Person />
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
                    Overdue
                  </Typography>
                  <Typography variant="h4" color="error">
                    {tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.light' }}>
                  <Warning />
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
                    Completed
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {tasks.filter(t => t.status === 'COMPLETED').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light' }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="All Tasks" />
          <Tab label="My Tasks" />
          <Tab label="Overdue" />
          <Tab label="Completed" />
        </Tabs>
      </Paper>

      {loading ? (
        <LinearProgress />
      ) : viewMode === 'kanban' ? (
        /* Kanban View */
        <DragDropContext onDragEnd={handleDragEnd}>
          <Grid container spacing={2}>
            {columns.map((column) => (
              <Grid item xs={12} sm={6} md={3} key={column}>
                <Paper sx={{ p: 2, minHeight: 400, bgcolor: 'grey.50' }}>
                  <Typography variant="h6" gutterBottom>
                    {columnTitles[column as keyof typeof columnTitles]}
                    <Chip
                      label={filteredTasks.filter(t => t.status === column).length}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Droppable droppableId={column}>
                    {(provided: DroppableProvided) => (
                      <Box
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        sx={{ minHeight: 300 }}
                      >
                        {filteredTasks
                          .filter(task => task.status === column)
                          .map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  sx={{
                                    mb: 1,
                                    opacity: snapshot.isDragging ? 0.5 : 1,
                                    cursor: 'grab',
                                  }}
                                >
                                  <CardContent sx={{ pb: 1, '&:last-child': { pb: 1 } }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="start">
                                      <Typography variant="subtitle2" gutterBottom>
                                        {task.title}
                                      </Typography>
                                      <IconButton size="small">
                                        <MoreVert fontSize="small" />
                                      </IconButton>
                                    </Box>
                                    <Typography variant="caption" color="textSecondary" display="block">
                                      {task.caseName}
                                    </Typography>
                                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                                      <Chip
                                        label={task.priority}
                                        size="small"
                                        color={getPriorityColor(task.priority) as any}
                                      />
                                      <Chip
                                        icon={<Schedule />}
                                        label={getDueDateStatus(task.dueDate).text}
                                        size="small"
                                        color={getDueDateStatus(task.dueDate).color as any}
                                      />
                                    </Box>
                                    <Box display="flex" alignItems="center" mt={1}>
                                      <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                                        {task.assignedToName[0]}
                                      </Avatar>
                                      <Typography variant="caption" sx={{ ml: 1 }}>
                                        {task.assignedToName}
                                      </Typography>
                                    </Box>
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DragDropContext>
      ) : (
        /* List View */
        <Paper>
          <List>
            {filteredTasks.map((task) => (
              <ListItem key={task.id} divider>
                <ListItemAvatar>
                  <Checkbox />
                </ListItemAvatar>
                <ListItemText
                  primary={task.title}
                  secondary={
                    <Box component="span">
                      {task.caseName} • Assigned to {task.assignedToName}
                    </Box>
                  }
                />
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={task.priority}
                    size="small"
                    color={getPriorityColor(task.priority) as any}
                  />
                  <Chip
                    icon={<Schedule />}
                    label={getDueDateStatus(task.dueDate).text}
                    size="small"
                    color={getDueDateStatus(task.dueDate).color as any}
                  />
                  <Chip
                    label={task.status.replace('_', ' ')}
                    size="small"
                  />
                  <IconButton size="small">
                    <Edit />
                  </IconButton>
                  <IconButton size="small">
                    <Delete />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Create Task Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Task Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Case</InputLabel>
            <Select
              value={newTask.caseId}
              onChange={(e) => setNewTask({ ...newTask, caseId: e.target.value })}
              label="Case"
            >
              <MenuItem value="case-001">Smith vs. Johnson</MenuItem>
              <MenuItem value="case-002">Estate of Williams</MenuItem>
              <MenuItem value="case-003">ABC Corp vs. XYZ Inc</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Assign To</InputLabel>
            <Select
              value={newTask.assignedTo}
              onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
              label="Assign To"
            >
              <MenuItem value="demo-user-123">Demo Attorney</MenuItem>
              <MenuItem value="jane-paralegal">Jane Paralegal</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="date"
            label="Due Date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
              label="Priority"
            >
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="URGENT">Urgent</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained">Create Task</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;