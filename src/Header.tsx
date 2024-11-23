import { Badge, Button, IconButton, InputBase, Toolbar } from "@mui/material";
import { CloudSync as CloudSyncIcon, Upload as UploadIcon } from "@mui/icons-material";
import { useTransferQueue } from "./app/transferQueue";

function Header({
  search,
  onSearchChange,
  onUploadClick,
}: {
  search: string;
  onSearchChange: (newSearch: string) => void;
  onUploadClick: (event: React.MouseEvent<HTMLElement>) => void;
}) {
  const transferQueue = useTransferQueue();
  const activeUploads = transferQueue.filter(
    task => task.type === "upload" && (task.status === "pending" || task.status === "in-progress")
  ).length;

  return (
    <Toolbar disableGutters sx={{ padding: 1, gap: 1 }}>
      <Button
        variant="contained"
        startIcon={<UploadIcon />}
        onClick={onUploadClick}
        sx={{
          borderRadius: '999px',
          textTransform: 'none',
          backgroundColor: '#fff',
          color: '#1a73e8',
          border: '1px solid #dadce0',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#f8f9fa',
            boxShadow: 'none'
          }
        }}
      >
        New
      </Button>
      <InputBase
        size="small"
        fullWidth
        placeholder="Search…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{
          backgroundColor: "whitesmoke",
          borderRadius: "999px",
          padding: "8px 16px",
        }}
      />
      <Badge badgeContent={activeUploads} color="primary" overlap="circular">
        <IconButton
          aria-label="Show Progress"
          color="inherit"
        >
          <CloudSyncIcon />
        </IconButton>
      </Badge>
    </Toolbar>
  );
}

export default Header;
