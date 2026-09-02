import { randomUUID } from 'crypto';

import { deleteFile, saveFile } from '../../lib/storage';
import { ApiError } from '../../utils/ApiError';
import * as notesRepository from './notes.repository';
import * as notesAssetsRepository from './notes-assets.repository';

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'video/webm': 'webm',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/x-matroska': 'mkv',
  'video/ogg': 'ogv',
};

function extensionFromMimeType(mimeType: string): string {
  return EXTENSION_BY_MIME_TYPE[mimeType] ?? 'bin';
}

interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export async function addVideoAsset(userId: string, noteId: string, file: UploadedFile) {
  const note = await notesRepository.findOneForUser(noteId, userId);
  if (!note) {
    throw ApiError.notFound('Note not found');
  }

  const filename = `${randomUUID()}.${extensionFromMimeType(file.mimetype)}`;
  const filePath = await saveFile(`notes/${noteId}`, filename, file.buffer);

  return notesAssetsRepository.createAsset(noteId, {
    filePath,
    mimeType: file.mimetype,
    sizeBytes: file.size,
  });
}

export async function removeVideoAsset(userId: string, noteId: string, assetId: string): Promise<void> {
  const note = await notesRepository.findOneForUser(noteId, userId);
  if (!note) {
    throw ApiError.notFound('Note not found');
  }

  const asset = await notesAssetsRepository.findAssetForNote(assetId, noteId);
  if (!asset) {
    throw ApiError.notFound('Asset not found');
  }

  await notesAssetsRepository.deleteAsset(assetId);
  await deleteFile(asset.filePath);
}
