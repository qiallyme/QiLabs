import React, { useState, useEffect } from 'react';
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
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  LinearProgress,
  Breadcrumbs,
  Link,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Alert,
} from '@mui/material';
import {
  Add,
  Upload,
  Download,
  Delete,
  Edit,
  Share,
  MoreVert,
  Folder,
  Description,
  PictureAsPdf,
  Image,
  VideoLibrary,
  AudioFile,
  Archive,
  Search,
  FilterList,
  Sort,
  CloudUpload,
  Lock,
  LockOpen,
  History,
  ContentCopy,
  CreateNewFolder,
  DriveFileMove,
  Star,
  StarBorder,
  Comment,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { format, formatDistanceToNow } from 'date-fns';
import { api } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  caseId?: string;
  caseName?: string;
  folderId?: string;
  uploadedBy: string;
  uploadedAt: string;
  modifiedAt: string;
  version: number;
  tags: string[];
  isEncrypted: boolean;
  isFavorite: boolean;
  permissions: {
    canView: string[];
    canEdit: string[];
    canDelete: string[];
  };
  metadata?: {
    pages?: number;
    duration?: string;
    resolution?: string;
  };
}

interface Folder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
  documentCount: number;
}

interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  size: number;
  changes: string;
}

const Documents: React.FC = () => {
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('modifiedAt');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openFolderDialog, setOpenFolderDialog] = useState(false);
  const [openVersionDialog, setOpenVersionDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [cases, setCases] = useState<{caseId: string; caseName: string}[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');

  useEffect(() => {
    fetchDocuments();
    fetchFolders();
    fetchCases();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await api.get('/documents');
      if (data.success) {
        // Mock data for demo
        const mockDocuments: Document[] = [
          {
            id: '1',
            name: 'Complaint_Smith_v_Johnson.pdf',
            type: 'application/pdf',
            size: 2458624,
            caseId: 'case-001',
            caseName: 'Smith vs. Johnson',
            folderId: 'folder-1',
            uploadedBy: 'Demo Attorney',
            uploadedAt: '2024-01-15T10:30:00Z',
            modifiedAt: '2024-01-20T14:45:00Z',
            version: 3,
            tags: ['complaint', 'filing', 'important'],
            isEncrypted: true,
            isFavorite: true,
            permissions: {
              canView: ['all'],
              canEdit: ['attorney', 'paralegal'],
              canDelete: ['attorney'],
            },
            metadata: { pages: 45 },
          },
          {
            id: '2',
            name: 'Medical_Records_John_Smith.pdf',
            type: 'application/pdf',
            size: 5242880,
            caseId: 'case-001',
            caseName: 'Smith vs. Johnson',
            uploadedBy: 'Jane Paralegal',
            uploadedAt: '2024-01-18T09:15:00Z',
            modifiedAt: '2024-01-18T09:15:00Z',
            version: 1,
            tags: ['medical', 'evidence', 'confidential'],
            isEncrypted: true,
            isFavorite: false,
            permissions: {
              canView: ['attorney', 'paralegal'],
              canEdit: ['attorney'],
              canDelete: ['attorney'],
            },
            metadata: { pages: 123 },
          },
          {
            id: '3',
            name: 'Deposition_Transcript_Johnson.docx',
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            size: 348160,
            caseId: 'case-001',
            caseName: 'Smith vs. Johnson',
            folderId: 'folder-2',
            uploadedBy: 'Court Reporter',
            uploadedAt: '2024-01-22T16:00:00Z',
            modifiedAt: '2024-01-23T10:30:00Z',
            version: 2,
            tags: ['deposition', 'transcript'],
            isEncrypted: false,
            isFavorite: false,
            permissions: {
              canView: ['all'],
              canEdit: ['attorney'],
              canDelete: ['attorney'],
            },
          },
          {
            id: '4',
            name: 'Contract_ABC_Corp.pdf',
            type: 'application/pdf',
            size: 1048576,
            caseId: 'case-003',
            caseName: 'ABC Corp vs. XYZ Inc',
            uploadedBy: 'Demo Attorney',
            uploadedAt: '2024-01-10T11:20:00Z',
            modifiedAt: '2024-01-10T11:20:00Z',
            version: 1,
            tags: ['contract', 'review'],
            isEncrypted: true,
            isFavorite: false,
            permissions: {
              canView: ['attorney', 'client'],
              canEdit: ['attorney'],
              canDelete: ['attorney'],
            },
            metadata: { pages: 25 },
          },
          {
            id: '5',
            name: 'Evidence_Photos.zip',
            type: 'application/zip',
            size: 15728640,
            caseId: 'case-001',
            caseName: 'Smith vs. Johnson',
            folderId: 'folder-3',
            uploadedBy: 'Investigator',
            uploadedAt: '2024-01-20T13:00:00Z',
            modifiedAt: '2024-01-20T13:00:00Z',
            version: 1,
            tags: ['evidence', 'photos'],
            isEncrypted: true,
            isFavorite: true,
            permissions: {
              canView: ['attorney', 'paralegal'],
              canEdit: ['attorney'],
              canDelete: ['attorney'],
            },
          },
          {
            id: '6',
            name: 'Will_and_Testament_Williams.pdf',
            type: 'application/pdf',
            size: 524288,
            caseId: 'case-002',
            caseName: 'Estate of Williams',
            uploadedBy: 'Demo Attorney',
            uploadedAt: '2024-01-05T14:30:00Z',
            modifiedAt: '2024-01-12T09:15:00Z',
            version: 2,
            tags: ['will', 'estate', 'confidential'],
            isEncrypted: true,
            isFavorite: false,
            permissions: {
              canView: ['attorney'],
              canEdit: ['attorney'],
              canDelete: ['attorney'],
            },
            metadata: { pages: 12 },
          },
        ];
        setDocuments(mockDocuments);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      showNotification('Error loading documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    // Mock folders
    const mockFolders: Folder[] = [
      {
        id: 'folder-1',
        name: 'Court Filings',
        createdAt: '2024-01-01T00:00:00Z',
        documentCount: 8,
      },
      {
        id: 'folder-2',
        name: 'Depositions',
        createdAt: '2024-01-01T00:00:00Z',
        documentCount: 5,
      },
      {
        id: 'folder-3',
        name: 'Evidence',
        createdAt: '2024-01-01T00:00:00Z',
        documentCount: 12,
      },
      {
        id: 'folder-4',
        name: 'Client Communications',
        createdAt: '2024-01-01T00:00:00Z',
        documentCount: 15,
      },
    ];
    setFolders(mockFolders);
  };

  const fetchCases = async () => {
    try {
      const data = await api.get('/cases');
      if (data.success) {
        const casesData = data.data.map((c: any) => ({
          caseId: c.caseId,
          caseName: c.caseName
        }));
        setCases(casesData);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    // Handle file upload
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onloadstart = () => setUploadProgress(0);
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress((e.loaded / e.total) * 100);
        }
      };
      reader.onload = () => {
        // Create new document
        const selectedCase = cases.find(c => c.caseId === selectedCaseId);
        const newDoc: Document = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type,
          size: file.size,
          caseId: selectedCaseId || undefined,
          caseName: selectedCase?.caseName || undefined,
          folderId: selectedFolder || undefined,
          uploadedBy: user?.firstName + ' ' + user?.lastName || 'Current User',
          uploadedAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          version: 1,
          tags: [],
          isEncrypted: false,
          isFavorite: false,
          permissions: {
            canView: ['all'],
            canEdit: ['attorney', 'paralegal'],
            canDelete: ['attorney'],
          },
        };
        setDocuments([newDoc, ...documents]);
        showNotification(`${file.name} uploaded successfully`, 'success');
        setUploadProgress(0);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string): React.ReactNode => {
    if (type.includes('pdf')) return <PictureAsPdf />;
    if (type.includes('image')) return <Image />;
    if (type.includes('video')) return <VideoLibrary />;
    if (type.includes('audio')) return <AudioFile />;
    if (type.includes('zip') || type.includes('rar')) return <Archive />;
    return <Description />;
  };

  const handleDownload = async (document: Document) => {
    try {
      // Simulate download
      showNotification(`Downloading ${document.name}...`, 'info');
      // In real app, would fetch from S3
      setTimeout(() => {
        showNotification(`${document.name} downloaded successfully`, 'success');
      }, 1500);
    } catch (error) {
      showNotification('Error downloading document', 'error');
    }
  };

  const handleDelete = async (document: Document) => {
    if (window.confirm(`Are you sure you want to delete ${document.name}?`)) {
      setDocuments(documents.filter(d => d.id !== document.id));
      showNotification('Document deleted successfully', 'success');
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName) {
      const newFolder: Folder = {
        id: Date.now().toString(),
        name: newFolderName,
        parentId: selectedFolder || undefined,
        createdAt: new Date().toISOString(),
        documentCount: 0,
      };
      setFolders([...folders, newFolder]);
      setNewFolderName('');
      setOpenFolderDialog(false);
      showNotification('Folder created successfully', 'success');
    }
  };

  const handleToggleFavorite = (document: Document) => {
    const updatedDocs = documents.map(doc =>
      doc.id === document.id ? { ...doc, isFavorite: !doc.isFavorite } : doc
    );
    setDocuments(updatedDocs);
  };

  const handleViewVersions = async (document: Document) => {
    // Mock version history
    const mockVersions: DocumentVersion[] = [
      {
        id: '1',
        documentId: document.id,
        version: 3,
        uploadedBy: 'Demo Attorney',
        uploadedAt: '2024-01-20T14:45:00Z',
        size: document.size,
        changes: 'Updated section 3.2 with new evidence',
      },
      {
        id: '2',
        documentId: document.id,
        version: 2,
        uploadedBy: 'Jane Paralegal',
        uploadedAt: '2024-01-18T10:30:00Z',
        size: document.size * 0.95,
        changes: 'Added witness statements',
      },
      {
        id: '3',
        documentId: document.id,
        version: 1,
        uploadedBy: 'Demo Attorney',
        uploadedAt: '2024-01-15T10:30:00Z',
        size: document.size * 0.9,
        changes: 'Initial version',
      },
    ];
    setVersions(mockVersions);
    setSelectedDocument(document);
    setOpenVersionDialog(true);
  };

  const filterDocuments = () => {
    let filtered = [...documents];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        doc.caseName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(doc => {
        switch (filterType) {
          case 'pdf': return doc.type.includes('pdf');
          case 'word': return doc.type.includes('word') || doc.type.includes('document');
          case 'image': return doc.type.includes('image');
          case 'other': return !doc.type.includes('pdf') && !doc.type.includes('word') && !doc.type.includes('image');
          default: return true;
        }
      });
    }

    // Filter by tab
    switch (tabValue) {
      case 1: // Recent
        filtered = filtered.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()).slice(0, 10);
        break;
      case 2: // Favorites
        filtered = filtered.filter(doc => doc.isFavorite);
        break;
      case 3: // Encrypted
        filtered = filtered.filter(doc => doc.isEncrypted);
        break;
    }

    // Filter by folder
    if (selectedFolder) {
      filtered = filtered.filter(doc => doc.folderId === selectedFolder);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.size - a.size;
        case 'modifiedAt':
        default:
          return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
      }
    });

    return filtered;
  };

  const filteredDocuments = filterDocuments();
  const paginatedDocuments = filteredDocuments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box {...getRootProps()}>
      <input {...getInputProps()} />
      
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Documents</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<CreateNewFolder />}
            onClick={() => setOpenFolderDialog(true)}
          >
            New Folder
          </Button>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={() => setOpenUploadDialog(true)}
          >
            Upload Documents
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Documents
                  </Typography>
                  <Typography variant="h4">
                    {documents.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <Description />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Size
                  </Typography>
                  <Typography variant="h4">
                    {formatFileSize(documents.reduce((sum, doc) => sum + doc.size, 0))}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.light' }}>
                  <Archive />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Encrypted
                  </Typography>
                  <Typography variant="h4">
                    {documents.filter(d => d.isEncrypted).length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light' }}>
                  <Lock />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Shared
                  </Typography>
                  <Typography variant="h4">
                    {documents.filter(d => d.permissions?.canView?.includes('client')).length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  <Share />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Folders Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Folders
            </Typography>
            <List>
              <ListItem
                button
                selected={!selectedFolder}
                onClick={() => setSelectedFolder(null)}
              >
                <ListItemAvatar>
                  <Avatar>
                    <Folder />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="All Documents"
                  secondary={`${documents.length} documents`}
                />
              </ListItem>
              {folders.map((folder) => (
                <ListItem
                  key={folder.id}
                  button
                  selected={selectedFolder === folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <Folder />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={folder.name}
                    secondary={`${documents.filter(d => d.folderId === folder.id).length} documents`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Documents List */}
        <Grid item xs={12} md={9}>
          <Paper>
            {/* Tabs */}
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab label="All Documents" />
              <Tab label="Recent" />
              <Tab label="Favorites" />
              <Tab label="Encrypted" />
            </Tabs>

            {/* Search and Filters */}
            <Box p={2} display="flex" gap={2} alignItems="center">
              <TextField
                size="small"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1 }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="word">Word</MenuItem>
                  <MenuItem value="image">Images</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="modifiedAt">Modified Date</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="size">Size</MenuItem>
                </Select>
              </FormControl>
              <IconButton
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              >
                {viewMode === 'list' ? <GridView /> : <ViewList />}
              </IconButton>
            </Box>

            <Divider />

            {loading ? (
              <LinearProgress />
            ) : isDragActive ? (
              <Box
                sx={{
                  p: 8,
                  textAlign: 'center',
                  bgcolor: 'action.hover',
                  border: '2px dashed',
                  borderColor: 'primary.main',
                }}
              >
                <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6">Drop files here to upload</Typography>
              </Box>
            ) : viewMode === 'list' ? (
              /* List View */
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Case</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Modified</TableCell>
                        <TableCell>Uploaded By</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedDocuments.map((document) => (
                        <TableRow key={document.id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {getFileIcon(document.type)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2">
                                  {document.name}
                                </Typography>
                                <Box display="flex" gap={0.5}>
                                  {document.isEncrypted && (
                                    <Chip
                                      icon={<Lock />}
                                      label="Encrypted"
                                      size="small"
                                      color="success"
                                    />
                                  )}
                                  {document.tags.map((tag) => (
                                    <Chip
                                      key={tag}
                                      label={tag}
                                      size="small"
                                      variant="outlined"
                                    />
                                  ))}
                                </Box>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{document.caseName || '-'}</TableCell>
                          <TableCell>{formatFileSize(document.size)}</TableCell>
                          <TableCell>
                            {formatDistanceToNow(new Date(document.modifiedAt), {
                              addSuffix: true,
                            })}
                          </TableCell>
                          <TableCell>{document.uploadedBy}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleToggleFavorite(document)}
                            >
                              {document.isFavorite ? <Star /> : <StarBorder />}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDownload(document)}
                            >
                              <Download />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleViewVersions(document)}
                            >
                              <History />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setAnchorEl(e.currentTarget);
                                setSelectedDocument(document);
                              }}
                            >
                              <MoreVert />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredDocuments.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              </>
            ) : (
              /* Grid View */
              <Grid container spacing={2} sx={{ p: 2 }}>
                {paginatedDocuments.map((document) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={document.id}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                          <Avatar>{getFileIcon(document.type)}</Avatar>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleFavorite(document)}
                          >
                            {document.isFavorite ? <Star /> : <StarBorder />}
                          </IconButton>
                        </Box>
                        <Typography variant="body2" noWrap title={document.name}>
                          {document.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatFileSize(document.size)} • {formatDistanceToNow(new Date(document.modifiedAt), { addSuffix: true })}
                        </Typography>
                        <Box display="flex" gap={0.5} mt={1}>
                          <IconButton size="small" onClick={() => handleDownload(document)}>
                            <Download />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleViewVersions(document)}>
                            <History />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setAnchorEl(e.currentTarget);
                              setSelectedDocument(document);
                            }}
                          >
                            <MoreVert />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Upload Dialog */}
      <Dialog
        open={openUploadDialog}
        onClose={() => {
          setOpenUploadDialog(false);
          setSelectedCaseId('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Documents</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Case (Optional)</InputLabel>
            <Select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              label="Select Case (Optional)"
            >
              <MenuItem value="">
                <em>No Case Selected</em>
              </MenuItem>
              {cases.map((case_) => (
                <MenuItem key={case_.caseId} value={case_.caseId}>
                  {case_.caseName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drag & drop files here, or click to select
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Supported formats: PDF, Word, Excel, Images, and more
            </Typography>
          </Box>
          
          {selectedCaseId && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Documents will be associated with: {cases.find(c => c.caseId === selectedCaseId)?.caseName}
            </Alert>
          )}
          
          {uploadProgress > 0 && (
            <Box mt={2}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" color="textSecondary">
                Uploading... {uploadProgress.toFixed(0)}%
              </Typography>
            </Box>
          )}
          
          <Alert severity="info" sx={{ mt: 2 }}>
            All documents are encrypted at rest and in transit for security
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenUploadDialog(false);
            setSelectedCaseId('');
          }}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog
        open={openFolderDialog}
        onClose={() => setOpenFolderDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Folder Name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFolderDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog
        open={openVersionDialog}
        onClose={() => setOpenVersionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Version History - {selectedDocument?.name}
        </DialogTitle>
        <DialogContent>
          <List>
            {versions.map((version) => (
              <ListItem key={version.id} divider>
                <ListItemText
                  primary={`Version ${version.version}`}
                  secondary={
                    <>
                      <Typography variant="body2">
                        {version.changes}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {version.uploadedBy} • {format(new Date(version.uploadedAt), 'PPp')} • {formatFileSize(version.size)}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <Button size="small" startIcon={<Download />}>
                    Download
                  </Button>
                  <Button size="small" color="primary">
                    Restore
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVersionDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Document Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          if (selectedDocument) {
            navigator.clipboard.writeText(`${window.location.origin}/documents/${selectedDocument.id}`);
            showNotification('Link copied to clipboard', 'success');
          }
          setAnchorEl(null);
        }}>
          <ContentCopy fontSize="small" sx={{ mr: 1 }} />
          Copy Link
        </MenuItem>
        <MenuItem onClick={() => {
          setAnchorEl(null);
          // Open share dialog
        }}>
          <Share fontSize="small" sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedDocument) {
            showNotification('Collaboration panel would open here for document: ' + selectedDocument.name, 'info');
          }
          setAnchorEl(null);
        }}>
          <Comment fontSize="small" sx={{ mr: 1 }} />
          Comments & Notes
        </MenuItem>
        <MenuItem onClick={() => {
          setAnchorEl(null);
          // Open move dialog
        }}>
          <DriveFileMove fontSize="small" sx={{ mr: 1 }} />
          Move
        </MenuItem>
        <MenuItem onClick={() => {
          setAnchorEl(null);
          // Open rename dialog
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Rename
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            if (selectedDocument) {
              handleDelete(selectedDocument);
            }
            setAnchorEl(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

// Fix the missing imports
const GridView = () => <svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z"/></svg>;
const ViewList = () => <svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>;

export default Documents;