import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, AlertColor } from '@mui/material';
import type { FileItem } from './types/file';
import ViewerToolbar from './components/viewer/ViewerToolbar';
import FilePreview from './components/viewer/FilePreview';
import NotificationSnackbar from './components/common/NotificationSnackbar';
import { deleteFile } from './services/fileOperations';

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

interface NotificationState {
  open: boolean;
  message: string;
  severity: AlertColor;
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
  const [isRenaming, setIsRenaming] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isRenaming) {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate(files[currentIndex - 1]);
      } else if (e.key === 'ArrowRight' && currentIndex < files.length - 1) {
        onNavigate(files[currentIndex + 1]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    }
  }, [currentIndex, files, onNavigate, onClose, isRenaming]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentIndex > 0) {
      onNavigate(files[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < files.length - 1) {
      onNavigate(files[currentIndex + 1]);
    }
  };

  const handleDelete = async () => {
    if (!file || !window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await deleteFile(file.key);
      onDelete(file.key);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to delete file',
        severity: 'error'
      });
    }
  };

  const handleShareLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setNotification({
      open: true,
      message: 'Link copied to clipboard',
      severity: 'info'
    });
  };

  if (!file) return null;

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
        <ViewerToolbar
          file={file}
          currentIndex={currentIndex}
          totalFiles={files.length}
          isRenaming={isRenaming}
          onClose={onClose}
          onNavigate={handleNavigate}
          onRenameStart={() => setIsRenaming(true)}
          onRenameSubmit={onRename}
          onRenameCancel={() => setIsRenaming(false)}
          onDelete={handleDelete}
          onShareLink={handleShareLink}
        />
        <FilePreview file={file} />
      </Dialog>
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />
    </>
  );
}

export default FileViewer;
