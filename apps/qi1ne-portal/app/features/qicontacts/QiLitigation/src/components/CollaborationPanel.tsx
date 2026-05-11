import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Button,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Card,
  CardContent,
  InputAdornment,
  Popover,
} from '@mui/material';
import {
  Send,
  AttachFile,
  MoreVert,
  Edit,
  Delete,
  Reply,
  ThumbUp,
  Notifications,
  NotificationsOff,
  Person,
  Group,
  History,
  FormatQuote,
  Link as LinkIcon,
  Image as ImageIcon,
  Close,
  Search,
  FilterList,
} from '@mui/icons-material';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface Comment {
  id: string;
  content: string;
  author: string;
  authorId: string;
  authorRole: string;
  timestamp: string;
  edited?: boolean;
  editedAt?: string;
  parentId?: string;
  mentions?: string[];
  attachments?: Attachment[];
  reactions?: Reaction[];
  entityType: 'CASE' | 'DOCUMENT' | 'TASK' | 'CLIENT';
  entityId: string;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface Reaction {
  userId: string;
  userName: string;
  type: 'like' | 'thumbsup' | 'helpful' | 'question';
}

interface Mention {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface CollaborationPanelProps {
  entityType: 'CASE' | 'DOCUMENT' | 'TASK' | 'CLIENT';
  entityId: string;
  entityTitle?: string;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  entityType,
  entityId,
  entityTitle,
}) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [mentionAnchor, setMentionAnchor] = useState<null | HTMLElement>(null);
  const [mentionSearch, setMentionSearch] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [filter, setFilter] = useState('all');
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Mock team members for mentions
  const teamMembers: Mention[] = [
    { id: '1', name: 'Demo Attorney', email: 'attorney@firm.com', role: 'Attorney' },
    { id: '2', name: 'Jane Paralegal', email: 'jane@firm.com', role: 'Paralegal' },
    { id: '3', name: 'John Assistant', email: 'john@firm.com', role: 'Legal Assistant' },
    { id: '4', name: 'Sarah Admin', email: 'sarah@firm.com', role: 'Admin' },
  ];

  useEffect(() => {
    fetchComments();
  }, [entityType, entityId]);

  const fetchComments = async () => {
    // Mock data for demo
    const mockComments: Comment[] = [
      {
        id: '1',
        content: 'I\'ve reviewed the initial complaint and identified several key points we need to address. @Jane Paralegal, can you help gather the supporting documents?',
        author: 'Demo Attorney',
        authorId: 'user-1',
        authorRole: 'Attorney',
        timestamp: '2024-01-20T10:00:00Z',
        mentions: ['Jane Paralegal'],
        reactions: [
          { userId: 'user-2', userName: 'Jane Paralegal', type: 'thumbsup' },
        ],
        entityType,
        entityId,
      },
      {
        id: '2',
        content: 'I\'ll start gathering those documents right away. I\'ve already found the medical records and witness statements.',
        author: 'Jane Paralegal',
        authorId: 'user-2',
        authorRole: 'Paralegal',
        timestamp: '2024-01-20T11:30:00Z',
        parentId: '1',
        attachments: [
          {
            id: 'att-1',
            name: 'Medical_Records_Summary.pdf',
            type: 'application/pdf',
            size: 245760,
            url: '#',
          },
        ],
        entityType,
        entityId,
      },
      {
        id: '3',
        content: 'Client called today asking about the timeline. I explained we\'re still in the discovery phase. They seemed satisfied with the progress.',
        author: 'John Assistant',
        authorId: 'user-3',
        authorRole: 'Legal Assistant',
        timestamp: '2024-01-21T14:00:00Z',
        edited: true,
        editedAt: '2024-01-21T14:15:00Z',
        entityType,
        entityId,
      },
    ];
    setComments(mockComments);
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: user?.firstName + ' ' + user?.lastName || 'Current User',
      authorId: user?.userId || 'current-user',
      authorRole: user?.role || 'User',
      timestamp: new Date().toISOString(),
      parentId: replyTo || undefined,
      mentions: extractMentions(newComment),
      attachments: attachments.map((file, index) => ({
        id: `att-${Date.now()}-${index}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: '#',
      })),
      entityType,
      entityId,
    };

    setComments([...comments, comment]);
    setNewComment('');
    setReplyTo(null);
    setAttachments([]);
    showNotification('Comment posted successfully', 'success');
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim() || !editingComment) return;

    setComments(comments.map(comment =>
      comment.id === editingComment
        ? {
            ...comment,
            content: editContent,
            edited: true,
            editedAt: new Date().toISOString(),
          }
        : comment
    ));
    setEditingComment(null);
    setEditContent('');
    showNotification('Comment updated', 'success');
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setComments(comments.filter(c => c.id !== commentId && c.parentId !== commentId));
      showNotification('Comment deleted', 'success');
    }
  };

  const handleReaction = (commentId: string, reactionType: string) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const existingReaction = comment.reactions?.find(r => r.userId === user?.userId);
        if (existingReaction) {
          // Remove reaction if already exists
          return {
            ...comment,
            reactions: comment.reactions?.filter(r => r.userId !== user?.userId),
          };
        } else {
          // Add new reaction
          const newReaction: Reaction = {
            userId: user?.userId || 'current-user',
            userName: user?.firstName + ' ' + user?.lastName || 'Current User',
            type: reactionType as Reaction['type'],
          };
          return {
            ...comment,
            reactions: [...(comment.reactions || []), newReaction],
          };
        }
      }
      return comment;
    }));
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+\s?\w*)/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map(m => m.substring(1)) : [];
  };

  const handleMentionSelect = (member: Mention) => {
    const currentText = newComment;
    const lastAtIndex = currentText.lastIndexOf('@');
    const textBeforeAt = currentText.substring(0, lastAtIndex);
    const newText = `${textBeforeAt}@${member.name} `;
    setNewComment(newText);
    setMentionAnchor(null);
    commentInputRef.current?.focus();
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setNewComment(text);

    // Check for @ symbol to show mention suggestions
    const lastChar = text[text.length - 1];
    const lastWord = text.split(' ').pop() || '';
    
    if (lastChar === '@' || (lastWord.startsWith('@') && lastWord.length > 1)) {
      setMentionSearch(lastWord.substring(1));
      setMentionAnchor(e.currentTarget);
    } else {
      setMentionAnchor(null);
    }
  };

  const getReplies = (parentId: string): Comment[] => {
    return comments.filter(c => c.parentId === parentId);
  };

  const getFilteredComments = (): Comment[] => {
    let filtered = comments.filter(c => !c.parentId); // Only top-level comments

    switch (filter) {
      case 'mentions':
        filtered = filtered.filter(c =>
          c.mentions?.includes(user?.firstName + ' ' + user?.lastName || '') ||
          getReplies(c.id).some(r => r.mentions?.includes(user?.firstName + ' ' + user?.lastName || ''))
        );
        break;
      case 'attachments':
        filtered = filtered.filter(c =>
          c.attachments && c.attachments.length > 0 ||
          getReplies(c.id).some(r => r.attachments && r.attachments.length > 0)
        );
        break;
    }

    return filtered;
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const isAuthor = comment.authorId === user?.userId;
    const replies = getReplies(comment.id);

    return (
      <Box key={comment.id} sx={{ ml: isReply ? 6 : 0, mb: 2 }}>
        <Card variant={isReply ? 'outlined' : 'elevation'}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="start">
              <Box display="flex" gap={2} flex={1}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {comment.author[0]}
                </Avatar>
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="subtitle2">
                      {comment.author}
                    </Typography>
                    <Chip label={comment.authorRole} size="small" />
                    <Typography variant="caption" color="textSecondary">
                      {formatDistanceToNow(parseISO(comment.timestamp), { addSuffix: true })}
                      {comment.edited && ' (edited)'}
                    </Typography>
                  </Box>

                  {editingComment === comment.id ? (
                    <Box>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        sx={{ mb: 1 }}
                      />
                      <Box display="flex" gap={1}>
                        <Button size="small" onClick={handleSaveEdit}>
                          Save
                        </Button>
                        <Button
                          size="small"
                          onClick={() => {
                            setEditingComment(null);
                            setEditContent('');
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {comment.content.split(/(@\w+\s?\w*)/).map((part, index) => {
                          if (part.startsWith('@')) {
                            return (
                              <Chip
                                key={index}
                                label={part}
                                size="small"
                                color="primary"
                                sx={{ mx: 0.5, cursor: 'pointer' }}
                              />
                            );
                          }
                          return part;
                        })}
                      </Typography>

                      {comment.attachments && comment.attachments.length > 0 && (
                        <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                          {comment.attachments.map(att => (
                            <Chip
                              key={att.id}
                              label={att.name}
                              size="small"
                              icon={<AttachFile />}
                              onClick={() => showNotification('Download functionality would be implemented here', 'info')}
                            />
                          ))}
                        </Box>
                      )}

                      <Box display="flex" alignItems="center" gap={2} mt={1}>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Like">
                            <IconButton
                              size="small"
                              onClick={() => handleReaction(comment.id, 'like')}
                              color={comment.reactions?.some(r => r.userId === user?.userId) ? 'primary' : 'default'}
                            >
                              <ThumbUp fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {comment.reactions && comment.reactions.length > 0 && (
                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                              {comment.reactions.length}
                            </Typography>
                          )}
                        </Box>
                        <Button
                          size="small"
                          startIcon={<Reply />}
                          onClick={() => {
                            setReplyTo(comment.id);
                            commentInputRef.current?.focus();
                          }}
                        >
                          Reply
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Box>

              {isAuthor && !editingComment && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    setAnchorEl(e.currentTarget);
                    setSelectedComment(comment);
                  }}
                >
                  <MoreVert />
                </IconButton>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Render replies */}
        {replies.map(reply => renderComment(reply, true))}

        {/* Reply input */}
        {replyTo === comment.id && (
          <Box sx={{ ml: 6, mt: 1 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  Replying to {comment.author}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Write your reply..."
                  value={newComment}
                  onChange={handleCommentChange}
                  inputRef={commentInputRef}
                  sx={{ mt: 1 }}
                />
                <Box display="flex" gap={1} mt={1}>
                  <Button size="small" onClick={handleSendComment}>
                    Send
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setReplyTo(null);
                      setNewComment('');
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">Collaboration</Typography>
            {entityTitle && (
              <Typography variant="body2" color="textSecondary">
                {entityTitle}
              </Typography>
            )}
          </Box>
          <Box display="flex" gap={1}>
            <IconButton size="small">
              <Notifications />
            </IconButton>
            <IconButton size="small" onClick={() => setShowHistory(!showHistory)}>
              <History />
            </IconButton>
          </Box>
        </Box>

        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mt: 1 }}>
          <Tab label="Comments" />
          <Tab label="Activity" />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {tabValue === 0 && (
          <>
            {/* Filter */}
            <Box display="flex" gap={1} mb={2}>
              <Chip
                label="All"
                size="small"
                color={filter === 'all' ? 'primary' : 'default'}
                onClick={() => setFilter('all')}
              />
              <Chip
                label="Mentions"
                size="small"
                color={filter === 'mentions' ? 'primary' : 'default'}
                onClick={() => setFilter('mentions')}
                icon={<Person />}
              />
              <Chip
                label="Attachments"
                size="small"
                color={filter === 'attachments' ? 'primary' : 'default'}
                onClick={() => setFilter('attachments')}
                icon={<AttachFile />}
              />
            </Box>

            {/* Comments List */}
            {getFilteredComments().map(comment => renderComment(comment))}
          </>
        )}

        {tabValue === 1 && (
          /* Activity Log */
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <Edit />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Document updated"
                secondary="Demo Attorney updated the case summary • 2 hours ago"
              />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'success.light' }}>
                  <AttachFile />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="File uploaded"
                secondary="Jane Paralegal uploaded Medical_Records.pdf • 5 hours ago"
              />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'info.light' }}>
                  <Person />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Team member added"
                secondary="John Assistant was added to the case • 1 day ago"
              />
            </ListItem>
          </List>
        )}
      </Box>

      {/* Input Area */}
      {tabValue === 0 && !replyTo && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Add a comment... Use @ to mention team members"
            value={newComment}
            onChange={handleCommentChange}
            inputRef={commentInputRef}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small">
                    <AttachFile />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
            <Box display="flex" gap={1}>
              {attachments.map((file, index) => (
                <Chip
                  key={index}
                  label={file.name}
                  size="small"
                  onDelete={() => setAttachments(attachments.filter((_, i) => i !== index))}
                />
              ))}
            </Box>
            <Button
              variant="contained"
              endIcon={<Send />}
              onClick={handleSendComment}
              disabled={!newComment.trim()}
            >
              Send
            </Button>
          </Box>
        </Box>
      )}

      {/* Comment Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            if (selectedComment) {
              handleEditComment(selectedComment);
            }
            setAnchorEl(null);
          }}
        >
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedComment) {
              handleDeleteComment(selectedComment.id);
            }
            setAnchorEl(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Mention Suggestions Popover */}
      <Popover
        open={Boolean(mentionAnchor)}
        anchorEl={mentionAnchor}
        onClose={() => setMentionAnchor(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <List dense sx={{ minWidth: 200 }}>
          {teamMembers
            .filter(member =>
              member.name.toLowerCase().includes(mentionSearch.toLowerCase())
            )
            .map(member => (
              <ListItem
                key={member.id}
                button
                onClick={() => handleMentionSelect(member)}
              >
                <ListItemAvatar>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {member.name[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={member.name}
                  secondary={member.role}
                />
              </ListItem>
            ))}
        </List>
      </Popover>
    </Paper>
  );
};

export default CollaborationPanel;