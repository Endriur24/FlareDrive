import React from "react";
import {
  Grid,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import MimeIcon from "../MimeIcon";
import { humanReadableSize } from "../app/utils";
import { FileItem } from "../types/file";
import { extractFilename, isDirectory } from "../utils/fileUtils";

interface FileGridItemProps {
  file: FileItem;
  isSelected: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

function FileGridItem({ file, isSelected, onClick, onContextMenu }: FileGridItemProps) {
  return (
    <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
      <ListItemButton
        selected={isSelected}
        onClick={onClick}
        onContextMenu={onContextMenu}
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
  );
}

export default FileGridItem;
