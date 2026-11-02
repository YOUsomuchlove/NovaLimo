import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Request } from 'express';
import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { AdminJwtGuard } from '../auth/admin-jwt.guard';

type UploadResponse = { url: string };

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

function getUploadsDir(): string {
  return process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.resolve(process.cwd(), 'uploads');
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function extForMime(mime: string): string {
  if (mime === 'image/jpeg') return '.jpg';
  if (mime === 'image/png') return '.png';
  if (mime === 'image/webp') return '.webp';
  return '';
}

@Controller('admin/uploads')
export class AdminUploadsController {
  @Post('avatar')
  @UseGuards(AdminJwtGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_AVATAR_BYTES },
      fileFilter: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
        if (!ALLOWED_MIME.has(file.mimetype)) {
          cb(new BadRequestException('Chỉ hỗ trợ JPG/PNG/WEBP'), false);
          return;
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
          const base = getUploadsDir();
          const dir = path.join(base, 'avatars');
          ensureDir(dir);
          cb(null, dir);
        },
        filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
          const ext = extForMime(file.mimetype);
          if (!ext) {
            cb(new BadRequestException('Định dạng ảnh không hợp lệ') as unknown as Error, '');
            return;
          }
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
    }),
  )
  uploadAvatar(
    @UploadedFile()
    file?: Express.Multer.File,
  ): UploadResponse {
    if (!file) throw new BadRequestException('Thiếu file');
    return { url: `/api/uploads/avatars/${file.filename}` };
  }
}

