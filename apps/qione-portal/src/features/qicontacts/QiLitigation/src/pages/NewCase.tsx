import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  IconButton,
  Autocomplete,
} from '@mui/material';
import { ArrowBack, Save, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { getConfig } from '../utils/config';

interface Client {
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Attorney {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
}

const NewCase: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [clients, setClients] = useState<Client[]>([]);
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    caseNumber: '',
    clientId: '',
    assignedAttorneyId: '',
    practiceArea: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    description: '',
    estimatedValue: '',
    courtName: '',
    opposingCounsel: '',
    opposingCounselContact: '',
  });

  useEffect(() => {
    fetchClients();
    fetchAttorneys();
  }, []);

  const fetchClients = async () => {
    try {
      const config = getConfig();
      const tokensStr = localStorage.getItem('demoTokens');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (tokensStr) {
        const tokens = JSON.parse(tokensStr);
        headers['Authorization'] = `Bearer ${tokens.accessToken}`;
      }
      
      const response = await fetch(`${config.apiEndpoint}/clients`, { headers });
      const data = await response.json();
      if (data.success) {
        setClients(data.data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchAttorneys = async () => {
    try {
      const config = getConfig();
      const tokensStr = localStorage.getItem('demoTokens');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (tokensStr) {
        const tokens = JSON.parse(tokensStr);
        headers['Authorization'] = `Bearer ${tokens.accessToken}`;
      }
      
      const response = await fetch(`${config.apiEndpoint}/attorneys`, { headers });
      const data = await response.json();
      if (data.success) {
        setAttorneys(data.data.filter((a: Attorney) => ['attorney', 'partner'].includes(a.role)));
      }
    } catch (error) {
      console.error('Error fetching attorneys:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config = getConfig();
      const tokensStr = localStorage.getItem('demoTokens');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (tokensStr) {
        const tokens = JSON.parse(tokensStr);
        headers['Authorization'] = `Bearer ${tokens.accessToken}`;
      }

      // Generate case number if not provided
      const caseNumber = formData.caseNumber || `CASE-${Date.now()}`;

      const response = await fetch(`${config.apiEndpoint}/cases`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...formData,
          caseNumber,
          estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : 0,
        }),
      });

      const data = await response.json();
      if (data.success) {
        showNotification('Case created successfully', 'success');
        navigate(`/cases/${data.data.caseId}`);
      } else {
        showNotification(data.error?.message || 'Failed to create case', 'error');
      }
    } catch (error) {
      showNotification('Error creating case', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const practiceAreas = [
    'Personal Injury',
    'Corporate Law',
    'Estate Planning',
    'Real Estate',
    'Criminal Defense',
    'Family Law',
    'Employment Law',
    'Intellectual Property',
    'Immigration',
    'Bankruptcy',
    'Tax Law',
    'Civil Rights',
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/cases')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">Create New Case</Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Case Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Case Title"
                    value={formData.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Case Number"
                    value={formData.caseNumber}
                    onChange={(e) => handleFieldChange('caseNumber', e.target.value)}
                    placeholder="Auto-generated if empty"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={clients}
                    getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.email})`}
                    value={clients.find(c => c.clientId === formData.clientId) || null}
                    onChange={(_, newValue) => handleFieldChange('clientId', newValue?.clientId || '')}
                    renderInput={(params) => (
                      <TextField {...params} label="Client" required />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Assigned Attorney</InputLabel>
                    <Select
                      value={formData.assignedAttorneyId}
                      onChange={(e: SelectChangeEvent) => handleFieldChange('assignedAttorneyId', e.target.value)}
                      label="Assigned Attorney"
                    >
                      {attorneys.map((attorney) => (
                        <MenuItem key={attorney.userId} value={attorney.userId}>
                          {attorney.firstName} {attorney.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required>
                    <InputLabel>Practice Area</InputLabel>
                    <Select
                      value={formData.practiceArea}
                      onChange={(e: SelectChangeEvent) => handleFieldChange('practiceArea', e.target.value)}
                      label="Practice Area"
                    >
                      {practiceAreas.map((area) => (
                        <MenuItem key={area} value={area}>
                          {area}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e: SelectChangeEvent) => handleFieldChange('status', e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="PENDING">Pending</MenuItem>
                      <MenuItem value="ACTIVE">Active</MenuItem>
                      <MenuItem value="DISCOVERY">Discovery</MenuItem>
                      <MenuItem value="NEGOTIATION">Negotiation</MenuItem>
                      <MenuItem value="TRIAL">Trial</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={formData.priority}
                      onChange={(e: SelectChangeEvent) => handleFieldChange('priority', e.target.value)}
                      label="Priority"
                    >
                      <MenuItem value="LOW">Low</MenuItem>
                      <MenuItem value="MEDIUM">Medium</MenuItem>
                      <MenuItem value="HIGH">High</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Case Description"
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    required
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Additional Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Estimated Value ($)"
                    type="number"
                    value={formData.estimatedValue}
                    onChange={(e) => handleFieldChange('estimatedValue', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Court Name"
                    value={formData.courtName}
                    onChange={(e) => handleFieldChange('courtName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Opposing Counsel"
                    value={formData.opposingCounsel}
                    onChange={(e) => handleFieldChange('opposingCounsel', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Opposing Counsel Contact"
                    value={formData.opposingCounselContact}
                    onChange={(e) => handleFieldChange('opposingCounselContact', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => navigate('/cases')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={loading}
              >
                Create Case
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default NewCase;