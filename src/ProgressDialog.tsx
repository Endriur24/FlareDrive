import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { TransferTask, useTransferQueue } from "./app/transferQueue";
import { humanReadableSize } from "./app/utils";
import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
} from "@mui/icons-material";

function ProgressDialog() {
  const transferQueue: TransferTask[] = useTransferQueue();
  const [open, setOpen] = useState(false);
  const tasks = transferQueue.filter((task) => task.type === "upload");

  // Control dialog visibility based on upload states
  useEffect(() => {
    const hasActiveTasks = tasks.some(
      task => task.status === "pending" || task.status === "in-progress"
    );
    
    if (hasActiveTasks) {
      setOpen(true);
    } else {
      // If all tasks are complete/failed, close after delay
      const allTasksComplete = tasks.every(
        task => task.status === "completed" || task.status === "failed"
      );
      
      if (allTasksComplete && open) {
        const timer = window.setTimeout(() => {
          setOpen(false);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [tasks, open]);

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
      <DialogTitle>Upload Progress</DialogTitle>
      {tasks.length === 0 ? (
        <DialogContent>
          <Typography textAlign="center" color="text.secondary">
            No uploads in progress
          </Typography>
        </DialogContent>
      ) : (
        <DialogContent sx={{ padding: 0 }}>
          <List>
            {tasks.map((task) => (
              <ListItem key={task.name}>
                <ListItemText
                  primary={task.name}
                  secondary={`${humanReadableSize(
                    task.loaded
                  )} / ${humanReadableSize(task.total)}`}
                />
                {task.status === "failed" ? (
                  <Tooltip title={task.error?.message || "Upload failed"}>
                    <ErrorOutlineIcon color="error" />
                  </Tooltip>
                ) : task.status === "completed" ? (
                  <CheckCircleOutlineIcon color="success" />
                ) : task.status === "in-progress" ? (
                  <CircularProgress
                    variant="determinate"
                    size={24}
                    value={(task.loaded / task.total) * 100}
                  />
                ) : null}
              </ListItem>
            ))}
          </List>
        </DialogContent>
      )}
    </Dialog>
  );
}

export default ProgressDialog;
