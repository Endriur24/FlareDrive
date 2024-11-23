import React, { useState } from "react";
import {
  Box,
  Grid,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MimeIcon from "./MimeIcon";
import { humanReadableSize } from "./app/utils";
import FileViewer from "./FileViewer";
import { copyPaste } from "./app/transfer";

export interface FileItem {
  key: string;
  size: number;
  uploaded: string;
  httpMetadata: { contentType: string };
  customMetadata?: { thumbnail?: string };
}

function extractFilename(key: string) {
  return key.split("/").pop();
}

export function encodeKey(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

export function isDirectory(file: FileItem) {
  return file.httpMetadata?.contentType === "application/x-directory";
}

function FileGrid({
  files,
  onCwdChange,
  multiSelected,
  onMultiSelect,
  emptyMessage,
  onRefresh,
}: {
  files: FileItem[];
  onCwdChange: (newCwd: string) => void;
  multiSelected: string[] | null;
  onMultiSelect: (key: string) => void;
  emptyMessage?: React.ReactNode;
  onRefresh: () => void;
}) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

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
    const dirPath = oldKey.substring(0, oldKey.lastIndexOf('/') + 1);
    const newPath = dirPath + newName;
    
    try {
      await copyPaste(oldKey, newPath, true);
      onRefresh();
      
      // Update the selected file with new key
      if (selectedFile && selectedFile.key === oldKey) {
        setSelectedFile({
          ...selectedFile,
          key: newPath
        });
      }
    } catch (error) {
      console.error('Error renaming file:', error);
    }
  };

  const handleFileDelete = async (key: string) => {
    try {
      const response = await fetch(`/webdav/${encodeKey(key)}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
      
      setViewerOpen(false);
      setSelectedFile(null);
      onRefresh();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  return (
    <>
      {files.length === 0 ? (
        emptyMessage
      ) : (
        <Grid container sx={{ paddingBottom: "48px" }}>
          {files.map((file) => (
            <Grid item key={file.key} xs={12} sm={6} md={4} lg={3} xl={2}>
              <ListItemButton
                selected={multiSelected?.includes(file.key)}
                onClick={() => handleFileClick(file)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onMultiSelect(file.key);
                }}
                sx={{ userSelect: "none" }}
              >
                <ListItemIcon>
                  {file.customMetadata?.thumbnail ? (
                    <img
                      src={`/webdav/_$flaredrive$/thumbnails/${file.customMetadata.thumbnail}.png`}
                      alt={file.key}
                      style={{ width: 36, height: 36, objectFit: "cover" }}
                    />
                  ) : (
                    <MimeIcon contentType={file.httpMetadata.contentType} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={extractFilename(file.key)}
                  primaryTypographyProps={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  secondary={
                    <React.Fragment>
                      <Box
                        sx={{
                          display: "inline-block",
                          minWidth: "160px",
                          marginRight: 1,
                        }}
                      >
                        {new Date(file.uploaded).toLocaleString()}
                      </Box>
                      {!isDirectory(file) && humanReadableSize(file.size)}
                    </React.Fragment>
                  }
                />
              </ListItemButton>
            </Grid>
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
    </>
  );
}

export default FileGrid;
