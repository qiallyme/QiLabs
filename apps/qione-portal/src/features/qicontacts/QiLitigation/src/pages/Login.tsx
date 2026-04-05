import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Grid,
  Chip,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Gavel,
  AdminPanelSettings,
  AccountBalance,
  Person,
  Work
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { getDemoAccounts } from '../utils/rbac';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = getDemoAccounts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      showNotification('Login successful!', 'success');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password');
      showNotification('Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    try {
      await login(demoEmail, demoPassword);
      showNotification('Demo login successful!', 'success');
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Demo login failed');
      showNotification('Demo login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'master':
        return <AdminPanelSettings />;
      case 'partner':
        return <AccountBalance />;
      case 'attorney':
        return <Person />;
      case 'paralegal':
        return <Work />;
      default:
        return <Person />;
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Gavel sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography component="h1" variant="h4" fontWeight="bold">
              Litigation Management System
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Secure Legal Practice Platform
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Or try a demo account
            </Typography>
          </Divider>

          <Grid container spacing={1}>
            {demoAccounts.map((account) => (
              <Grid item xs={12} key={account.role}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  startIcon={getRoleIcon(account.role)}
                  onClick={() => handleDemoLogin(account.email, account.password)}
                  disabled={loading}
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    px: 2,
                    py: 1,
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {account.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {account.description}
                    </Typography>
                  </Box>
                  <Chip 
                    label={account.role.toUpperCase()} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                </Button>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="caption" color="info.contrastText">
              <strong>Note:</strong> Demo accounts showcase different permission levels. Master account has full system access.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;