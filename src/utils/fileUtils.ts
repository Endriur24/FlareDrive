import type { FileItem } from '../types/file';

export function extractFilename(key: string) {
  return key.split("/").pop();
}

export function encodeKey(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

export function isDirectory(file: FileItem) {
  return file.httpMetadata?.contentType === "application/x-directory";
}

export function getFileExtension(fileName: string): string {
  return fileName.includes('.') ? fileName.split('.').pop() || '' : '';
}

export function getNameWithoutExtension(fileName: string): string {
  const extension = getFileExtension(fileName);
  return extension ? fileName.slice(0, -(extension.length + 1)) : fileName;
}
