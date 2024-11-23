import React, { useState } from "react";
import { Grid } from "@mui/material";
import FileGridItem from "./components/FileGridItem";
import FileViewer from "./FileViewer";
import { renameFile, deleteFile } from "./services/fileOperations";
import NotificationSnackbar from "./components/common/NotificationSnackbar";
import { AlertColor } from "@mui/material";
import { isDirectory } from "./utils/fileUtils";
import { FileItem } from "./types/file";

interface FileGridProps {
  files: FileItem[];
  onCwdChange: (newCwd: string) => void;
  multiSelected: string[] | null;
  onMultiSelect: (key: string) => void;
  emptyMessage?: React.ReactNode;
  onRefresh: () => void;
}

function FileGrid({
  files,
  onCwdChange,
  multiSelected,
  onMultiSelect,
  emptyMessage,
  onRefresh,
}: FileGridProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const nonDirectoryFiles = files.filter(file => !isDirectory(file));
  const selectedFileIndex = selectedFile 
    ? nonDirectoryFiles.findIndex(f => f.key === selectedFile.key)
    : -1;

  const handleFileClick = (file: FileItem) => {
    if (multiSelected !== null) {
      onMultiSelect(file.key);
    } else if (isDirectory(file)) {
      onCwdChange(file.key + "/");
    } else {
      setSelectedFile(file);
      setViewerOpen(true);
    }
  };

  const handleFileRename = async (oldKey: string, newName: string) => {
    try {
      await renameFile(oldKey, newName);
      onRefresh();
      
      // Update the selected file with new key
      if (selectedFile && selectedFile.key === oldKey) {
        const dirPath = oldKey.substring(0, oldKey.lastIndexOf('/') + 1);
        const newPath = dirPath + newName;
        setSelectedFile({
          ...selectedFile,
          key: newPath
        });
      }

      setNotification({
        open: true,
        message: 'File renamed successfully',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Error renaming file',
        severity: 'error'
      });
    }
  };

  const handleFileDelete = async (key: string) => {
    // File was already deleted in FileViewer, just update UI
    setViewerOpen(false);
    setSelectedFile(null);
    onRefresh();
    
    setNotification({
      open: true,
      message: 'File deleted successfully',
      severity: 'success'
    });
  };

  return (
    <>
      {files.length === 0 ? (
        emptyMessage
      ) : (
        <Grid container sx={{ paddingBottom: "48px" }}>
          {files.map((file) => (
            <FileGridItem
              key={file.key}
              file={file}
              isSelected={multiSelected?.includes(file.key) || false}
              onClick={() => handleFileClick(file)}
              onContextMenu={(e) => {
                e.preventDefault();
                onMultiSelect(file.key);
              }}
            />
          ))}
        </Grid>
      )}
      <FileViewer
        open={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          setSelectedFile(null);
        }}
        file={selectedFile}
        files={nonDirectoryFiles}
        currentIndex={selectedFileIndex}
        onNavigate={(file) => setSelectedFile(file)}
        onRename={handleFileRename}
        onDelete={handleFileDelete}
      />
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      />
    </>
  );
}

export default FileGrid;
