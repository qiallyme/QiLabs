import React, { useState, useEffect } from 'react';
import {
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
  IconButton,
} from '@mui/material';
import {
  CalendarToday,
  Add,
  Event,
  Gavel,
  ChevronLeft,
  ChevronRight,
  Today,
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
  parseISO,
} from 'date-fns';
import { useNotification } from '../contexts/NotificationContext';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'COURT_DATE' | 'DEADLINE' | 'MEETING' | 'OTHER';
  date: string;
  startTime?: string;
  status: 'SCHEDULED' | 'COMPLETED';
}

const CalendarEnhanced: React.FC = () => {
  const { showNotification } = useNotification();
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [openNewCaseDialog, setOpenNewCaseDialog] = useState(false);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  
  const [newCase, setNewCase] = useState({
    caseNumber: '',
    title: '',
    type: 'civil',
    clientName: '',
    dateOpened: '',
  });

  // Enhanced date click handler
  const handleDateClick = (date: Date) => {
    const dayEvents = events.filter(event => 
      isSameDay(parseISO(event.date), date)
    );
    
    setSelectedDate(date);
    setClickedDate(date);
    
    // If empty date, show creation options
    if (dayEvents.length === 0) {
      setOpenActionDialog(true);
    }
  };

  const handleCreateNewCase = () => {
    setOpenActionDialog(false);
    setNewCase({
      ...newCase,
      dateOpened: clickedDate ? format(clickedDate, 'yyyy-MM-dd') : ''
    });
    setOpenNewCaseDialog(true);
  };

  const handleCreateNewEvent = () => {
    setOpenActionDialog(false);
    showNotification("Event creation feature coming soon!", "info");
  };

  const handleSubmitCase = () => {
    if (!newCase.caseNumber || !newCase.title || !newCase.clientName) {
      showNotification('Please fill in all required fields', 'warning');
      return;
    }
    
    console.log('Creating case:', newCase);
    showNotification(`Case '${newCase.title}' created successfully!`, 'success');
    
    setNewCase({ caseNumber: '', title: '', type: 'civil', clientName: '', dateOpened: '' });
    setOpenNewCaseDialog(false);
  };

  // Mock events
  useEffect(() => {
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Smith vs. Johnson - Trial',
        type: 'COURT_DATE',
        date: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
        startTime: '09:00',
        status: 'SCHEDULED',
      }
    ];
    setEvents(mockEvents);
  }, []);

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Week headers
    const weekHeaders = (
      <Grid container key="headers">
        {weekDays.map((dayName) => (
          <Grid item xs={12 / 7} key={dayName}>
            <Box sx={{ p: 1, textAlign: 'center', fontWeight: 'bold', bgcolor: 'grey.100' }}>
              {dayName}
            </Box>
          </Grid>
        ))}
      </Grid>
    );

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dayEvents = events.filter(event => 
          isSameDay(parseISO(event.date), day)
        );
        
        const isCurrentMonth = isSameMonth(day, currentDate);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const currentDay = new Date(day);

        days.push(
          <Grid item xs={12 / 7} key={day.toString()}>
            <Box
              onClick={() => handleDateClick(currentDay)}
              sx={{
                minHeight: 80,
                p: 1,
                border: 1,
                borderColor: isSelected ? 'primary.main' : 'divider',
                bgcolor: isCurrentMonth ? 'background.paper' : 'grey.50',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: isCurrentMonth ? 'text.primary' : 'text.secondary',
                    fontWeight: isToday(currentDay) ? 'bold' : 'normal',
                  }}
                >
                  {format(currentDay, 'd')}
                </Typography>
                {isToday(currentDay) && (
                  <Chip label="Today" size="small" color="primary" />
                )}
              </Box>
              
              {dayEvents.map((event) => (
                <Box
                  key={event.id}
                  sx={{
                    mb: 0.5,
                    p: 0.5,
                    bgcolor: event.type === 'COURT_DATE' ? 'error.main' : 'warning.main',
                    color: 'white',
                    borderRadius: 0.5,
                    fontSize: '0.7rem',
                  }}
                >
                  <Typography variant="caption" noWrap>
                    {event.startTime && `${event.startTime} `}
                    {event.title}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        );
        day = addDays(day, 1);
      }

      if (days.length === 7) {
        rows.push(
          <Grid container key={day.toString()}>
            {days}
          </Grid>
        );
        days = [];
      }
    }

    return (
      <Paper sx={{ p: 1 }}>
        {weekHeaders}
        {rows}
      </Paper>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Calendar - Enhanced</Typography>
        <Button variant="contained" startIcon={<Add />}>
          New Event
        </Button>
      </Box>

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
        </Box>
      </Paper>

      {renderMonthView()}

      {/* Action Selection Dialog */}
      <Dialog open={openActionDialog} onClose={() => setOpenActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Create for {clickedDate ? format(clickedDate, 'PPPP') : ''}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
                  border: '2px solid transparent'
                }}
                onClick={handleCreateNewCase}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Gavel sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">New Case</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create litigation case
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover', borderColor: 'secondary.main' },
                  border: '2px solid transparent'
                }}
                onClick={handleCreateNewEvent}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Event sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h6">New Event</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Schedule meeting/deadline
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenActionDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* New Case Dialog */}
      <Dialog open={openNewCaseDialog} onClose={() => setOpenNewCaseDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Gavel color="primary" />
            Create New Case
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Case Number"
                value={newCase.caseNumber}
                onChange={(e) => setNewCase({ ...newCase, caseNumber: e.target.value })}
                placeholder="2024-CV-001"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Case Type</InputLabel>
                <Select
                  value={newCase.type}
                  label="Case Type"
                  onChange={(e) => setNewCase({ ...newCase, type: e.target.value })}
                >
                  <MenuItem value="civil">Civil Litigation</MenuItem>
                  <MenuItem value="criminal">Criminal Defense</MenuItem>
                  <MenuItem value="family">Family Law</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Case Title"
                value={newCase.title}
                onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                placeholder="Smith v. Johnson"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Client Name"
                value={newCase.clientName}
                onChange={(e) => setNewCase({ ...newCase, clientName: e.target.value })}
                placeholder="John Smith"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date Opened"
                value={newCase.dateOpened}
                onChange={(e) => setNewCase({ ...newCase, dateOpened: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewCaseDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitCase} 
            variant="contained"
            disabled={!newCase.caseNumber || !newCase.title || !newCase.clientName}
          >
            Create Case
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarEnhanced;
