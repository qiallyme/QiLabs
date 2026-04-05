import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Card,
  CardContent,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Notifications,
  Email,
  Sms,
  DesktopWindows,
  Save,
  Security,
  Language,
  Palette,
  Schedule,
  Business,
  Person,
  Gavel,
  CloudUpload,
  Download,
  Restore,
} from '@mui/icons-material';
import { getConfig } from '../utils/config';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface SettingsData {
  theme: string;
  notifications: {
    email: boolean;
    sms: boolean;
    desktop: boolean;
  };
  defaultView: string;
  timeZone: string;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState<SettingsData>({
    theme: 'light',
    notifications: {
      email: true,
      sms: false,
      desktop: true,
    },
    defaultView: 'dashboard',
    timeZone: 'America/Los_Angeles',
  });
  const [saving, setSaving] = useState(false);

  // Profile form
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: '',
    barNumber: '',
    lawFirmName: 'Demo Law Firm',
  });

  // Security settings
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
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
      
      const response = await fetch(`${config.apiEndpoint}/settings/preferences`, { headers });
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
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
      
      const response = await fetch(`${config.apiEndpoint}/settings/preferences`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (data.success) {
        showNotification('Settings saved successfully', 'success');
      }
    } catch (error) {
      showNotification('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="General" icon={<Business />} iconPosition="start" />
          <Tab label="Profile" icon={<Person />} iconPosition="start" />
          <Tab label="Notifications" icon={<Notifications />} iconPosition="start" />
          <Tab label="Security" icon={<Security />} iconPosition="start" />
          <Tab label="Data Management" icon={<CloudUpload />} iconPosition="start" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* General Settings Tab */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Palette sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Appearance
                    </Typography>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel>Theme</InputLabel>
                      <Select
                        value={settings.theme}
                        onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                        label="Theme"
                      >
                        <MenuItem value="light">Light</MenuItem>
                        <MenuItem value="dark">Dark</MenuItem>
                        <MenuItem value="auto">Auto (System)</MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Regional Settings
                    </Typography>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel>Time Zone</InputLabel>
                      <Select
                        value={settings.timeZone}
                        onChange={(e) => setSettings({ ...settings, timeZone: e.target.value })}
                        label="Time Zone"
                      >
                        <MenuItem value="America/New_York">Eastern Time</MenuItem>
                        <MenuItem value="America/Chicago">Central Time</MenuItem>
                        <MenuItem value="America/Denver">Mountain Time</MenuItem>
                        <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Gavel sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Legal Preferences
                    </Typography>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel>Default View</InputLabel>
                      <Select
                        value={settings.defaultView}
                        onChange={(e) => setSettings({ ...settings, defaultView: e.target.value })}
                        label="Default View"
                      >
                        <MenuItem value="dashboard">Dashboard</MenuItem>
                        <MenuItem value="cases">Cases</MenuItem>
                        <MenuItem value="calendar">Calendar</MenuItem>
                        <MenuItem value="tasks">Tasks</MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveSettings}
                  disabled={saving}
                >
                  Save General Settings
                </Button>
              </Grid>
            </Grid>
          )}

          {/* Profile Tab */}
          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bar Number"
                  value={profile.barNumber}
                  onChange={(e) => setProfile({ ...profile, barNumber: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Law Firm"
                  value={profile.lawFirmName}
                  disabled
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={() => showNotification('Profile updated successfully', 'success')}
                >
                  Update Profile
                </Button>
              </Grid>
            </Grid>
          )}

          {/* Notifications Tab */}
          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Notification Preferences
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Email Notifications"
                          secondary="Receive case updates and reminders via email"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.notifications.email}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                notifications: {
                                  ...settings.notifications,
                                  email: e.target.checked,
                                },
                              })
                            }
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="SMS Notifications"
                          secondary="Receive urgent alerts via text message"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.notifications.sms}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                notifications: {
                                  ...settings.notifications,
                                  sms: e.target.checked,
                                },
                              })
                            }
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Desktop Notifications"
                          secondary="Show browser notifications for important updates"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.notifications.desktop}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                notifications: {
                                  ...settings.notifications,
                                  desktop: e.target.checked,
                                },
                              })
                            }
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveSettings}
                  disabled={saving}
                >
                  Save Notification Settings
                </Button>
              </Grid>
            </Grid>
          )}

          {/* Security Tab */}
          {tabValue === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Security Settings
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Two-Factor Authentication"
                          secondary="Add an extra layer of security to your account"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={security.twoFactorEnabled}
                            onChange={(e) =>
                              setSecurity({ ...security, twoFactorEnabled: e.target.checked })
                            }
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText primary="Session Timeout" />
                        <TextField
                          type="number"
                          value={security.sessionTimeout}
                          onChange={(e) =>
                            setSecurity({ ...security, sessionTimeout: parseInt(e.target.value) })
                          }
                          InputProps={{ endAdornment: 'minutes' }}
                          sx={{ width: 150 }}
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText primary="Password Expiry" />
                        <TextField
                          type="number"
                          value={security.passwordExpiry}
                          onChange={(e) =>
                            setSecurity({ ...security, passwordExpiry: parseInt(e.target.value) })
                          }
                          InputProps={{ endAdornment: 'days' }}
                          sx={{ width: 150 }}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  For additional security settings, please contact your system administrator.
                </Alert>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={() => showNotification('Security settings updated', 'success')}
                >
                  Save Security Settings
                </Button>
              </Grid>
            </Grid>
          )}

          {/* Data Management Tab */}
          {tabValue === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <CloudUpload sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Export Data
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      Export your cases, clients, and documents for backup or migration
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => showNotification('Export started. You will receive an email when complete.', 'info')}
                      fullWidth
                    >
                      Export All Data
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Restore sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Backup & Restore
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      Automatic backups are performed daily at 2:00 AM
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Restore />}
                      onClick={() => showNotification('Please contact support for data restoration', 'info')}
                      fullWidth
                    >
                      Request Restore
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings;