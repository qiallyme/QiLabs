import React from 'react';
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
  ListItemIcon,
  LinearProgress,
  Chip
} from '@mui/material';
import { 
  Storage, 
  Speed, 
  Security, 
  Cloud, 
  CheckCircle,
  Warning,
  Error
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const System: React.FC = () => {
  const { user } = useAuth();

  if (user?.role !== 'master') {
    return (
      <Box>
        <Typography variant="h4">Access Denied</Typography>
        <Typography>This page is only accessible to system administrators.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>System Administration</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>System Status</Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="API Server" 
                  secondary="All services operational"
                />
                <Chip label="Healthy" color="success" size="small" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Database" 
                  secondary="99.9% uptime"
                />
                <Chip label="Healthy" color="success" size="small" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Warning color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="Storage" 
                  secondary="75% capacity used"
                />
                <Chip label="Warning" color="warning" size="small" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>System Metrics</Typography>
            <Box mb={3}>
              <Typography variant="body2" color="textSecondary">CPU Usage</Typography>
              <LinearProgress variant="determinate" value={45} sx={{ mb: 1 }} />
              <Typography variant="caption">45%</Typography>
            </Box>
            <Box mb={3}>
              <Typography variant="body2" color="textSecondary">Memory Usage</Typography>
              <LinearProgress variant="determinate" value={62} sx={{ mb: 1 }} />
              <Typography variant="caption">62%</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">Storage Usage</Typography>
              <LinearProgress variant="determinate" value={75} color="warning" sx={{ mb: 1 }} />
              <Typography variant="caption">75%</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>System Configuration</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Storage sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">Storage</Typography>
                    <Typography variant="body2" color="textSecondary">
                      AWS S3 Buckets
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Speed sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">Performance</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Auto-scaling enabled
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Security sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">Security</Typography>
                    <Typography variant="body2" color="textSecondary">
                      SSL/TLS enabled
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Cloud sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">Backup</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Daily automated
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default System;