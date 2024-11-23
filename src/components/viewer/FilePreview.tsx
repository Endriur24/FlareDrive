import React from 'react';
import { DialogContent } from '@mui/material';
import { FileItem } from '../../types/file';
import { encodeKey } from '../../utils/fileUtils';

interface FilePreviewProps {
  file: FileItem;
}

function FilePreview({ file }: FilePreviewProps) {
  const fileUrl = `/webdav/${encodeKey(file.key)}`;
  const isImage = file.httpMetadata.contentType.startsWith('image/');
  const isPdf = file.httpMetadata.contentType === 'application/pdf';

  return (
    <DialogContent sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: 0
    }}>
      {isImage ? (
        <img 
          src={fileUrl} 
          alt={file.key}
          style={{ 
            maxWidth: '100%', 
            maxHeight: 'calc(100vh - 64px)',
            objectFit: 'contain'
          }} 
        />
      ) : isPdf ? (
        <iframe
          src={fileUrl}
          title={`PDF viewer - ${file.key}`}
          style={{
            width: '100%',
            height: 'calc(100vh - 64px)',
            border: 'none'
          }}
        />
      ) : (
        <iframe
          src={fileUrl}
          title={`File viewer - ${file.key}`}
          style={{
            width: '100%',
            height: 'calc(100vh - 64px)',
            border: 'none',
            backgroundColor: 'white'
          }}
        />
      )}
    </DialogContent>
  );
}

export default FilePreview;
