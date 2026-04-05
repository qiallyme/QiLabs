// Role-Based Access Control utilities

export type UserRole = 'master' | 'admin' | 'partner' | 'attorney' | 'paralegal';

// Define role hierarchy (higher roles have access to lower role features)
const roleHierarchy: Record<UserRole, number> = {
  master: 5,    // System-wide access
  admin: 4,     // Firm-wide access (highest within a firm)
  partner: 3,   // Can manage attorneys and paralegals only
  attorney: 2,  // Can manage own cases
  paralegal: 1, // Limited to assigned work
};

// Define feature permissions by role
const featurePermissions: Record<string, UserRole[]> = {
  // Master admin features (system-wide)
  'manage_firms': ['master'],
  'view_all_firms': ['master'],
  'switch_firms': ['master'],
  'system_settings': ['master'],
  'create_firm_admins': ['master'],
  
  // Admin features (firm-wide)
  'manage_all_firm_users': ['master', 'admin'],
  'manage_partners': ['master', 'admin'],
  'firm_settings': ['master', 'admin'],
  'view_all_cases': ['master', 'admin'],
  'view_firm_analytics': ['master', 'admin'],
  'billing_management': ['master', 'admin'],
  
  // Partner features
  'manage_attorneys': ['master', 'admin', 'partner'],
  'manage_paralegals': ['master', 'admin', 'partner'],
  'assign_cases': ['master', 'admin', 'partner'],
  'view_partner_cases': ['master', 'admin', 'partner'],
  
  // Attorney features
  'manage_own_cases': ['master', 'admin', 'partner', 'attorney'],
  'create_cases': ['master', 'admin', 'partner', 'attorney'],
  'manage_clients': ['master', 'admin', 'partner', 'attorney'],
  'use_ai_assistant': ['master', 'admin', 'partner', 'attorney'],
  'deadline_calculator': ['master', 'admin', 'partner', 'attorney'],
  'view_assigned_paralegals': ['master', 'admin', 'partner', 'attorney'],
  
  // Paralegal features (accessible by all roles)
  'view_assigned_cases': ['master', 'admin', 'partner', 'attorney', 'paralegal'],
  'manage_tasks': ['master', 'admin', 'partner', 'attorney', 'paralegal'],
  'upload_documents': ['master', 'admin', 'partner', 'attorney', 'paralegal'],
  'view_calendar': ['master', 'admin', 'partner', 'attorney', 'paralegal'],
  'client_portal_access': ['master', 'admin', 'partner', 'attorney', 'paralegal'],
};

// Check if user has permission for a feature
export const hasPermission = (userRole: UserRole | undefined, feature: string): boolean => {
  if (!userRole) return false;
  const allowedRoles = featurePermissions[feature];
  return allowedRoles ? allowedRoles.includes(userRole) : false;
};

// Check if user role is at least the specified level
export const isRoleAtLeast = (userRole: UserRole | undefined, requiredRole: UserRole): boolean => {
  if (!userRole) return false;
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// Get menu items based on user role
export const getMenuItemsForRole = (userRole: UserRole | undefined) => {
  const allMenuItems = [
    { text: 'Dashboard', icon: 'Dashboard', path: '/dashboard', minRole: 'paralegal' as UserRole },
    { text: 'Cases', icon: 'Gavel', path: '/cases', minRole: 'paralegal' as UserRole },
    { text: 'Clients', icon: 'People', path: '/clients', minRole: 'attorney' as UserRole },
    { text: 'Attorneys', icon: 'AccountBalance', path: '/attorneys', minRole: 'admin' as UserRole },
    { text: 'Documents', icon: 'Description', path: '/documents', minRole: 'paralegal' as UserRole },
    { text: 'Tasks', icon: 'Assignment', path: '/tasks', minRole: 'paralegal' as UserRole },
    { text: 'Calendar', icon: 'CalendarToday', path: '/calendar', minRole: 'paralegal' as UserRole },
    { text: 'Billing', icon: 'Receipt', path: '/billing', minRole: 'admin' as UserRole },
    { text: 'Deadline Calculator', icon: 'Schedule', path: '/deadline-calculator', minRole: 'attorney' as UserRole },
    { text: 'Client Portal', icon: 'AccountCircle', path: '/client-portal', minRole: 'paralegal' as UserRole },
    { text: 'AI Assistant', icon: 'SmartToy', path: '/ai-assistant', minRole: 'attorney' as UserRole },
  ];

  const adminMenuItems = [
    { text: 'Users', icon: 'AccountCircle', path: '/users', minRole: 'admin' as UserRole },
    { text: 'Permissions', icon: 'Security', path: '/permissions', minRole: 'admin' as UserRole },
    { text: 'Settings', icon: 'Settings', path: '/settings', minRole: 'admin' as UserRole },
  ];

  const masterMenuItems = [
    { text: 'Firms', icon: 'Business', path: '/firms', minRole: 'master' as UserRole },
    { text: 'System', icon: 'AdminPanelSettings', path: '/system', minRole: 'master' as UserRole },
  ];

  let filteredItems = allMenuItems.filter(item => isRoleAtLeast(userRole, item.minRole));
  
  if (isRoleAtLeast(userRole, 'admin')) {
    filteredItems = [...filteredItems, ...adminMenuItems.filter(item => isRoleAtLeast(userRole, item.minRole))];
  }
  
  if (userRole === 'master') {
    filteredItems = [...filteredItems, ...masterMenuItems];
  }

  return filteredItems;
};

// Get demo accounts
export const getDemoAccounts = () => [
  {
    role: 'master' as UserRole,
    email: 'master@unfy.com',
    password: 'EMunfy2025',
    name: 'System Administrator',
    description: 'Full system access, manage all firms and users'
  },
  {
    role: 'admin' as UserRole,
    email: 'admin@lawfirm.com',
    password: 'admin123',
    name: 'Robert Blake (Admin)',
    description: 'Manage all firm users, settings, and billing'
  },
  {
    role: 'partner' as UserRole,
    email: 'partner@lawfirm.com',
    password: 'partner123',
    name: 'John Davidson (Partner)',
    description: 'Manage attorneys and paralegals only'
  },
  {
    role: 'attorney' as UserRole,
    email: 'attorney@lawfirm.com',
    password: 'attorney123',
    name: 'Sarah Mitchell (Attorney)',
    description: 'Manage own cases and assigned paralegals'
  },
  {
    role: 'paralegal' as UserRole,
    email: 'paralegal@lawfirm.com',
    password: 'paralegal123',
    name: 'Emily Chen (Paralegal)',
    description: 'View assigned cases and manage tasks'
  }
];

// Filter data based on user role
export const filterDataByRole = (data: any[], userRole: UserRole | undefined, userId: string) => {
  if (!userRole) return [];
  
  switch (userRole) {
    case 'master':
      // Master sees everything
      return data;
    
    case 'partner':
    case 'admin':
      // Partner/Admin sees all data in their firm
      return data.filter(item => !item.lawFirmId || item.lawFirmId === userId);
    
    case 'attorney':
      // Attorney sees their own cases and assigned cases
      return data.filter(item => 
        item.attorneyId === userId || 
        item.assignedAttorneys?.includes(userId) ||
        item.createdBy === userId
      );
    
    case 'paralegal':
      // Paralegal sees only assigned cases/tasks
      return data.filter(item => 
        item.assignedTo === userId ||
        item.assignedParalegals?.includes(userId)
      );
    
    default:
      return [];
  }
};