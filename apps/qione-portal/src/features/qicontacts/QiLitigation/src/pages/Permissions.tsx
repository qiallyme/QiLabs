import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  Tabs,
  Tab,
  Alert,
  Chip,
  FormControlLabel,
  Switch,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Security,
  Save,
  RestartAlt,
  Info,
  Lock,
  LockOpen,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { getConfig } from '../utils/config';

interface Permission {
  key: string;
  label: string;
  description: string;
}

interface RolePermissions {
  [key: string]: string[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`permissions-tabpanel-${index}`}
      aria-labelledby={`permissions-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Permissions: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState(0);
  const [permissions, setPermissions] = useState<RolePermissions>({});
  const [originalPermissions, setOriginalPermissions] = useState<RolePermissions>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);

  // Define available permissions for each module
  const modules = {
    cases: {
      name: 'Cases',
      permissions: [
        { key: 'view_all', label: 'View All Cases', description: 'View all cases in the firm' },
        { key: 'view_assigned', label: 'View Assigned Cases', description: 'View only assigned cases' },
        { key: 'create', label: 'Create Cases', description: 'Create new cases' },
        { key: 'edit', label: 'Edit Cases', description: 'Edit case details' },
        { key: 'delete', label: 'Delete Cases', description: 'Delete cases' },
        { key: 'reassign', label: 'Reassign Cases', description: 'Reassign cases to other attorneys' },
      ],
    },
    clients: {
      name: 'Clients',
      permissions: [
        { key: 'view_all', label: 'View All Clients', description: 'View all clients in the firm' },
        { key: 'view_assigned', label: 'View Assigned Clients', description: 'View only assigned clients' },
        { key: 'create', label: 'Create Clients', description: 'Create new clients' },
        { key: 'edit', label: 'Edit Clients', description: 'Edit client information' },
        { key: 'delete', label: 'Delete Clients', description: 'Delete clients' },
      ],
    },
    documents: {
      name: 'Documents',
      permissions: [
        { key: 'view_all', label: 'View All Documents', description: 'View all documents in the firm' },
        { key: 'view_assigned', label: 'View Assigned Documents', description: 'View only documents for assigned cases' },
        { key: 'upload', label: 'Upload Documents', description: 'Upload new documents' },
        { key: 'download', label: 'Download Documents', description: 'Download documents' },
        { key: 'delete', label: 'Delete Documents', description: 'Delete documents' },
      ],
    },
    billing: {
      name: 'Billing',
      permissions: [
        { key: 'view_all', label: 'View All Billing', description: 'View all billing records' },
        { key: 'view_own', label: 'View Own Billing', description: 'View only own billing records' },
        { key: 'view_none', label: 'No Access', description: 'No access to billing' },
        { key: 'create', label: 'Create Invoices', description: 'Create new invoices' },
        { key: 'edit', label: 'Edit Invoices', description: 'Edit existing invoices' },
        { key: 'approve', label: 'Approve Invoices', description: 'Approve invoices for sending' },
        { key: 'export', label: 'Export Reports', description: 'Export billing reports' },
      ],
    },
    users: {
      name: 'Users',
      permissions: [
        { key: 'view_all', label: 'View All Users', description: 'View all users in the firm' },
        { key: 'view_attorneys_paralegals', label: 'View Attorneys & Paralegals', description: 'View attorneys and paralegals only' },
        { key: 'view_paralegals', label: 'View Paralegals', description: 'View paralegals only' },
        { key: 'view_none', label: 'No Access', description: 'No access to user management' },
        { key: 'create_attorneys_paralegals', label: 'Create Attorneys & Paralegals', description: 'Create attorney and paralegal accounts' },
        { key: 'edit_attorneys_paralegals', label: 'Edit Attorneys & Paralegals', description: 'Edit attorney and paralegal accounts' },
        { key: 'deactivate', label: 'Deactivate Users', description: 'Deactivate user accounts' },
      ],
    },
  };

  const roles = ['partner', 'attorney', 'paralegal'];

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
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
      
      const response = await fetch(`${config.apiEndpoint}/permissions`, {
        headers
      });
      const data = await response.json();
      if (data.success && data.data) {
        // Transform the permissions data from backend format to frontend format
        const transformedPermissions: RolePermissions = {};
        Object.entries(data.data).forEach(([role, roleData]: [string, any]) => {
          transformedPermissions[role] = [];
          Object.entries(roleData).forEach(([module, permissions]: [string, any]) => {
            if (Array.isArray(permissions)) {
              permissions.forEach(perm => {
                transformedPermissions[role].push(`${module}.${perm}`);
              });
            }
          });
        });
        setPermissions(transformedPermissions);
        setOriginalPermissions(JSON.parse(JSON.stringify(transformedPermissions)));
      } else {
        loadDefaultPermissions();
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      // Load default permissions
      loadDefaultPermissions();
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultPermissions = () => {
    const defaults: RolePermissions = {
      partner: [
        'cases.view_all', 'cases.create', 'cases.edit', 'cases.delete',
        'clients.view_all', 'clients.create', 'clients.edit',
        'documents.view_all', 'documents.upload', 'documents.download',
        'billing.view_all', 'billing.create', 'billing.edit',
        'users.view_attorneys_paralegals', 'users.create_attorneys_paralegals', 'users.edit_attorneys_paralegals'
      ],
      attorney: [
        'cases.view_assigned', 'cases.create', 'cases.edit',
        'clients.view_assigned', 'clients.create', 'clients.edit',
        'documents.view_assigned', 'documents.upload', 'documents.download',
        'billing.view_own', 'billing.create',
        'users.view_paralegals'
      ],
      paralegal: [
        'cases.view_assigned',
        'clients.view_assigned',
        'documents.view_assigned', 'documents.upload', 'documents.download',
        'billing.view_none',
        'users.view_none'
      ]
    };
    setPermissions(defaults);
    setOriginalPermissions(JSON.parse(JSON.stringify(defaults)));
  };

  const handlePermissionChange = (role: string, module: string, permission: string, checked: boolean) => {
    const permissionKey = `${module}.${permission}`;
    const newPermissions = { ...permissions };
    
    if (!newPermissions[role]) {
      newPermissions[role] = [];
    }
    
    if (checked) {
      // Add permission
      if (!newPermissions[role].includes(permissionKey)) {
        newPermissions[role].push(permissionKey);
      }
      
      // Handle mutually exclusive permissions
      if (module === 'billing' && ['view_all', 'view_own', 'view_none'].includes(permission)) {
        // Remove other view permissions
        newPermissions[role] = newPermissions[role].filter(p => 
          !p.startsWith('billing.view_') || p === permissionKey
        );
      }
      if (module === 'users' && ['view_all', 'view_attorneys_paralegals', 'view_paralegals', 'view_none'].includes(permission)) {
        // Remove other view permissions
        newPermissions[role] = newPermissions[role].filter(p => 
          !p.startsWith('users.view_') || p === permissionKey
        );
      }
    } else {
      // Remove permission
      newPermissions[role] = newPermissions[role].filter(p => p !== permissionKey);
    }
    
    setPermissions(newPermissions);
    setHasChanges(JSON.stringify(newPermissions) !== JSON.stringify(originalPermissions));
  };

  const hasPermission = (role: string, module: string, permission: string): boolean => {
    const permissionKey = `${module}.${permission}`;
    return permissions[role]?.includes(permissionKey) || false;
  };

  const handleSave = async () => {
    try {
      // Transform permissions back to backend format
      const backendFormat: any = {};
      Object.entries(permissions).forEach(([role, perms]) => {
        backendFormat[role] = {};
        perms.forEach(perm => {
          const [module, permission] = perm.split('.');
          if (!backendFormat[role][module]) {
            backendFormat[role][module] = [];
          }
          backendFormat[role][module].push(permission);
        });
      });

      const config = getConfig();
      const tokensStr = localStorage.getItem('demoTokens');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (tokensStr) {
        const tokens = JSON.parse(tokensStr);
        headers['Authorization'] = `Bearer ${tokens.accessToken}`;
      }
      
      const response = await fetch(`${config.apiEndpoint}/permissions`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(backendFormat)
      });
      
      if (response.ok) {
        setOriginalPermissions(JSON.parse(JSON.stringify(permissions)));
        setHasChanges(false);
        showNotification('Permissions saved successfully', 'success');
      }
    } catch (error) {
      showNotification('Failed to save permissions', 'error');
    }
  };

  const handleReset = () => {
    setPermissions(JSON.parse(JSON.stringify(originalPermissions)));
    setHasChanges(false);
  };

  if (user?.role !== 'admin' && user?.role !== 'master') {
    return (
      <Box>
        <Alert severity="error">
          You do not have permission to access this page. Only administrators can manage permissions.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">Role Permissions</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Configure permissions for different roles in your firm
          </Typography>
        </Box>
        <Box>
          {hasChanges && (
            <Chip
              label="Unsaved Changes"
              color="warning"
              size="small"
              sx={{ mr: 2 }}
            />
          )}
          <Button
            variant="outlined"
            startIcon={<RestartAlt />}
            onClick={handleReset}
            disabled={!hasChanges}
            sx={{ mr: 1 }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      <Paper>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          {Object.entries(modules).map(([key, module], index) => (
            <Tab key={key} label={module.name} />
          ))}
        </Tabs>

        {Object.entries(modules).map(([moduleKey, module], index) => (
          <TabPanel key={moduleKey} value={activeTab} index={index}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Permission</TableCell>
                    {roles.map(role => (
                      <TableCell key={role} align="center">
                        <Typography variant="subtitle2">
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {module.permissions.map((permission) => (
                    <TableRow key={permission.key}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {permission.label}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {permission.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      {roles.map(role => (
                        <TableCell key={role} align="center">
                          <Checkbox
                            checked={hasPermission(role, moduleKey, permission.key)}
                            onChange={(e) => handlePermissionChange(role, moduleKey, permission.key, e.target.checked)}
                            color="primary"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        ))}
      </Paper>

      <Box mt={3}>
        <Alert severity="info" icon={<Info />}>
          <Typography variant="body2">
            <strong>Note:</strong> Changes to permissions will take effect immediately for all users with the affected roles.
            Users may need to refresh their browser to see the changes.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default Permissions;