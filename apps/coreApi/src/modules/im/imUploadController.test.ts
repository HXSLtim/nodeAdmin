import {
  BadRequestException,
  PayloadTooLargeException,
  UnauthorizedException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setupTestEnv } from '../../__tests__/helpers';

setupTestEnv();

vi.mock('node:crypto', () => ({
  randomUUID: vi.fn(() => 'upload-uuid'),
}));

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
}));

import { mkdir, writeFile } from 'node:fs/promises';
import { ImUploadController } from './imUploadController';

interface MockMultipartFile {
  filename: string;
  mimetype: string;
  toBuffer: ReturnType<typeof vi.fn>;
}

function createRequest(fileResult: MockMultipartFile | null | Error) {
  return {
    file: vi.fn(async (options?: unknown) => {
      if (fileResult instanceof Error) {
        throw fileResult;
      }

      return fileResult;
    }),
    lastOptions: undefined as unknown,
  } as {
    file: ReturnType<typeof vi.fn>;
    lastOptions?: unknown;
  };
}

describe('ImUploadController', () => {
  let controller: ImUploadController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new ImUploadController();
  });

  it('AC1 should upload image file successfully', async () => {
    const buffer = Buffer.from('image-bytes');
    const request = createRequest({
      filename: 'photo.png',
      mimetype: 'image/png',
      toBuffer: vi.fn().mockResolvedValue(buffer),
    });

    const result = await controller.upload(request as any, {
      jti: 'jti-1',
      roles: ['user'],
      tenantId: 'tenant-1',
      userId: 'user-1',
    });

    expect(request.file).toHaveBeenCalledWith({
      limits: { fileSize: expect.any(Number) },
    });
    expect(mkdir).toHaveBeenCalledWith(expect.stringContaining('tenant-1'), { recursive: true });
    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining('upload-uuid.png'),
      buffer
    );
    expect(result).toEqual({
      fileName: 'photo.png',
      fileSizeBytes: buffer.length,
      url: expect.stringContaining('/tenant-1/upload-uuid.png'),
    });
  });

  it('AC2 should reject non-image file uploads', async () => {
    const request = createRequest({
      filename: 'document.pdf',
      mimetype: 'application/pdf',
      toBuffer: vi.fn(),
    });

    await expect(
      controller.upload(request as any, {
        jti: 'jti-1',
        roles: ['user'],
        tenantId: 'tenant-1',
        userId: 'user-1',
      })
    ).rejects.toThrow(BadRequestException);

    expect(writeFile).not.toHaveBeenCalled();
  });

  it('AC3 should reject files that exceed the size limit', async () => {
    const error = Object.assign(new Error('File too large'), { code: 'FST_REQ_FILE_TOO_LARGE' });
    const request = createRequest(error);

    await expect(
      controller.upload(request as any, {
        jti: 'jti-1',
        roles: ['user'],
        tenantId: 'tenant-1',
        userId: 'user-1',
      })
    ).rejects.toThrow(PayloadTooLargeException);

    expect(mkdir).not.toHaveBeenCalled();
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('AC4 should reject missing auth before reading the upload stream', async () => {
    const request = createRequest({
      filename: 'photo.png',
      mimetype: 'image/png',
      toBuffer: vi.fn().mockResolvedValue(Buffer.from('image-bytes')),
    });

    await expect(controller.upload(request as any, undefined as any)).rejects.toThrow(
      UnauthorizedException
    );

    expect(request.file).not.toHaveBeenCalled();
    expect(writeFile).not.toHaveBeenCalled();
  });
});
