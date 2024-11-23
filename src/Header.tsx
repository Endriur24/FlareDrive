import { IconButton, InputBase, Toolbar } from "@mui/material";
import { CloudSync as CloudSyncIcon } from "@mui/icons-material";

function Header({
  search,
  onSearchChange,
  setShowProgressDialog,
}: {
  search: string;
  onSearchChange: (newSearch: string) => void;
  setShowProgressDialog: (show: boolean) => void;
}) {
  return (
    <Toolbar disableGutters sx={{ padding: 1 }}>
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
      <IconButton
        aria-label="Show Progress"
        color="inherit"
        sx={{ marginLeft: 0.5 }}
        onClick={() => setShowProgressDialog(true)}
      >
        <CloudSyncIcon />
      </IconButton>
    </Toolbar>
  );
}

export default Header;
