# Litigation Management System

A modern, serverless litigation management platform built with React, Supabase, and deployed on Render.

## 🚀 Features

- **Case Management**: Track litigation cases with phases, deadlines, and court dates
- **Client Portal**: Secure client access to case information
- **Document Management**: Upload, organize, and share legal documents
- **Calendar Integration**: Court dates, deadlines, and meeting scheduling
- **Task Management**: Assign and track paralegal and attorney tasks
- **Role-Based Access**: Master, Admin, Partner, Attorney, and Paralegal roles
- **AI Assistant**: Legal research and document analysis
- **Deadline Calculator**: Automated court deadline calculations
- **Billing Integration**: Time tracking and invoice generation

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Material-UI
- **Backend**: Serverless functions (Render/Vercel)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Hosting**: Render
- **Version Control**: GitHub

## 🛠️ Tech Stack

- React 18 + TypeScript
- Material-UI (MUI) v5
- React Router v6
- Redux Toolkit
- Supabase
- Date-fns
- React Hook Form
- Recharts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Render account

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd litigation-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Supabase credentials

5. Start the development server:
```bash
npm start
```

## 📦 Deployment

### Render Deployment

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on git push

### Environment Variables

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_ENVIRONMENT=production
```

## 🔐 Demo Accounts

- **Master**: master@unfy.com / EMunfy2025
- **Admin**: admin@lawfirm.com / admin123
- **Partner**: partner@lawfirm.com / partner123
- **Attorney**: attorney@lawfirm.com / attorney123
- **Paralegal**: paralegal@lawfirm.com / paralegal123

## 📝 License

MIT License - see LICENSE file for details