import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Stack,
  Tooltip,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { FileItem } from '../../types/file';
import FileRenameInput from '../viewer/FileRenameInput';
import { getFileShareLink } from '../../services/fileOperations';

interface ViewerToolbarProps {
  file: FileItem;
  currentIndex: number;
  totalFiles: number;
  isRenaming: boolean;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onRenameStart: () => void;
  onRenameSubmit: (oldKey: string, newName: string) => void;
  onRenameCancel: () => void;
  onDelete: () => void;
  onShareLink: (link: string) => void;
}

function ViewerToolbar({
  file,
  currentIndex,
  totalFiles,
  isRenaming,
  onClose,
  onNavigate,
  onRenameStart,
  onRenameSubmit,
  onRenameCancel,
  onDelete,
  onShareLink
}: ViewerToolbarProps) {
  const fileName = file.key.split('/').pop() || '';

  const handleShareClick = async () => {
    const link = await getFileShareLink(file.key);
    onShareLink(link);
  };

  const handleRenameSubmit = (newName: string) => {
    onRenameSubmit(file.key, newName);
    // Immediately exit rename mode after submission
    onRenameCancel();
  };

  return (
    <AppBar position="relative" color="default">
      <Toolbar>
        <Stack direction="row" spacing={1} sx={{ mr: 2 }}>
          <IconButton
            color="inherit"
            onClick={() => onNavigate('prev')}
            disabled={currentIndex <= 0}
          >
            <ArrowBackIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => onNavigate('next')}
            disabled={currentIndex >= totalFiles - 1}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          {isRenaming ? (
            <FileRenameInput 
              file={file} 
              onSubmit={handleRenameSubmit}
              onCancel={onRenameCancel}
            />
          ) : (
            <>
              <Typography variant="h6" sx={{ flex: 1 }}>
                {fileName}
              </Typography>
              <IconButton 
                color="inherit" 
                onClick={onRenameStart}
                size="small"
                sx={{ ml: 1 }}
              >
                <EditIcon />
              </IconButton>
            </>
          )}
        </Box>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Copy link">
            <IconButton color="inherit" onClick={handleShareClick}>
              <ShareIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              color="inherit" 
              onClick={onDelete}
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
  );
}

export default ViewerToolbar;
