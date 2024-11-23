import React, { useState, useEffect, useCallback } from 'react';
import { 
  Dialog, 
  DialogContent, 
  IconButton, 
  AppBar, 
  Toolbar, 
  Typography,
  Tooltip,
  Stack,
  Snackbar,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { encodeKey } from './FileGrid';
import type { FileItem } from './FileGrid';

interface FileViewerProps {
  open: boolean;
  onClose: () => void;
  file: FileItem | null;
  files: FileItem[];
  currentIndex: number;
  onNavigate: (file: FileItem) => void;
  onRename: (oldKey: string, newName: string) => void;
  onDelete: (key: string) => void;
}

function FileViewer({ 
  open, 
  onClose, 
  file, 
  files, 
  currentIndex, 
  onNavigate,
  onRename,
  onDelete
}: FileViewerProps) {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      onNavigate(files[currentIndex - 1]);
    } else if (e.key === 'ArrowRight' && currentIndex < files.length - 1) {
      onNavigate(files[currentIndex + 1]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [currentIndex, files, onNavigate, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleRenameClick = () => {
    if (!file) return;
    const newName = window.prompt("Rename to:");
    if (!newName) return;
    onRename(file.key, newName);
  };

  const handleCopyLink = () => {
    if (file) {
      const url = new URL(`/webdav/${encodeKey(file.key)}`, window.location.origin);
      navigator.clipboard.writeText(url.toString());
      setSnackbarMessage('Link copied to clipboard');
      setSnackbarOpen(true);
    }
  };

  if (!file) return null;

  const fileUrl = `/webdav/${encodeKey(file.key)}`;
  const isImage = file.httpMetadata.contentType.startsWith('image/');
  const isPdf = file.httpMetadata.contentType === 'application/pdf';
  const fileName = file.key.split('/').pop();

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen
        PaperProps={{
          style: {
            backgroundColor: '#000000e0'
          }
        }}
      >
        <AppBar position="relative" color="default">
          <Toolbar>
            <Stack direction="row" spacing={1} sx={{ mr: 2 }}>
              <IconButton
                color="inherit"
                onClick={() => currentIndex > 0 && onNavigate(files[currentIndex - 1])}
                disabled={currentIndex <= 0}
              >
                <ArrowBackIcon />
              </IconButton>
              <IconButton
                color="inherit"
                onClick={() => currentIndex < files.length - 1 && onNavigate(files[currentIndex + 1])}
                disabled={currentIndex >= files.length - 1}
              >
                <ArrowForwardIcon />
              </IconButton>
            </Stack>

            <Typography 
              variant="h6" 
              sx={{ flex: 1 }}
            >
              {fileName}
            </Typography>

            <Stack direction="row" spacing={1}>
              <Tooltip title="Rename">
                <IconButton color="inherit" onClick={handleRenameClick}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Copy link">
                <IconButton color="inherit" onClick={handleCopyLink}>
                  <ShareIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton 
                  color="inherit" 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this file?')) {
                      onDelete(file.key);
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              <IconButton
                edge="end"
                color="inherit"
                onClick={onClose}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>
        <DialogContent sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: 0
        }}>
          {isImage ? (
            <img 
              src={fileUrl} 
              alt={file.key}
              style={{ 
                maxWidth: '100%', 
                maxHeight: 'calc(100vh - 64px)',
                objectFit: 'contain'
              }} 
            />
          ) : isPdf ? (
            <iframe
              src={fileUrl}
              title={`PDF viewer - ${file.key}`}
              style={{
                width: '100%',
                height: 'calc(100vh - 64px)',
                border: 'none'
              }}
            />
          ) : (
            <iframe
              src={fileUrl}
              title={`File viewer - ${file.key}`}
              style={{
                width: '100%',
                height: 'calc(100vh - 64px)',
                border: 'none',
                backgroundColor: 'white'
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="info" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default FileViewer;
