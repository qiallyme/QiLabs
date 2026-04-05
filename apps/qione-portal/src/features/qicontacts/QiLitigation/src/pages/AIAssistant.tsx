import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  List,
  ListItem,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  Avatar,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  ContentCopy,
  ThumbUp,
  ThumbDown,
  Refresh,
  MoreVert,
  Gavel,
  Description,
  Search,
  AutoAwesome,
  QuestionAnswer,
  Schedule,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getConfig } from '../utils/config';
import { useNotification } from '../contexts/NotificationContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface SuggestedQuery {
  icon: React.ReactNode;
  text: string;
  query: string;
}

const AIAssistant: React.FC = () => {
  const { showNotification } = useNotification();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI Legal Assistant. I can help you with:\n\n• Case research and analysis\n• Document summarization\n• Legal precedent searches\n• Deadline calculations\n• Contract review insights\n\nHow can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const suggestedQueries: SuggestedQuery[] = [
    {
      icon: <Gavel />,
      text: 'Case Summary',
      query: 'Summarize the key points of the Smith vs. Johnson case',
    },
    {
      icon: <Description />,
      text: 'Document Analysis',
      query: 'What are the main terms in the contract uploaded for case #2024-0001?',
    },
    {
      icon: <Search />,
      text: 'Legal Research',
      query: 'Find precedents for personal injury cases involving automobile accidents in New York',
    },
    {
      icon: <Schedule />,
      text: 'Deadline Check',
      query: 'What are the upcoming deadlines for my active cases?',
    },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
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
      
      const response = await fetch(`${config.apiEndpoint}/ai-assistant/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: input }),
      });

      const data = await response.json();
      
      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date(),
          suggestions: generateSuggestions(input),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Error querying AI:', error);
      // Fallback response for demo
      const mockResponse = generateMockResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: mockResponse,
        timestamp: new Date(),
        suggestions: generateSuggestions(input),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generateMockResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('smith') || lowerQuery.includes('case')) {
      return `Based on my analysis of the Smith vs. Johnson case (Case #2024-0001):

**Case Summary:**
- **Type**: Personal Injury - Automobile Accident
- **Status**: Active (Discovery Phase)
- **Key Facts**: Client injured in rear-end collision on I-95, seeking damages for medical expenses and lost wages

**Important Deadlines:**
- Discovery deadline: February 15, 2024
- Deposition scheduled: February 1, 2024
- Pre-trial conference: March 1, 2024

**Recommendations:**
1. Collect all medical records from the three hospitals mentioned
2. Schedule independent medical examination
3. Review similar cases in NY for settlement benchmarks (average settlement: $75,000-$150,000)

Would you like me to analyze specific aspects of this case?`;
    }
    
    if (lowerQuery.includes('deadline')) {
      return `Here are your upcoming deadlines across all active cases:

**This Week:**
- Jan 30: Review will and testament (Estate of Williams)
- Feb 1: Collect medical records (Smith vs. Johnson)

**Next Week:**
- Feb 7: File motion to compel (ABC Corp vs. XYZ Inc)
- Feb 10: Client meeting preparation (Johnson family trust)

**This Month:**
- Feb 15: Discovery deadline (2 cases)
- Feb 28: Settlement conference (Garcia vs. State)

Would you like me to create calendar reminders for these deadlines?`;
    }
    
    if (lowerQuery.includes('contract') || lowerQuery.includes('document')) {
      return `I've analyzed the contract documents in your system. Here are the key findings:

**Contract Analysis Summary:**
- 15 active contracts across 8 cases
- 3 contracts have approaching renewal dates
- 2 contracts contain potentially problematic clauses

**Risk Areas Identified:**
1. Ambiguous termination clause in ABC Corp agreement
2. Missing force majeure provisions in 2 contracts
3. Incomplete indemnification language

**Recommendations:**
- Review and update standard contract templates
- Flag the ABC Corp agreement for immediate review
- Consider adding arbitration clauses to new contracts

Shall I provide a detailed analysis of any specific contract?`;
    }
    
    return `I understand you're asking about "${query}". Let me help you with that.

Based on your law firm's data, I can provide:
- Case law research and precedents
- Document analysis and summarization
- Deadline tracking and management
- Legal strategy recommendations
- Contract review and risk assessment

Please provide more specific details about what you'd like to know, and I'll give you a comprehensive analysis.`;
  };

  const generateSuggestions = (query: string): string[] => {
    const suggestions = [
      'Show me similar cases',
      'What are the next steps?',
      'Generate a summary for the client',
      'Find relevant legal precedents',
    ];
    return suggestions.slice(0, 3);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, messageId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessageId(messageId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessageId(null);
  };

  const handleCopyMessage = () => {
    const message = messages.find(m => m.id === selectedMessageId);
    if (message) {
      navigator.clipboard.writeText(message.content);
      showNotification('Message copied to clipboard', 'success');
    }
    handleMenuClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <SmartToy />
            </Avatar>
            <Box>
              <Typography variant="h5">AI Legal Assistant</Typography>
              <Typography variant="body2" color="textSecondary">
                Powered by Advanced AI • Always learning from your firm's data
              </Typography>
            </Box>
          </Box>
          <Box>
            <Chip
              icon={<AutoAwesome />}
              label="AI Active"
              color="success"
              size="small"
            />
          </Box>
        </Box>
      </Paper>

      {/* Messages Area */}
      <Paper sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: 'grey.50' }}>
        <List>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                flexDirection: 'column',
                alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                p: 1,
              }}
            >
              <Box
                sx={{
                  maxWidth: '70%',
                  display: 'flex',
                  flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                  gap: 1,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: message.role === 'user' ? 'secondary.main' : 'primary.main',
                    width: 32,
                    height: 32,
                  }}
                >
                  {message.role === 'user' ? <Person /> : <SmartToy />}
                </Avatar>
                <Card
                  sx={{
                    bgcolor: message.role === 'user' ? 'primary.main' : 'white',
                    color: message.role === 'user' ? 'white' : 'text.primary',
                  }}
                >
                  <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {format(message.timestamp, 'HH:mm')}
                      </Typography>
                      {message.role === 'assistant' && (
                        <Box>
                          <IconButton size="small" sx={{ color: 'inherit', opacity: 0.7 }}>
                            <ThumbUp fontSize="small" />
                          </IconButton>
                          <IconButton size="small" sx={{ color: 'inherit', opacity: 0.7 }}>
                            <ThumbDown fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{ color: 'inherit', opacity: 0.7 }}
                            onClick={(e) => handleMenuClick(e, message.id)}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
              {message.suggestions && (
                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap', maxWidth: '70%' }}>
                  {message.suggestions.map((suggestion, index) => (
                    <Chip
                      key={index}
                      label={suggestion}
                      size="small"
                      onClick={() => handleSuggestionClick(suggestion)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              )}
            </ListItem>
          ))}
          {loading && (
            <ListItem sx={{ justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </ListItem>
          )}
        </List>
        <div ref={messagesEndRef} />
      </Paper>

      {/* Suggested Queries */}
      {messages.length === 1 && (
        <Paper sx={{ p: 2, my: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Try asking about:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {suggestedQueries.map((query, index) => (
              <Button
                key={index}
                variant="outlined"
                size="small"
                startIcon={query.icon}
                onClick={() => setInput(query.query)}
                sx={{ textTransform: 'none' }}
              >
                {query.text}
              </Button>
            ))}
          </Box>
        </Paper>
      )}

      {/* Input Area */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Box display="flex" gap={1}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Ask anything about your cases, clients, or legal research..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!input.trim() || loading}
          >
            <Send />
          </IconButton>
        </Box>
        <Box display="flex" justifyContent="space-between" mt={1}>
          <Typography variant="caption" color="textSecondary">
            AI assistant uses your firm's data and legal databases
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Press Enter to send, Shift+Enter for new line
          </Typography>
        </Box>
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleCopyMessage}>
          <ContentCopy fontSize="small" sx={{ mr: 1 }} />
          Copy
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Refresh fontSize="small" sx={{ mr: 1 }} />
          Regenerate
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AIAssistant;