import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  InputBase,
  Typography,
  IconButton
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { FileItem } from '../../types/file';
import { getFileExtension, getNameWithoutExtension } from '../../utils/fileUtils';

interface FileRenameInputProps {
  file: FileItem;
  onSubmit?: (newName: string) => void;
  onCancel?: () => void;
}

function FileRenameInput({ file, onSubmit, onCancel }: FileRenameInputProps) {
  const fileName = file.key.split('/').pop() || '';
  const extension = getFileExtension(fileName);
  const [newName, setNewName] = useState(getNameWithoutExtension(fileName));
  
  const checkButtonRef = useRef<HTMLButtonElement>(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    setNewName(getNameWithoutExtension(fileName));
  }, [fileName]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!newName.trim()) {
      onCancel?.();
      return;
    }

    const newFullName = extension ? `${newName.trim()}.${extension}` : newName.trim();
    
    if (newFullName !== fileName) {
      onSubmit?.(newFullName);
    } else {
      onCancel?.();
    }
    
    isSubmittingRef.current = false;
  };

  const handleCheckClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isSubmittingRef.current = true;
    handleSubmit();
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Don't close if clicking the check button
    if (checkButtonRef.current?.contains(e.relatedTarget as Node) || isSubmittingRef.current) {
      return;
    }
    onCancel?.();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        flex: '1 1 auto',
        minWidth: 0
      }}>
        <form 
          onSubmit={handleSubmit} 
          style={{ 
            display: 'flex', 
            alignItems: 'center',
            width: '100%',
            minWidth: 0
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            minWidth: 0,
            flex: 1
          }}>
            <InputBase
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleInputBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                } else if (e.key === 'Escape') {
                  onCancel?.();
                }
              }}
              sx={{ 
                color: 'inherit',
                fontSize: '1.25rem',
                flex: '1 1 auto',
                minWidth: 0,
                '& input': {
                  padding: '0'
                }
              }}
            />
            {extension && (
              <Typography 
                variant="h6" 
                component="span"
                sx={{ 
                  display: 'inline',
                  ml: 0.5,
                  flexShrink: 0
                }}
              >
                .{extension}
              </Typography>
            )}
          </Box>
        </form>
      </Box>
      <IconButton 
        ref={checkButtonRef}
        color="inherit"
        onClick={handleCheckClick}
        size="small"
        sx={{ ml: 1, flexShrink: 0 }}
      >
        <CheckIcon />
      </IconButton>
    </Box>
  );
}

export default FileRenameInput;
