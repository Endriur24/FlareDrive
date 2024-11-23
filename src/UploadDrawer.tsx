import React, { useCallback, useMemo } from "react";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Paper,
} from "@mui/material";
import {
  Camera as CameraIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Image as ImageIcon,
  Upload as UploadIcon,
  FolderZip as FolderZipIcon,
} from "@mui/icons-material";
import { createFolder } from "./app/transfer";
import { useUploadEnqueue } from "./app/transferQueue";

function UploadDrawer({
  open,
  anchorEl,
  setOpen,
  cwd,
  onUpload,
}: {
  open: boolean;
  anchorEl: HTMLElement | null;
  setOpen: (open: boolean) => void;
  cwd: string;
  onUpload: () => void;
}) {
  const uploadEnqueue = useUploadEnqueue();

  const handleUpload = useCallback(
    (action: string) => () => {
      const input = document.createElement("input");
      input.type = "file";
      switch (action) {
        case "photo":
          input.accept = "image/*";
          input.capture = "environment";
          break;
        case "image":
          input.accept = "image/*,video/*";
          break;
        case "file":
          input.accept = "*/*";
          break;
      }
      input.multiple = true;
      input.onchange = async () => {
        if (!input.files) return;
        const files = Array.from(input.files);
        uploadEnqueue(...files.map((file) => ({ file, basedir: cwd })));
        setOpen(false);
        onUpload();
      };
      input.click();
    },
    [cwd, onUpload, setOpen, uploadEnqueue]
  );

  const takePhoto = useMemo(() => handleUpload("photo"), [handleUpload]);
  const uploadImage = useMemo(() => handleUpload("image"), [handleUpload]);
  const uploadFile = useMemo(() => handleUpload("file"), [handleUpload]);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={() => setOpen(false)}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Paper sx={{ width: 280 }}>
        <List sx={{ py: 0.5 }}>
          <ListItemButton onClick={uploadFile}>
            <ListItemIcon>
              <FolderZipIcon sx={{ color: '#5f6368' }} />
            </ListItemIcon>
            <ListItemText 
              primary="File upload" 
              primaryTypographyProps={{ 
                sx: { 
                  color: '#3c4043',
                  fontSize: '0.875rem'
                } 
              }} 
            />
          </ListItemButton>
          <ListItemButton onClick={uploadImage}>
            <ListItemIcon>
              <ImageIcon sx={{ color: '#5f6368' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Image/Video upload" 
              primaryTypographyProps={{ 
                sx: { 
                  color: '#3c4043',
                  fontSize: '0.875rem'
                } 
              }} 
            />
          </ListItemButton>
          <ListItemButton onClick={takePhoto}>
            <ListItemIcon>
              <CameraIcon sx={{ color: '#5f6368' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Take photo" 
              primaryTypographyProps={{ 
                sx: { 
                  color: '#3c4043',
                  fontSize: '0.875rem'
                } 
              }} 
            />
          </ListItemButton>
          <ListItemButton
            onClick={async () => {
              setOpen(false);
              await createFolder(cwd);
              onUpload();
            }}
          >
            <ListItemIcon>
              <CreateNewFolderIcon sx={{ color: '#5f6368' }} />
            </ListItemIcon>
            <ListItemText 
              primary="New folder" 
              primaryTypographyProps={{ 
                sx: { 
                  color: '#3c4043',
                  fontSize: '0.875rem'
                } 
              }} 
            />
          </ListItemButton>
        </List>
      </Paper>
    </Popover>
  );
}

export default UploadDrawer;
