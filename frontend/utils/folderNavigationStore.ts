import type { Folder } from '@/components/companies-components/documentsTab';

type FolderNavigationEntry = {
  folder: Folder;
  onUpdate?: (folder: Folder) => void;
  onDelete?: (folderId: string) => void;
};

const registry = new Map<string, FolderNavigationEntry>();

export const setFolderNavigationEntry = (
  folderId: string,
  entry: FolderNavigationEntry,
) => {
  registry.set(folderId, entry);
};

export const getFolderNavigationEntry = (folderId: string) => registry.get(folderId);

export const clearFolderNavigationEntry = (folderId: string) => {
  registry.delete(folderId);
};

export const updateFolderNavigationEntry = (folder: Folder) => {
  const entry = registry.get(folder.id);
  if (entry) {
    entry.folder = folder;
  }
};

