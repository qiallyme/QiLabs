import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Menu,
  Divider,
} from '@mui/material';
import {
  CalendarToday,
  Add,
  Event,
  Schedule,
  Gavel,
  Description,
  LocationOn,
  Person,
  Notifications,
  ChevronLeft,
  ChevronRight,
  Today,
  ViewWeek,
  ViewDay,
  MoreVert,
  Edit,
  Delete,
  ContentCopy,
  VideoCall,
  Phone,
  Email,
  Warning,
  Assignment,
  Business,
} from '@mui/icons-material';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  isPast,
  isFuture,
  addHours,
  differenceInDays,
  parseISO,
} from 'date-fns';
import { api } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'COURT_DATE' | 'DEADLINE' | 'MEETING' | 'TASK' | 'OTHER';
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
  caseId?: string;
  caseName?: string;
  attendees?: string[];
  reminder?: number; // minutes before
  isVirtual?: boolean;
  meetingLink?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
  color?: string;
  createdBy: string;
  createdAt: string;
}

interface EventType {
  value: string;
  label: string;
  color: string;
  icon: React.ReactNode;
}

const eventTypes: EventType[] = [
  { value: 'COURT_DATE', label: 'Court Date', color: '#d32f2f', icon: <Gavel /> },
  { value: 'DEADLINE', label: 'Deadline', color: '#f57c00', icon: <Warning /> },
  { value: 'MEETING', label: 'Meeting', color: '#1976d2', icon: <Person /> },
  { value: 'TASK', label: 'Task', color: '#388e3c', icon: <Description /> },
  { value: 'OTHER', label: 'Other', color: '#7b1fa2', icon: <Event /> },
];

const Calendar: React.FC = () => {
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [openNewCaseDialog, setOpenNewCaseDialog] = useState(false);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const [newCase, setNewCase] = useState({
    caseNumber: "",
    title: "",
    type: "civil",
    clientName: "",
    jurisdiction: "",
    court: "",
    judge: "",
    dateOpened: "",
    description: ""
  });
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterType, setFilterType] = useState('all');
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'COURT_DATE',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    description: '',
    caseId: '',
    isVirtual: false,
    meetingLink: '',
    reminder: 60,
  });

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const data = await api.get('/calendar/events');
      if (data.success) {
        // Mock data for demo
        const mockEvents: CalendarEvent[] = [
          {
            id: '1',
            title: 'Smith vs. Johnson - Trial',
            type: 'COURT_DATE',
            date: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
            startTime: '09:00',
            endTime: '17:00',
            location: 'Courtroom 3A, County Courthouse',
            description: 'Trial proceedings for personal injury case',
            caseId: 'case-001',
            caseName: 'Smith vs. Johnson',
            attendees: ['Demo Attorney', 'Jane Paralegal', 'John Smith'],
            reminder: 1440, // 24 hours
            isVirtual: false,
            status: 'SCHEDULED',
            createdBy: 'Demo Attorney',
            createdAt: '2024-01-01T00:00:00Z',
          },
          {
            id: '2',
            title: 'Discovery Deadline - ABC Corp',
            type: 'DEADLINE',
            date: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
            startTime: '17:00',
            description: 'Submit all discovery documents',
            caseId: 'case-003',
            caseName: 'ABC Corp vs. XYZ Inc',
            reminder: 2880, // 48 hours
            status: 'SCHEDULED',
            createdBy: 'Demo Attorney',
            createdAt: '2024-01-01T00:00:00Z',
          },
          {
            id: '3',
            title: 'Client Meeting - Estate Planning',
            type: 'MEETING',
            date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
            startTime: '14:00',
            endTime: '15:30',
            location: 'Conference Room A',
            description: 'Review will and testament updates',
            caseId: 'case-002',
            caseName: 'Estate of Williams',
            attendees: ['Demo Attorney', 'Client'],
            reminder: 60,
            isVirtual: false,
            status: 'SCHEDULED',
            createdBy: 'Demo Attorney',
            createdAt: '2024-01-01T00:00:00Z',
          },
          {
            id: '4',
            title: 'Motion Filing Deadline',
            type: 'DEADLINE',
            date: format(addDays(new Date(), -1), 'yyyy-MM-dd'),
            startTime: '17:00',
            description: 'File motion to compel',
            caseId: 'case-001',
            caseName: 'Smith vs. Johnson',
            reminder: 1440,
            status: 'COMPLETED',
            createdBy: 'Demo Attorney',
            createdAt: '2024-01-01T00:00:00Z',
          },
          {
            id: '5',
            title: 'Deposition - Expert Witness',
            type: 'COURT_DATE',
            date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
            startTime: '10:00',
            endTime: '16:00',
            location: 'Virtual - Zoom',
            description: 'Deposition of medical expert Dr. Johnson',
            caseId: 'case-001',
            caseName: 'Smith vs. Johnson',
            attendees: ['Demo Attorney', 'Court Reporter', 'Expert Witness'],
            reminder: 1440,
            isVirtual: true,
            meetingLink: 'https://zoom.us/j/123456789',
            status: 'SCHEDULED',
            createdBy: 'Demo Attorney',
            createdAt: '2024-01-01T00:00:00Z',
          },
          {
            id: '6',
            title: 'Settlement Conference',
            type: 'COURT_DATE',
            date: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
            startTime: '13:00',
            endTime: '15:00',
            location: 'Judge Chambers',
            description: 'Settlement conference with Judge Smith',
            caseId: 'case-001',
            caseName: 'Smith vs. Johnson',
            attendees: ['Demo Attorney', 'Opposing Counsel', 'Judge Smith'],
            reminder: 2880,
            isVirtual: false,
            status: 'SCHEDULED',
            createdBy: 'Demo Attorney',
            createdAt: '2024-01-01T00:00:00Z',
          },
        ];
        // Transform API response to match CalendarEvent interface
        const transformedEvents = (data.data || []).map((event: any) => {
          const startDate = new Date(event.start);
          const endDate = new Date(event.end);
          
          return {
            id: event.id,
            title: event.title,
            type: (() => {
              // Map backend event types to frontend types
              const typeMap: Record<string, CalendarEvent['type']> = {
                'COURT_DATE': 'COURT_DATE',
                'DEADLINE': 'DEADLINE',
                'INTERNAL_MEETING': 'MEETING',
                'CLIENT_MEETING': 'MEETING',
                'DEPOSITION': 'MEETING',
                'TRAINING': 'MEETING',
                'CONFERENCE': 'MEETING',
                'CLOSING': 'MEETING',
                'HEARING': 'COURT_DATE',
                'DISCOVERY': 'DEADLINE',
                'TRANSACTION': 'DEADLINE',
                'Government Filing': 'DEADLINE',
                'Court Filing': 'DEADLINE'
              };
              return typeMap[event.type] || 'OTHER';
            })(),
            date: format(startDate, 'yyyy-MM-dd'),
            startTime: format(startDate, 'HH:mm'),
            endTime: format(endDate, 'HH:mm'),
            location: event.location,
            description: event.description,
            caseId: event.caseId,
            caseName: event.caseName,
            attendees: event.attendees || [],
            reminder: event.reminder || 30,
            isVirtual: event.location?.toLowerCase().includes('virtual') || false,
            status: 'SCHEDULED',
            createdBy: event.attendees?.[0] || 'System',
            createdAt: event.createdAt || new Date().toISOString(),
          };
        });
        setEvents(transformedEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      // Use mock data on error
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Smith vs. Johnson - Trial',
          type: 'COURT_DATE',
          date: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
          startTime: '09:00',
          endTime: '17:00',
          location: 'Courtroom 3A',
          description: 'Trial proceedings',
          caseId: 'case-001',
          caseName: 'Smith vs. Johnson',
          reminder: 1440,
          status: 'SCHEDULED',
          createdBy: 'Demo Attorney',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];
      setEvents(mockEvents);
    }
  };

  const handleCreateEvent = () => {
    const event: CalendarEvent = {
      id: Date.now().toString(),
      ...newEvent,
      type: newEvent.type as CalendarEvent['type'],
      caseName: 'Selected Case', // Would fetch from case data
      status: 'SCHEDULED',
      createdBy: user?.firstName + ' ' + user?.lastName || 'Current User',
      createdAt: new Date().toISOString(),
    };
    setEvents([...events, event]);
    setOpenEventDialog(false);
    showNotification('Event created successfully', 'success');
    // Reset form
    setNewEvent({
      title: '',
      type: 'COURT_DATE',
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      description: '',
      caseId: '',
      isVirtual: false,
      meetingLink: '',
      reminder: 60,
    });
  };

  // Enhanced date click handler
  const handleDateClick = (date: Date) => {
    const dayEvents = events.filter(event =>
      isSameDay(parseISO(event.date), date)
    );
    
    setSelectedDate(date);
    setClickedDate(date);
    
    // If there are no events on this date, show action selection
    if (dayEvents.length === 0) {
      setOpenActionDialog(true);
    }
  };

  // Handle new case creation
  const handleCreateNewCase = () => {
    setOpenActionDialog(false);
    setNewCase({
      ...newCase,
      dateOpened: clickedDate ? format(clickedDate, "yyyy-MM-dd") : ""
    });
    setOpenNewCaseDialog(true);
  };

  // Handle new event creation from calendar
  const handleCreateNewEvent = () => {
    setOpenActionDialog(false);
    setNewEvent({
      ...newEvent,
      date: clickedDate ? format(clickedDate, "yyyy-MM-dd") : ""
    });
    setOpenEventDialog(true);
  };

  // Submit new case
  const handleSubmitCase = async () => {
    try {
      console.log("Creating new case:", newCase);
      showNotification("Case created successfully!", "success");
      
      setNewCase({
        caseNumber: "",
        title: "",
        type: "civil",
        clientName: "",
        jurisdiction: "",
        court: "",
        judge: "",
        dateOpened: "",
        description: ""
      });
      setOpenNewCaseDialog(false);
    } catch (error) {
      showNotification("Error creating case", "error");
    }
  };
  const handleDeleteEvent = (event: CalendarEvent) => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      setEvents(events.filter(e => e.id !== event.id));
      showNotification('Event deleted successfully', 'success');
    }
  };

  const getDaysInMonth = () => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    const days = [];
    let day = start;

    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(parseISO(event.date), date));
  };

  const getEventTypeConfig = (type: string) => {
    return eventTypes.find(et => et.value === type) || eventTypes[4];
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    return events
      .filter(event => {
        const eventDate = parseISO(event.date);
        return isFuture(eventDate) || isToday(eventDate);
      })
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .slice(0, 5);
  };

  const renderMonthView = () => {
    const days = getDaysInMonth();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={0}>
          {/* Week day headers */}
          {weekDays.map(day => (
            <Grid item xs={12 / 7} key={day}>
              <Box
                sx={{
                  p: 1,
                  textAlign: 'center',
                  borderBottom: 1,
                  borderColor: 'divider',
                  fontWeight: 'bold',
                }}
              >
                {day}
              </Box>
            </Grid>
          ))}
          {/* Calendar days */}
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <Grid item xs={12 / 7} key={index}>
                <Box
                  onClick={() => handleDateClick(day)}
                  sx={{
                    minHeight: 100,
                    p: 1,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: isCurrentMonth ? 'background.paper' : 'grey.50',
                    cursor: 'pointer',
                    position: 'relative',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isToday(day) ? 'bold' : 'normal',
                        color: isToday(day) ? 'primary.main' : 'text.primary',
                        opacity: isCurrentMonth ? 1 : 0.5,
                      }}
                    >
                      {format(day, 'd')}
                    </Typography>
                    {isToday(day) && (
                      <Chip label="Today" size="small" color="primary" />
                    )}
                  </Box>
                  {dayEvents.slice(0, 3).map((event, eventIndex) => {
                    const eventType = getEventTypeConfig(event.type);
                    return (
                      <Box
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                          setOpenEventDialog(true);
                        }}
                        sx={{
                          mb: 0.5,
                          p: 0.5,
                          bgcolor: eventType.color,
                          color: 'white',
                          borderRadius: 0.5,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.8,
                          },
                        }}
                      >
                        <Typography variant="caption" noWrap>
                          {event.startTime && `${event.startTime} `}
                          {event.title}
                        </Typography>
                      </Box>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <Typography variant="caption" color="textSecondary">
                      +{dayEvents.length - 3} more
                    </Typography>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Calendar</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenEventDialog(true)}
        >
          New Event
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Main Calendar */}
        <Grid item xs={12} md={9}>
          {/* Calendar Controls */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <IconButton onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                  <ChevronLeft />
                </IconButton>
                <Typography variant="h6">
                  {format(currentDate, 'MMMM yyyy')}
                </Typography>
                <IconButton onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                  <ChevronRight />
                </IconButton>
                <Button
                  size="small"
                  onClick={() => setCurrentDate(new Date())}
                  startIcon={<Today />}
                >
                  Today
                </Button>
              </Box>
              <Box>
                <Tabs value={viewMode} onChange={(e, v) => setViewMode(v)}>
                  <Tab value="month" label="Month" />
                  <Tab value="week" label="Week" />
                  <Tab value="day" label="Day" />
                </Tabs>
              </Box>
            </Box>
          </Paper>

          {/* Calendar View */}
          {viewMode === 'month' && renderMonthView()}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          {/* Event Types Filter */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Event Types
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">All Events</MenuItem>
                {eventTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {type.icon}
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          {/* Upcoming Events */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Events
            </Typography>
            <List dense>
              {getUpcomingEvents().map(event => {
                const eventType = getEventTypeConfig(event.type);
                const daysUntil = differenceInDays(parseISO(event.date), new Date());
                
                return (
                  <ListItem
                    key={event.id}
                    button
                    onClick={() => {
                      setSelectedEvent(event);
                      setOpenEventDialog(true);
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: eventType.color }}>
                        {eventType.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={event.title}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {format(parseISO(event.date), 'PPP')}
                            {event.startTime && ` at ${event.startTime}`}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {daysUntil === 0 && 'Today'}
                            {daysUntil === 1 && 'Tomorrow'}
                            {daysUntil > 1 && `In ${daysUntil} days`}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Event Dialog */}
      <Dialog
        open={openEventDialog}
        onClose={() => {
          setOpenEventDialog(false);
          setSelectedEvent(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedEvent ? 'Event Details' : 'Create New Event'}
        </DialogTitle>
        <DialogContent>
          {selectedEvent ? (
            // View Event Details
            <Box sx={{ pt: 2 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ bgcolor: getEventTypeConfig(selectedEvent.type).color }}>
                  {getEventTypeConfig(selectedEvent.type).icon}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedEvent.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedEvent.caseName}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarToday fontSize="small" />
                    <Typography>
                      {format(parseISO(selectedEvent.date), 'PPPP')}
                    </Typography>
                  </Box>
                </Grid>
                {selectedEvent.startTime && (
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Schedule fontSize="small" />
                      <Typography>
                        {selectedEvent.startTime}
                        {selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {selectedEvent.location && (
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationOn fontSize="small" />
                      <Typography>{selectedEvent.location}</Typography>
                    </Box>
                  </Grid>
                )}
                {selectedEvent.isVirtual && selectedEvent.meetingLink && (
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <VideoCall fontSize="small" />
                      <Typography
                        component="a"
                        href={selectedEvent.meetingLink}
                        target="_blank"
                        sx={{ color: 'primary.main', textDecoration: 'none' }}
                      >
                        Join Virtual Meeting
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {selectedEvent.description && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      {selectedEvent.description}
                    </Typography>
                  </Grid>
                )}
                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Attendees
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {selectedEvent.attendees.map((attendee, index) => (
                        <Chip
                          key={index}
                          label={attendee}
                          size="small"
                          avatar={<Avatar>{attendee[0]}</Avatar>}
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>

              <Box display="flex" gap={1} mt={3}>
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => {
                    // Would open edit mode
                    showNotification('Edit functionality would be implemented here', 'info');
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => {
                    handleDeleteEvent(selectedEvent);
                    setOpenEventDialog(false);
                    setSelectedEvent(null);
                  }}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          ) : (
            // Create Event Form
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Event Title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  label="Event Type"
                >
                  {eventTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Start Time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="End Time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Related Case</InputLabel>
                <Select
                  value={newEvent.caseId}
                  onChange={(e) => setNewEvent({ ...newEvent, caseId: e.target.value })}
                  label="Related Case"
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="case-001">Smith vs. Johnson</MenuItem>
                  <MenuItem value="case-002">Estate of Williams</MenuItem>
                  <MenuItem value="case-003">ABC Corp vs. XYZ Inc</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Reminder</InputLabel>
                <Select
                  value={newEvent.reminder}
                  onChange={(e) => setNewEvent({ ...newEvent, reminder: Number(e.target.value) })}
                  label="Reminder"
                >
                  <MenuItem value={0}>No reminder</MenuItem>
                  <MenuItem value={15}>15 minutes before</MenuItem>
                  <MenuItem value={30}>30 minutes before</MenuItem>
                  <MenuItem value={60}>1 hour before</MenuItem>
                  <MenuItem value={1440}>1 day before</MenuItem>
                  <MenuItem value={2880}>2 days before</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenEventDialog(false);
            setSelectedEvent(null);
          }}>
            Cancel
          </Button>
          {!selectedEvent && (
            <Button onClick={handleCreateEvent} variant="contained">
              Create Event
            </Button>
          )}
        </DialogActions>
      </Dialog>
            {/* Action Selection Dialog */}      <Dialog open={openActionDialog} onClose={() => setOpenActionDialog(false)} maxWidth="sm" fullWidth>        <DialogTitle>          <Typography variant="h6">            What would you like to create for {clickedDate ? format(clickedDate, "PPPP") : ""}?          </Typography>        </DialogTitle>        <DialogContent>          <Grid container spacing={2} sx={{ mt: 1 }}>            <Grid item xs={6}>              <Card                 sx={{                   cursor: "pointer",                   "&:hover": { bgcolor: "action.hover", borderColor: "primary.main" },                  border: "2px solid transparent"                }}                onClick={handleCreateNewCase}              >                <CardContent sx={{ textAlign: "center", py: 3 }}>                  <Gavel sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />                  <Typography variant="h6" gutterBottom>New Case</Typography>                  <Typography variant="body2" color="text.secondary">                    Create a new litigation case with court dates and deadlines                  </Typography>                </CardContent>              </Card>            </Grid>            <Grid item xs={6}>              <Card                 sx={{                   cursor: "pointer",                  "&:hover": { bgcolor: "action.hover", borderColor: "primary.main" },                  border: "2px solid transparent"                }}                onClick={handleCreateNewEvent}              >                <CardContent sx={{ textAlign: "center", py: 3 }}>                  <Event sx={{ fontSize: 48, color: "secondary.main", mb: 2 }} />                  <Typography variant="h6" gutterBottom>New Event</Typography>                  <Typography variant="body2" color="text.secondary">                    Schedule a meeting, deadline, or other calendar event                  </Typography>                </CardContent>              </Card>            </Grid>          </Grid>        </DialogContent>        <DialogActions>          <Button onClick={() => setOpenActionDialog(false)}>Cancel</Button>        </DialogActions>      </Dialog>
    </Box>
  );
};

export default Calendar;