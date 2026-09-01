import { UploadedImage } from '../types';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  iconLink?: string;
  size?: string;
  modifiedTime?: string;
  hasThumbnail?: boolean;
}

export interface DriveListResponse {
  files: DriveFileItem[];
  nextPageToken?: string;
}

/**
 * List files and folders from Google Drive
 */
export async function listDriveFiles(
  accessToken: string,
  options: {
    folderId?: string;
    searchTerm?: string;
    onlyImages?: boolean;
    pageSize?: number;
    pageToken?: string;
  } = {}
): Promise<DriveListResponse> {
  const {
    folderId = 'root',
    searchTerm = '',
    onlyImages = true,
    pageSize = 30,
    pageToken = ''
  } = options;

  let queryParts: string[] = ['trashed = false'];

  if (searchTerm) {
    const escapedTerm = searchTerm.replace(/'/g, "\\'");
    queryParts.push(`name contains '${escapedTerm}'`);
    if (onlyImages) {
      queryParts.push(`(mimeType contains 'image/' or mimeType = 'application/vnd.google-apps.folder')`);
    }
  } else {
    queryParts.push(`'${folderId}' in parents`);
    if (onlyImages) {
      queryParts.push(`(mimeType contains 'image/' or mimeType = 'application/vnd.google-apps.folder')`);
    }
  }

  const q = queryParts.join(' and ');
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('q', q);
  url.searchParams.set('pageSize', pageSize.toString());
  url.searchParams.set(
    'fields',
    'nextPageToken, files(id, name, mimeType, thumbnailLink, webViewLink, iconLink, size, modifiedTime, hasThumbnail)'
  );
  url.searchParams.set('orderBy', 'folder,modifiedTime desc,name');

  if (pageToken) {
    url.searchParams.set('pageToken', pageToken);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch Google Drive files (${response.status})`);
  }

  return response.json();
}

/**
 * Download a file from Google Drive and convert to base64 UploadedImage
 */
export async function downloadDriveImageAsUploadedImage(
  accessToken: string,
  fileItem: DriveFileItem
): Promise<UploadedImage> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileItem.id}?alt=media`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to download image from Google Drive: ${response.statusText}`);
  }

  const blob = await response.blob();
  const file = new File([blob], fileItem.name, { type: blob.type || fileItem.mimeType });

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        id: 'drive-' + fileItem.id + '-' + Math.random().toString(36).substr(2, 6),
        base64: reader.result as string,
        file: file
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Find or create a specific folder in Google Drive (e.g., "FreeBirdTool AI Studio")
 */
export async function findOrCreateFolder(
  accessToken: string,
  folderName = 'FreeBirdTool AI Studio'
): Promise<string> {
  // Check if folder exists
  const query = `name = '${folderName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false and 'root' in parents`;
  const searchUrl = new URL('https://www.googleapis.com/drive/v3/files');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('fields', 'files(id, name)');

  const searchRes = await fetch(searchUrl.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: ['root']
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to create studio folder in Google Drive');
  }

  const newFolder = await createRes.json();
  return newFolder.id;
}

/**
 * Upload an image (Data URL / Base64) to Google Drive
 */
export async function uploadImageToDrive(
  accessToken: string,
  dataUrl: string,
  fileName: string,
  folderId?: string
): Promise<DriveFileItem> {
  // Convert Data URL to Blob
  const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  let mimeType = 'image/png';
  let binaryString: string;

  if (match) {
    mimeType = match[1];
    binaryString = atob(match[2]);
  } else {
    // If raw url, fetch it
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    mimeType = blob.type || 'image/png';
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    binaryString = binary;
  }

  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const imageBlob = new Blob([bytes], { type: mimeType });

  // Resolve target folder
  const targetFolderId = folderId || (await findOrCreateFolder(accessToken));

  const metadata = {
    name: fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')
      ? fileName
      : `${fileName}.png`,
    mimeType: mimeType,
    parents: [targetFolderId],
    description: 'Generated with FreeBirdTool AI Visual Studio'
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
  const mediaPartHeader = `${delimiter}Content-Type: ${mimeType}\r\nContent-Transfer-Encoding: binary\r\n\r\n`;

  const metadataBlob = new Blob([metadataPart], { type: 'text/plain' });
  const mediaHeaderBlob = new Blob([mediaPartHeader], { type: 'text/plain' });
  const closeBlob = new Blob([closeDelimiter], { type: 'text/plain' });

  const multipartBody = new Blob([metadataBlob, mediaHeaderBlob, imageBlob, closeBlob], {
    type: `multipart/related; boundary=${boundary}`
  });

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,thumbnailLink,webViewLink,size,modifiedTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: multipartBody
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to upload image to Google Drive (${uploadRes.status})`);
  }

  return uploadRes.json();
}

/**
 * Helper to format byte sizes
 */
export function formatBytes(bytes?: string | number, decimals = 1): string {
  if (!bytes) return '0 B';
  const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(num) || num === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(num) / Math.log(k));

  return `${parseFloat((num / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
