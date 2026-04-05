import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Tooltip,
} from '@mui/material';
import { 
  Add, 
  Gavel, 
  Assignment, 
  Schedule, 
  AccountBalance,
  Warning,
  CheckCircle,
  AccessTime,
  Business,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

interface LitigationPhase {
  name: string;
  status: 'completed' | 'in_progress' | 'upcoming' | 'blocked';
  startDate?: string;
  endDate?: string;
  progress: number;
  key: string;
  deadlines?: Deadline[];
}

interface Deadline {
  title: string;
  date: string;
  type: 'motion' | 'discovery' | 'filing' | 'hearing';
  statute?: string;
  daysUntil: number;
  priority: 'critical' | 'high' | 'medium';
}

interface LitigationCase {
  caseId: string;
  caseNumber: string;
  title: string;
  status: 'active' | 'pending' | 'closed';
  priority: 'high' | 'medium' | 'low';
  clientName: string;
  assignedAttorney: string;
  practiceArea: string;
  dateOpened: string;
  currentPhase: string;
  phases: LitigationPhase[];
  nextDeadline?: Deadline;
  criticalDeadlines: Deadline[];
}

const LitigationCases: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<LitigationCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      // Mock litigation cases with Gantt data
      const mockCases: LitigationCase[] = [
        {
          caseId: '1',
          caseNumber: '2024-CV-001',
          title: 'Smith v. Johnson',
          status: 'active',
          priority: 'high',
          clientName: 'John Smith',
          assignedAttorney: 'Sarah Mitchell',
          practiceArea: 'Personal Injury',
          dateOpened: '2024-01-15',
          currentPhase: 'Discovery',
          nextDeadline: {
            title: 'Motion to Dismiss Due',
            date: '2025-08-12',
            type: 'motion',
            statute: 'Fed. R. Civ. P. 12(b)(6)',
            daysUntil: 4,
            priority: 'critical'
          },
          criticalDeadlines: [
            {
              title: 'Motion to Dismiss Due',
              date: '2025-08-12',
              type: 'motion',
              statute: 'Fed. R. Civ. P. 12(b)(6)',
              daysUntil: 4,
              priority: 'critical'
            },
            {
              title: 'Discovery Cutoff',
              date: '2025-09-15',
              type: 'discovery',
              statute: 'Fed. R. Civ. P. 26(f)',
              daysUntil: 38,
              priority: 'high'
            }
          ],
          phases: [
            {
              name: 'Pleadings',
              status: 'completed',
              progress: 100,
              key: 'pleadings',
              startDate: '2024-01-15',
              endDate: '2024-03-01'
            },
            {
              name: 'Discovery',
              status: 'in_progress',
              progress: 60,
              key: 'discovery',
              startDate: '2024-03-01',
              deadlines: [
                {
                  title: 'Interrogatories Due',
                  date: '2025-08-15',
                  type: 'discovery',
                  daysUntil: 7,
                  priority: 'high'
                }
              ]
            },
            {
              name: 'Motion Practice',
              status: 'upcoming',
              progress: 0,
              key: 'motions'
            },
            {
              name: 'Trial Prep',
              status: 'upcoming',
              progress: 0,
              key: 'trial_prep'
            },
            {
              name: 'Trial',
              status: 'upcoming',
              progress: 0,
              key: 'trial'
            }
          ]
        },
        {
          caseId: '2',
          caseNumber: '2024-CV-002',
          title: 'Brown Industries LLC v. Manufacturing Co',
          status: 'active',
          priority: 'high',
          clientName: 'Brown Industries LLC',
          assignedAttorney: 'John Davidson',
          practiceArea: 'Contract Dispute',
          dateOpened: '2024-02-01',
          currentPhase: 'Motion Practice',
          nextDeadline: {
            title: 'Discovery Response',
            date: '2025-08-14',
            type: 'discovery',
            statute: 'Fed. R. Civ. P. 26(a)',
            daysUntil: 6,
            priority: 'high'
          },
          criticalDeadlines: [
            {
              title: 'Discovery Response',
              date: '2025-08-14',
              type: 'discovery',
              statute: 'Fed. R. Civ. P. 26(a)',
              daysUntil: 6,
              priority: 'high'
            }
          ],
          phases: [
            {
              name: 'Pleadings',
              status: 'completed',
              progress: 100,
              key: 'pleadings',
              startDate: '2024-02-01',
              endDate: '2024-04-01'
            },
            {
              name: 'Discovery',
              status: 'completed',
              progress: 100,
              key: 'discovery',
              startDate: '2024-04-01',
              endDate: '2024-07-01'
            },
            {
              name: 'Motion Practice',
              status: 'in_progress',
              progress: 40,
              key: 'motions',
              startDate: '2024-07-01'
            },
            {
              name: 'Trial Prep',
              status: 'upcoming',
              progress: 0,
              key: 'trial_prep'
            },
            {
              name: 'Trial',
              status: 'upcoming',
              progress: 0,
              key: 'trial'
            }
          ]
        }
      ];

      setCases(mockCases);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching litigation cases:', error);
      setLoading(false);
    }
  };

  const getPhaseColor = (status: string, progress: number) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'in_progress': return progress > 50 ? '#2196f3' : '#ff9800';
      case 'upcoming': return '#e0e0e0';
      case 'blocked': return '#f44336';
      default: return '#e0e0e0';
    }
  };

  const getPhaseIcon = (key: string) => {
    switch (key) {
      case 'pleadings': return <Gavel />;
      case 'discovery': return <Assignment />;
      case 'motions': return <AccountBalance />;
      case 'trial_prep': return <Schedule />;
      case 'trial': return <Business />;
      default: return <AccessTime />;
    }
  };

  const getPriorityColor = (priority: 'critical' | 'high' | 'medium') => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'default';
    }
  };

  const formatDaysUntilDue = (days: number) => {
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due Today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <Typography>Loading litigation cases...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Litigation Case Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/cases/new')}
        >
          New Case
        </Button>
      </Box>

      {/* Cases with Gantt Timeline View */}
      <Grid container spacing={3}>
        {cases.map((caseItem) => (
          <Grid item xs={12} key={caseItem.caseId}>
            <Paper sx={{ p: 3 }}>
              {/* Case Header */}
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {caseItem.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Case #:</strong> {caseItem.caseNumber} | <strong>Client:</strong> {caseItem.clientName}
                  </Typography>
                  <Box display="flex" gap={1} mt={1}>
                    <Chip 
                      label={caseItem.status} 
                      color={caseItem.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip 
                      label={`Priority: ${caseItem.priority}`}
                      color={getPriorityColor(caseItem.priority as any)}
                      size="small"
                    />
                    <Chip 
                      label={`Current: ${caseItem.currentPhase}`}
                      color="primary"
                      size="small"
                    />
                  </Box>
                </Box>
                
                {/* Next Critical Deadline */}
                {caseItem.nextDeadline && (
                  <Card variant="outlined" sx={{ minWidth: 250 }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="subtitle2" color="error" gutterBottom>
                        ⚠️ Next Critical Deadline
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {caseItem.nextDeadline.title}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {caseItem.nextDeadline.statute}
                      </Typography>
                      <Chip 
                        label={formatDaysUntilDue(caseItem.nextDeadline.daysUntil)}
                        color={getPriorityColor(caseItem.nextDeadline.priority)}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Litigation Timeline - Gantt Style */}
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule /> Litigation Timeline & Phases
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                {caseItem.phases.map((phase, index) => (
                  <Box key={phase.key} sx={{ mb: 3 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: getPhaseColor(phase.status, phase.progress), width: 32, height: 32 }}>
                          {getPhaseIcon(phase.key)}
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {phase.name}
                        </Typography>
                        <Chip 
                          label={phase.status.replace('_', ' ')}
                          color={phase.status === 'completed' ? 'success' : phase.status === 'in_progress' ? 'primary' : 'default'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        {phase.progress}% Complete
                      </Typography>
                    </Box>

                    {/* Progress Bar - Gantt Style */}
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={phase.progress}
                        sx={{
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: '#f5f5f5',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getPhaseColor(phase.status, phase.progress),
                            borderRadius: 6,
                          },
                        }}
                      />
                    </Box>

                    {/* Phase Details */}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        {phase.startDate && (
                          <Typography variant="caption" color="textSecondary">
                            Started: {new Date(phase.startDate).toLocaleDateString()}
                            {phase.endDate && ` - Ended: ${new Date(phase.endDate).toLocaleDateString()}`}
                          </Typography>
                        )}
                      </Box>
                      
                      {/* Phase-specific Deadlines */}
                      {phase.deadlines && phase.deadlines.length > 0 && (
                        <Box display="flex" gap={1}>
                          {phase.deadlines.map((deadline, idx) => (
                            <Tooltip key={idx} title={`${deadline.title} - ${deadline.date}`}>
                              <Chip
                                label={formatDaysUntilDue(deadline.daysUntil)}
                                color={getPriorityColor(deadline.priority)}
                                size="small"
                                icon={deadline.priority === 'critical' ? <Warning /> : <AccessTime />}
                              />
                            </Tooltip>
                          ))}
                        </Box>
                      )}
                    </Box>

                    {/* Statute-Driven Requirements */}
                    {phase.status === 'in_progress' && (
                      <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                        <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                          <strong>Statutory Requirements for {phase.name} Phase:</strong>
                        </Typography>
                        <Typography variant="body2">
                          {phase.key === 'discovery' && '• Fed. R. Civ. P. 26(a) - Initial Disclosures • Fed. R. Civ. P. 30 - Depositions'}
                          {phase.key === 'motions' && '• Fed. R. Civ. P. 12 - Motions to Dismiss • Fed. R. Civ. P. 56 - Summary Judgment'}
                          {phase.key === 'pleadings' && '• Fed. R. Civ. P. 8 - Claims for Relief • Fed. R. Civ. P. 11 - Signing Pleadings'}
                          {phase.key === 'trial_prep' && '• Fed. R. Civ. P. 16 - Pretrial Conferences • Local Court Rules'}
                        </Typography>
                      </Box>
                    )}

                    {index < caseItem.phases.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </Box>

              {/* Critical Deadlines Summary */}
              {caseItem.criticalDeadlines.length > 0 && (
                <Box sx={{ mt: 3, p: 2, border: 1, borderColor: 'warning.main', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="warning.main" gutterBottom>
                    📅 All Critical Deadlines for this Case
                  </Typography>
                  <List dense>
                    {caseItem.criticalDeadlines.map((deadline, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5 }}>
                        <ListItemAvatar sx={{ minWidth: 32 }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: 'warning.main' }}>
                            <Warning sx={{ fontSize: 14 }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={deadline.title}
                          secondary={`${deadline.date} (${formatDaysUntilDue(deadline.daysUntil)}) - ${deadline.statute || 'Court Rule'}`}
                        />
                        <Chip 
                          label={deadline.priority}
                          color={getPriorityColor(deadline.priority)}
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default LitigationCases;
