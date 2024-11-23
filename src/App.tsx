import { ThemeProvider } from "@emotion/react";
import {
  createTheme,
  CssBaseline,
  GlobalStyles,
  Snackbar,
  Stack,
} from "@mui/material";
import React, { useState, useRef } from "react";

import Header from "./Header";
import Main from "./Main";
import ProgressDialog from "./ProgressDialog";
import { TransferQueueProvider, useTransferQueue } from "./app/transferQueue";
import UploadDrawer from "./UploadDrawer";

const globalStyles = (
  <GlobalStyles styles={{ "html, body, #root": { height: "100%" } }} />
);

const theme = createTheme({
  palette: { primary: { main: "#f38020" } },
});

function App() {
  const [search, setSearch] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const [showUploadDrawer, setShowUploadDrawer] = useState(false);
  const [uploadAnchorEl, setUploadAnchorEl] = useState<HTMLElement | null>(null);
  const [cwd, setCwd] = useState("");
  const mainRefreshRef = useRef<(() => void) | null>(null);

  const handleUploadClick = (event: React.MouseEvent<HTMLElement>) => {
    setUploadAnchorEl(event.currentTarget);
    setShowUploadDrawer(true);
  };

  const handleUploadComplete = () => {
    setShowUploadDrawer(false);
    setUploadAnchorEl(null);
    // Trigger refresh in Main component
    mainRefreshRef.current?.();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      <TransferQueueProvider>
        <Stack sx={{ height: "100%" }}>
          <Header
            search={search}
            onSearchChange={setSearch}
            onUploadClick={handleUploadClick}
          />
          <Main 
            search={search} 
            onError={setError}
            onCwdChange={setCwd}
            onRefreshReady={(refresh) => {
              mainRefreshRef.current = refresh;
            }}
          />
        </Stack>
        <Snackbar
          autoHideDuration={5000}
          open={Boolean(error)}
          message={error?.message}
          onClose={() => setError(null)}
        />
        <ProgressDialog />
        <UploadDrawer
          open={showUploadDrawer}
          anchorEl={uploadAnchorEl}
          setOpen={(open) => {
            setShowUploadDrawer(open);
            if (!open) setUploadAnchorEl(null);
          }}
          cwd={cwd}
          onUpload={handleUploadComplete}
        />
      </TransferQueueProvider>
    </ThemeProvider>
  );
}

export default App;
