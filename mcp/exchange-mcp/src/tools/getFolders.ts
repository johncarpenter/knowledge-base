import { getFolders as getFoldersFromGraph } from '../graph/client.js';

interface GetFoldersParams {
  account: string;
}

interface FoldersResult {
  folders: Array<{
    id: string;
    displayName: string;
    unreadItemCount: number;
    totalItemCount: number;
  }>;
}

export async function getFoldersTool(params: GetFoldersParams): Promise<FoldersResult> {
  const folders = await getFoldersFromGraph(params.account);

  return {
    folders: folders.map((f) => ({
      id: f.id,
      displayName: f.displayName,
      unreadItemCount: f.unreadItemCount,
      totalItemCount: f.totalItemCount,
    })),
  };
}
