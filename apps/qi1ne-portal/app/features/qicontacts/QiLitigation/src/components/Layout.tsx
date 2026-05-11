import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  InputAdornment,
  ListItemSecondaryAction,
  Chip,
  FormControl,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Gavel,
  People,
  Description,
  Assignment,
  AccountCircle,
  Settings,
  Logout,
  Notifications,
  Search,
  SmartToy,
  CalendarToday,
  Receipt,
  NotificationsNone,
  Warning,
  Info,
  CheckCircle,
  Schedule,
  MarkEmailRead,
  Add,
  PersonAdd,
  AccountBalance,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import AIAssistantPanel, { AIAssistantFAB } from './AIAssistantPanel';
import { getMenuItemsForRole, isRoleAtLeast } from '../utils/rbac';
import { Business, AdminPanelSettings, Security } from '@mui/icons-material';

const drawerWidth = 240;

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [selectedFirmId, setSelectedFirmId] = useState<string>(() => {
    // Initialize from saved user data
    const savedUser = localStorage.getItem('demoUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      console.log('Layout: Initializing selectedFirmId from localStorage:', userData.selectedFirmId);
      return userData.selectedFirmId || 'firm-001';
    }
    console.log('Layout: No saved user, defaulting to firm-001');
    return user?.selectedFirmId || 'firm-001';
  });

  // Mock firms data for Master account
  const firms = [
    { id: 'firm-001', name: 'Davidson & Associates' },
    { id: 'firm-002', name: 'Smith Legal Partners' },
    { id: 'firm-003', name: 'Wilson & Chen Law Group' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleFirmChange = (event: SelectChangeEvent) => {
    const newFirmId = event.target.value;
    console.log('Firm change requested:', newFirmId);
    setSelectedFirmId(newFirmId);
    
    // Update user context with selected firm
    if (user) {
      const updatedUser = { ...user, selectedFirmId: newFirmId, lawFirmId: newFirmId };
      console.log('Updating localStorage with:', updatedUser);
      localStorage.setItem('demoUser', JSON.stringify(updatedUser));
      // In a real app, this would update the auth context
      // For now, refresh the page to apply the change
      window.location.reload();
    }
  };

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'deadline',
      title: 'Upcoming Deadline',
      message: 'Smith vs. Johnson - Initial complaint due in 2 days',
      time: '2 hours ago',
      read: false,
      icon: <Schedule color="warning" />,
    },
    {
      id: 2,
      type: 'task',
      title: 'Task Assigned',
      message: 'Review medical records for case #2024-0001',
      time: '5 hours ago',
      read: false,
      icon: <Assignment color="info" />,
    },
    {
      id: 3,
      type: 'case',
      title: 'Case Update',
      message: 'Discovery phase started for ABC Corp vs. XYZ Inc',
      time: '1 day ago',
      read: true,
      icon: <Gavel color="primary" />,
    },
    {
      id: 4,
      type: 'document',
      title: 'Document Uploaded',
      message: 'New document added to Estate of Williams case',
      time: '2 days ago',
      read: true,
      icon: <Description color="action" />,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Search functionality
  const handleSearchOpen = () => {
    setSearchOpen(true);
    // Focus the input after a short delay to ensure the dialog is rendered
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearch = (result: any) => {
    handleSearchClose();
    navigate(result.path);
  };

  // Mock search results
  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];
    
    const allResults = [
      // Cases
      { type: 'case', title: 'Smith vs. Johnson', subtitle: 'Case #2024-0001 - Personal Injury', path: '/cases/case-001', icon: <Gavel /> },
      { type: 'case', title: 'Estate of Williams', subtitle: 'Case #2024-0002 - Probate', path: '/cases/case-002', icon: <Gavel /> },
      { type: 'case', title: 'ABC Corp vs. XYZ Inc', subtitle: 'Case #2024-0003 - Contract Dispute', path: '/cases/case-003', icon: <Gavel /> },
      
      // Clients
      { type: 'client', title: 'John Smith', subtitle: 'Client - john.smith@email.com', path: '/clients/client-001', icon: <People /> },
      { type: 'client', title: 'Mary Williams', subtitle: 'Client - mary.williams@email.com', path: '/clients/client-002', icon: <People /> },
      { type: 'client', title: 'ABC Corporation', subtitle: 'Client - legal@abccorp.com', path: '/clients/client-003', icon: <People /> },
      
      // Documents
      { type: 'document', title: 'Complaint_Smith_v_Johnson.pdf', subtitle: 'Legal Document - Smith vs. Johnson', path: '/documents', icon: <Description /> },
      { type: 'document', title: 'Medical_Records_John_Smith.pdf', subtitle: 'Medical Records - Smith vs. Johnson', path: '/documents', icon: <Description /> },
      
      // Tasks
      { type: 'task', title: 'File initial complaint', subtitle: 'Task - Due Feb 15, 2024', path: '/tasks', icon: <Assignment /> },
      { type: 'task', title: 'Review medical records', subtitle: 'Task - In Progress', path: '/tasks', icon: <Assignment /> },
      
      // Pages
      { type: 'page', title: 'Calendar', subtitle: 'View court dates and deadlines', path: '/calendar', icon: <CalendarToday /> },
      { type: 'page', title: 'Billing', subtitle: 'Time tracking and invoices', path: '/billing', icon: <Receipt /> },
      { type: 'page', title: 'AI Assistant', subtitle: 'Legal research assistant', path: '/ai-assistant', icon: <SmartToy /> },
      { type: 'page', title: 'Attorneys', subtitle: 'Manage firm attorneys', path: '/attorneys', icon: <AccountBalance /> },
    ];

    const query = searchQuery.toLowerCase();
    return allResults.filter(result => 
      result.title.toLowerCase().includes(query) || 
      result.subtitle.toLowerCase().includes(query)
    );
  };

  // Get menu items based on user role
  const roleMenuItems = getMenuItemsForRole(user?.role);
  
  // Debug logging - VERY VISIBLE
  console.log('🔴🔴🔴 LAYOUT RENDERING 🔴🔴🔴');
  console.log('Layout Debug:', {
    user: user,
    userRole: user?.role,
    roleMenuItems: roleMenuItems,
    roleMenuItemsLength: roleMenuItems.length
  });
  
  // Force alert for testing (remove later)
  if (!user) {
    console.log('⚠️ NO USER LOGGED IN - Navigation will be empty!');
  } else {
    console.log('✅ User logged in as:', user.role);
  }
  
  // Map icon names to actual icons
  const iconMap: Record<string, React.ReactElement> = {
    Dashboard: <Dashboard />,
    Gavel: <Gavel />,
    People: <People />,
    AccountBalance: <AccountBalance />,
    Description: <Description />,
    Assignment: <Assignment />,
    CalendarToday: <CalendarToday />,
    Receipt: <Receipt />,
    Schedule: <Schedule />,
    AccountCircle: <AccountCircle />,
    SmartToy: <SmartToy />,
    Settings: <Settings />,
    Business: <Business />,
    AdminPanelSettings: <AdminPanelSettings />,
    Security: <Security />,
  };

  const menuItems = roleMenuItems.filter(item => !['Users', 'Permissions', 'Settings', 'Firms', 'System'].includes(item.text)).map(item => ({
    ...item,
    icon: iconMap[item.icon] || <Description />
  }));
  
  console.log('Menu items after filtering:', menuItems);

  const adminItems = roleMenuItems.filter(item => ['Users', 'Permissions', 'Settings'].includes(item.text)).map(item => ({
    ...item,
    icon: iconMap[item.icon] || <Settings />
  }));

  const masterItems = roleMenuItems.filter(item => ['Firms', 'System'].includes(item.text)).map(item => ({
    ...item,
    icon: iconMap[item.icon] || <AdminPanelSettings />
  }));

  const drawer = (
    <div>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Gavel sx={{ color: 'primary.main' }} />
          <Typography variant="h6" noWrap>
            Litigation Management System {user ? `(${user.role})` : '(Not logged in)'}
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {adminItems.length > 0 && (
        <>
          <Divider />
          <List>
            <ListItem>
              <ListItemText primary="Administration" primaryTypographyProps={{ variant: 'caption', color: 'textSecondary' }} />
            </ListItem>
            {adminItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
      {masterItems.length > 0 && (
        <>
          <Divider />
          <List>
            <ListItem>
              <ListItemText primary="System Admin" primaryTypographyProps={{ variant: 'caption', color: 'textSecondary' }} />
            </ListItem>
            {masterItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Firm Selector for Master Account */}
          {user?.role === 'master' && (
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 200, 
                ml: 2,
                '& .MuiSelect-select': {
                  color: 'white',
                  pr: 3,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '& .MuiSelect-icon': {
                  color: 'white',
                },
              }}
            >
              <Select
                value={selectedFirmId}
                onChange={handleFirmChange}
                displayEmpty
                sx={{
                  color: 'white',
                  '& .MuiSelect-select': {
                    py: 1,
                  },
                }}
              >
                {firms.map((firm) => (
                  <MenuItem key={firm.id} value={firm.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Business fontSize="small" />
                      {firm.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          <IconButton 
            color="inherit"
            onClick={handleSearchOpen}
            aria-label="search"
          >
            <Search />
          </IconButton>
          <IconButton 
            color="inherit"
            onClick={handleNotificationMenuOpen}
            aria-label="notifications"
            aria-haspopup="true"
          >
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <IconButton
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem disabled>
              <Typography variant="body2">
                {user?.firstName} {user?.lastName}
              </Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="caption" color="textSecondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>

          {/* Notifications Menu */}
          <Menu
            anchorEl={notificationAnchorEl}
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 360,
                maxHeight: 480,
                '& .MuiList-root': {
                  py: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Notifications</Typography>
              <Typography variant="caption" color="textSecondary">
                You have {unreadCount} unread notifications
              </Typography>
            </Box>
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      py: 2,
                      px: 2,
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                      '&:hover': { bgcolor: 'action.selected' },
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      handleNotificationMenuClose();
                      // Navigate based on notification type
                      switch (notification.type) {
                        case 'case':
                          navigate('/cases');
                          break;
                        case 'task':
                          navigate('/tasks');
                          break;
                        case 'deadline':
                          navigate('/calendar');
                          break;
                        case 'document':
                          navigate('/documents');
                          break;
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'background.paper' }}>
                        {notification.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2">
                            {notification.title}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {notification.time}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="textSecondary">
                          {notification.message}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
            <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
              <Button
                fullWidth
                size="small"
                onClick={() => {
                  handleNotificationMenuClose();
                  navigate('/settings');
                }}
              >
                View All Notifications
              </Button>
            </Box>
          </Menu>

          {/* Search Dialog */}
          <Dialog
            open={searchOpen}
            onClose={handleSearchClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                position: 'fixed',
                top: 80,
                m: 0,
              },
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <TextField
                inputRef={searchInputRef}
                autoFocus
                fullWidth
                variant="outlined"
                placeholder="Search cases, clients, documents, tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    const results = getSearchResults();
                    if (results.length > 0) {
                      handleSearch(results[0]);
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              {searchQuery && (
                <>
                  <Typography variant="caption" color="textSecondary" sx={{ px: 2 }}>
                    {getSearchResults().length} results found
                  </Typography>
                  <List>
                    {getSearchResults().map((result, index) => (
                      <ListItem
                        key={index}
                        button
                        onClick={() => handleSearch(result)}
                        sx={{
                          borderRadius: 1,
                          mb: 0.5,
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'background.paper' }}>
                            {result.icon}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={result.title}
                          secondary={result.subtitle}
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label={result.type}
                            size="small"
                            variant="outlined"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                  {getSearchResults().length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="textSecondary">
                        No results found for "{searchQuery}"
                      </Typography>
                    </Box>
                  )}
                </>
              )}
              {!searchQuery && (
                <Box sx={{ py: 2 }}>
                  <Typography variant="subtitle2" sx={{ px: 2, mb: 2 }}>
                    Recent Searches
                  </Typography>
                  <List>
                    <ListItem button onClick={() => setSearchQuery('Smith')}>
                      <ListItemIcon>
                        <Schedule fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Smith" secondary="2 cases, 1 client" />
                    </ListItem>
                    <ListItem button onClick={() => setSearchQuery('Contract')}>
                      <ListItemIcon>
                        <Schedule fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Contract" secondary="1 case, 2 documents" />
                    </ListItem>
                    <ListItem button onClick={() => setSearchQuery('Medical')}>
                      <ListItemIcon>
                        <Schedule fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Medical" secondary="1 document, 1 task" />
                    </ListItem>
                  </List>
                  <Typography variant="subtitle2" sx={{ px: 2, mt: 3, mb: 2 }}>
                    Quick Links
                  </Typography>
                  <List>
                    <ListItem button onClick={() => handleSearch({ path: '/cases/new' })}>
                      <ListItemIcon>
                        <Add />
                      </ListItemIcon>
                      <ListItemText primary="Create New Case" />
                    </ListItem>
                    <ListItem button onClick={() => handleSearch({ path: '/clients/new' })}>
                      <ListItemIcon>
                        <PersonAdd />
                      </ListItemIcon>
                      <ListItemText primary="Add New Client" />
                    </ListItem>
                    <ListItem button onClick={() => handleSearch({ path: '/tasks' })}>
                      <ListItemIcon>
                        <Assignment />
                      </ListItemIcon>
                      <ListItemText primary="View All Tasks" />
                    </ListItem>
                  </List>
                </Box>
              )}
            </DialogContent>
          </Dialog>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          pr: aiAssistantOpen ? { sm: '416px' } : 3,
          transition: 'padding-right 0.3s ease',
        }}
      >
        <Outlet />
      </Box>
      
      {/* AI Assistant FAB */}
      {!aiAssistantOpen && (
        <AIAssistantFAB onClick={() => setAiAssistantOpen(true)} />
      )}
      
      {/* AI Assistant Panel */}
      <AIAssistantPanel
        open={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
      />
    </Box>
  );
};

export default Layout;