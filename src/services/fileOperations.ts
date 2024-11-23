import { encodeKey } from "../utils/fileUtils";
import { copyPaste } from "../app/transfer";

export async function renameFile(oldKey: string, newName: string): Promise<void> {
  const dirPath = oldKey.substring(0, oldKey.lastIndexOf('/') + 1);
  const newPath = dirPath + newName;
  
  try {
    await copyPaste(oldKey, newPath, true);
  } catch (error) {
    console.error('Error renaming file:', error);
    throw error;
  }
}

export async function deleteFile(key: string): Promise<void> {
  try {
    const response = await fetch(`/webdav/${encodeKey(key)}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete file');
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

export async function getFileShareLink(key: string): Promise<string> {
  const url = new URL(`/webdav/${encodeKey(key)}`, window.location.origin);
  return url.toString();
}
