import { Home as HomeIcon } from "@mui/icons-material";
import {
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Link,
  Typography,
  InputBase,
  IconButton,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import CheckIcon from '@mui/icons-material/Check';

import FileGrid from "./FileGrid";
import { FileItem } from "./types/file";
import { isDirectory, encodeKey } from "./utils/fileUtils";
import MultiSelectToolbar from "./MultiSelectToolbar";
import { copyPaste, fetchPath } from "./app/transfer";
import { useTransferQueue, useUploadEnqueue } from "./app/transferQueue";
import ProgressDialog from "./ProgressDialog";

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      {children}
    </Box>
  );
}

function PathBreadcrumb({
  path,
  onCwdChange,
}: {
  path: string;
  onCwdChange: (newCwd: string) => void;
}) {
  const parts = path.replace(/\/$/, "").split("/");

  return (
    <Breadcrumbs separator="›" sx={{ padding: 1 }}>
      <Button
        onClick={() => onCwdChange("")}
        sx={{
          minWidth: 0,
          padding: 0,
        }}
      >
        <HomeIcon />
      </Button>
      {parts.map((part, index) =>
        index === parts.length - 1 ? (
          <Typography key={index} color="text.primary">
            {part}
          </Typography>
        ) : (
          <Link
            component="button"
            key={index}
            onClick={() => {
              onCwdChange(parts.slice(0, index + 1).join("/") + "/");
            }}
          >
            {part}
          </Link>
        )
      )}
    </Breadcrumbs>
  );
}

function DropZone({
  children,
  onDrop,
}: {
  children: React.ReactNode;
  onDrop: (files: FileList) => void;
}) {
  const [dragging, setDragging] = useState(false);

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflowY: "auto",
        backgroundColor: (theme) => theme.palette.background.default,
        filter: dragging ? "brightness(0.9)" : "none",
        transition: "filter 0.2s",
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(event.dataTransfer.files);
        setDragging(false);
      }}
    >
      {children}
    </Box>
  );
}

function Main({
  search,
  onError,
  onCwdChange,
  onRefreshReady,
}: {
  search: string;
  onError: (error: Error) => void;
  onCwdChange: (cwd: string) => void;
  onRefreshReady: (refresh: () => void) => void;
}) {
  const [cwd, setCwd] = React.useState("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [multiSelected, setMultiSelected] = useState<string[] | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');

  const transferQueue = useTransferQueue();
  const uploadEnqueue = useUploadEnqueue();

  const fetchFiles = useCallback(() => {
    fetchPath(cwd)
      .then((files) => {
        setFiles(files);
        setMultiSelected(null);
      })
      .catch(onError)
      .finally(() => setLoading(false));
  }, [cwd, onError]);

  // Register the refresh function with parent
  useEffect(() => {
    onRefreshReady(fetchFiles);
  }, [fetchFiles, onRefreshReady]);

  useEffect(() => setLoading(true), [cwd]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Monitor transfer queue for completed uploads
  useEffect(() => {
    const hasCompletedTasks = transferQueue.some(
      task => task.status === "completed"
    );
    
    if (hasCompletedTasks) {
      fetchFiles();
    }
  }, [transferQueue, fetchFiles]);

  // Sync local cwd with parent
  useEffect(() => {
    onCwdChange(cwd);
  }, [cwd, onCwdChange]);

  const filteredFiles = useMemo(
    () =>
      (search
        ? files.filter((file) =>
            file.key.toLowerCase().includes(search.toLowerCase())
          )
        : files
      ).sort((a, b) => (isDirectory(a) ? -1 : isDirectory(b) ? 1 : 0)),
    [files, search]
  );

  const handleMultiSelect = useCallback((key: string) => {
    setMultiSelected((multiSelected) => {
      if (multiSelected === null) {
        return [key];
      } else if (multiSelected.includes(key)) {
        const newSelected = multiSelected.filter((k) => k !== key);
        return newSelected.length ? newSelected : null;
      }
      return [...multiSelected, key];
    });
  }, []);

  const handleRenameSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!multiSelected?.length || !newName.trim()) return;
    
    const oldKey = multiSelected[0];
    const dirPath = oldKey.substring(0, oldKey.lastIndexOf('/') + 1);
    await copyPaste(oldKey, dirPath + newName.trim(), true);
    fetchFiles();
    setIsRenaming(false);
  };

  return (
    <React.Fragment>
      {cwd && <PathBreadcrumb path={cwd} onCwdChange={setCwd} />}
      {loading ? (
        <Centered>
          <CircularProgress />
        </Centered>
      ) : (
        <DropZone
          onDrop={async (files) => {
            uploadEnqueue(
              ...Array.from(files).map((file) => ({ file, basedir: cwd }))
            );
          }}
        >
          <FileGrid
            files={filteredFiles}
            onCwdChange={(newCwd: string) => setCwd(newCwd)}
            multiSelected={multiSelected}
            onMultiSelect={handleMultiSelect}
            emptyMessage={<Centered>No files or folders</Centered>}
            onRefresh={fetchFiles}
          />
        </DropZone>
      )}
      <MultiSelectToolbar
        multiSelected={multiSelected}
        onClose={() => setMultiSelected(null)}
        onDownload={() => {
          if (multiSelected?.length !== 1) return;
          const a = document.createElement("a");
          a.href = `/webdav/${encodeKey(multiSelected[0])}`;
          a.download = multiSelected[0].split("/").pop()!;
          a.click();
        }}
        onRename={() => {
          if (multiSelected?.length !== 1) return;
          setNewName(multiSelected[0].split('/').pop() || '');
          setIsRenaming(true);
        }}
        onDelete={async () => {
          if (!multiSelected?.length) return;
          const filenames = multiSelected
            .map((key) => key.replace(/\/$/, "").split("/").pop())
            .join("\n");
          const confirmMessage = "Delete the following file(s) permanently?";
          if (!window.confirm(`${confirmMessage}\n${filenames}`)) return;
          for (const key of multiSelected)
            await fetch(`/webdav/${encodeKey(key)}`, { method: "DELETE" });
          fetchFiles();
        }}
        onShare={() => {
          if (multiSelected?.length !== 1) return;
          const fileUrl = `https://andrzejrusinowski.pl/static/${encodeKey(multiSelected[0])}`;
          navigator.clipboard.writeText(fileUrl);
        }}
      />
      <ProgressDialog />
      {isRenaming && multiSelected?.length === 1 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 56,
            left: 0,
            right: 0,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            p: 1,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <form onSubmit={handleRenameSubmit} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <InputBase
              autoFocus
              fullWidth
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={() => setIsRenaming(false)}
              sx={{ ml: 2 }}
            />
            <IconButton 
              color="primary" 
              onClick={() => handleRenameSubmit()}
              sx={{ ml: 1 }}
            >
              <CheckIcon />
            </IconButton>
          </form>
        </Box>
      )}
    </React.Fragment>
  );
}

export default Main;
