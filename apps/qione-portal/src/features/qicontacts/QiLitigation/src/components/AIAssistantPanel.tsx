import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Chip,
  Fab,
  Badge,
  Tooltip,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  SmartToy,
  Close,
  Send,
  Person,
  ContentCopy,
  Refresh,
  Minimize,
  OpenInNew,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { getConfig } from '../utils/config';
import { useNotification } from '../contexts/NotificationContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  context?: string;
}

interface AIAssistantPanelProps {
  open: boolean;
  onClose: () => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI legal assistant. I can help you with legal research, case analysis, document drafting, and answering questions about your current page. How can I assist you today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getCurrentPageContext = () => {
    const path = location.pathname;
    if (path.includes('/cases')) return 'Cases Page';
    if (path.includes('/clients')) return 'Clients Page';
    if (path.includes('/documents')) return 'Documents Page';
    if (path.includes('/tasks')) return 'Tasks Page';
    if (path.includes('/calendar')) return 'Calendar Page';
    if (path.includes('/billing')) return 'Billing Page';
    if (path.includes('/attorneys')) return 'Attorneys Page';
    if (path.includes('/deadline-calculator')) return 'Deadline Calculator';
    if (path.includes('/dashboard')) return 'Dashboard';
    return 'Litigation Management System';
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
      context: getCurrentPageContext(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const config = getConfig();
      const response = await fetch(`${config.apiEndpoint}/ai-assistant/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          context: getCurrentPageContext(),
          conversationHistory: messages.slice(-5), // Send last 5 messages for context
        }),
      });

      const data = await response.json();
      console.log('AI Assistant response:', data); // Debug log

      if (data.success && data.data) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.data.response || 'I understand your question but need more information.',
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Fallback if response structure is different
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response || data.message || 'I understand your question but need more information.',
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error querying AI assistant:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      // Try using the modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        showNotification('Text copied to clipboard', 'success');
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          showNotification('Text copied to clipboard', 'success');
        } catch (err) {
          console.error('Failed to copy text: ', err);
          showNotification('Failed to copy text', 'error');
        } finally {
          textArea.remove();
        }
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showNotification('Failed to copy text', 'error');
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        id: Date.now().toString(),
        content: 'Conversation cleared. How can I help you?',
        sender: 'ai',
        timestamp: new Date(),
      },
    ]);
  };

  const suggestedQuestions = [
    'What are the key deadlines for my active cases?',
    'Summarize recent case law on employment discrimination',
    'Help me draft a motion to dismiss',
    'What documents do I need for a personal injury case?',
    'Explain the statute of limitations for this case type',
  ];

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        variant="persistent"
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 400 },
            boxSizing: 'border-box',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'primary.main',
            color: 'white',
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <SmartToy />
            <Typography variant="h6">AI Legal Assistant</Typography>
          </Box>
          <Box>
            <Tooltip title="Open in full page">
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={() => {
                  navigate('/ai-assistant');
                  onClose();
                }}
              >
                <OpenInNew />
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear conversation">
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={clearConversation}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={onClose}
              >
                <Close />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Current Context */}
        <Box sx={{ px: 2, py: 1, bgcolor: 'grey.100' }}>
          <Typography variant="caption" color="textSecondary">
            Current context: <Chip label={getCurrentPageContext()} size="small" />
          </Typography>
        </Box>

        {/* Messages */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
          <List>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                alignItems="flex-start"
                sx={{
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                  px: 0,
                }}
              >
                <ListItemAvatar sx={{ minWidth: 40, ml: message.sender === 'user' ? 1 : 0, mr: message.sender === 'user' ? 0 : 1 }}>
                  <Avatar sx={{ bgcolor: message.sender === 'user' ? 'secondary.main' : 'primary.main' }}>
                    {message.sender === 'user' ? <Person /> : <SmartToy />}
                  </Avatar>
                </ListItemAvatar>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '75%',
                    bgcolor: message.sender === 'user' ? 'secondary.light' : 'grey.100',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {format(message.timestamp, 'HH:mm')}
                    </Typography>
                    {message.sender === 'ai' && (
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(message.content)}
                        sx={{ p: 0.5 }}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Paper>
              </ListItem>
            ))}
            {loading && (
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemAvatar sx={{ minWidth: 40 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <SmartToy />
                  </Avatar>
                </ListItemAvatar>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="textSecondary">
                    Thinking...
                  </Typography>
                </Box>
              </ListItem>
            )}
          </List>
          <div ref={messagesEndRef} />
        </Box>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Typography variant="caption" color="textSecondary" gutterBottom>
              Suggested questions:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {suggestedQuestions.slice(0, 3).map((question, index) => (
                <Chip
                  key={index}
                  label={question}
                  size="small"
                  onClick={() => setInput(question)}
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Input Area */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Ask a legal question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSend}
                      disabled={!input.trim() || loading}
                      edge="end"
                      color="primary"
                    >
                      <Send />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

// Floating Action Button Component
export const AIAssistantFAB: React.FC<{ onClick: () => void; messageCount?: number }> = ({ onClick, messageCount = 0 }) => {
  return (
    <Fab
      color="primary"
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1200,
      }}
      onClick={onClick}
    >
      <Badge badgeContent={messageCount} color="error">
        <SmartToy />
      </Badge>
    </Fab>
  );
};

export default AIAssistantPanel;