// src/http/ErrorMiddleware.ts
import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import path from 'node:path';
import url from 'node:url';
import logger from '@src/logger';

// --- Optional peer imports: подключаем по наличию, чтобы не тянуть лишнего в рантайме
let ZodErrorCtor: any;
try {
  ({ ZodError: ZodErrorCtor } = require('zod'));
} catch {
  /* empty */
}
let PrismaKnownErrorCtor: any;
try {
  ({ PrismaClientKnownRequestError: PrismaKnownErrorCtor } = require('@prisma/client/runtime/library'));
} catch {
  /* empty */
}
let AxiosErrorCtor: any;
try {
  ({ AxiosError: AxiosErrorCtor } = require('axios'));
} catch {
  /* empty */
}

export interface ResponseErrorObject extends Error {
  issues: any[];
  status?: number;
  code?: string | number;
}

const SRC_DIR = path.join(process.cwd(), 'src') + path.sep;
const SHOW_INTERNAL_TRACE = String(process.env.SHOW_INTERNAL_TRACE ?? 'true').toLowerCase() === 'true';

// ---------- stack parsing (как мы делали раньше) ----------
type Frame = { fileRel?: string; line?: number; col?: number; raw: string };
const RE = /^\s*at\s+(?:(?<fn>[^\s(]+)\s+\()?(?<file>(?:[a-zA-Z]:)?[^():]+):(?<line>\d+):(?<col>\d+)\)?\s*$/;

function toAbs(p: string): string {
  if (p.startsWith('file://')) {
    try {
      return url.fileURLToPath(p);
    } catch {
      /* ignore */
    }
  }
  return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
}

function extractOwnFrames(stack?: string): Frame[] {
  if (!stack) return [];
  const frames: Frame[] = [];
  const srcNorm = path.normalize(SRC_DIR);

  for (const line of stack.split('\n')) {
    const m = line.match(RE);
    if (!m?.groups) continue;
    const norm = path.normalize(toAbs(m.groups.file.trim()));
    if (!norm.startsWith(srcNorm)) continue;
    frames.push({
      raw: line.trim(),
      fileRel: norm.slice(srcNorm.length),
      line: Number(m.groups.line),
      col: Number(m.groups.col),
    });
  }
  return frames;
}

// ---------- helpers ----------
function isZodError(err: unknown): boolean {
  return !!(ZodErrorCtor && err instanceof ZodErrorCtor);
}

function isPrismaKnown(err: any): boolean {
  return !!(PrismaKnownErrorCtor && err instanceof PrismaKnownErrorCtor);
}

function isAxiosError(err: any): boolean {
  return !!(AxiosErrorCtor && err instanceof AxiosErrorCtor);
}

/** Попытка распарсить err.message, если оно — JSON-строка с массивом проблем */
function parseMessageAsJsonArray(message?: string) {
  if (!message) return null;
  const trimmed = message.trim();
  if (!(trimmed.startsWith('[') && trimmed.endsWith(']'))) return null;
  try {
    const arr = JSON.parse(trimmed);
    return Array.isArray(arr) ? arr : null;
  } catch {
    return null;
  }
}

export const errorMiddleware: ErrorRequestHandler = (
  err: ResponseErrorObject,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let status = err?.status ?? 500;
  let error = err?.message ?? 'Something went wrong!';
  let details: any = undefined;

  // ---- Zod ----
  if (isZodError(err)) {
    status = 400;
    const issues = err.issues ?? [];
    details = issues.map((i: any) => {
      const path = Array.isArray(i.path) ? i.path.join('.') : String(i.path);
      return `${path}, ${i.message}`;
    });
    error = 'Validation failed';
  } else {
    // Если пришла строка с JSON-массивом проблем (как в твоём примере)
    const parsed = parseMessageAsJsonArray(err?.message);
    if (parsed) {
      status = 400;
      details = parsed.map((i: any) => {
        const path = Array.isArray(i.path) ? i.path.join('.') : String(i.path);
        return `${path}, ${i.message}`;
      });
      error = 'Validation failed';
    }
  }

  // ---- Prisma ----
  if (!details && isPrismaKnown(err)) {
    // частые коды
    // P2002 — уникальный индекс (conflict)
    // P2003 — внеш. ключ (constraint)
    // P2025 — not found
    const code = (err as any).code as string | undefined;
    error = err.message;
    let errMeta = (err as any).meta;
    if (code === 'P2002') status = 409;
    else if (code === 'P2025') {
      status = 404;
      error = (errMeta?.cause ?? '') + ' ' + (errMeta?.modelName ?? '')

    } else if (code === 'P2003') status = 409;
    details = {
      code,
      meta: errMeta,
    };
  }

  // ---- Axios ----
  if (!details && isAxiosError(err)) {
    const axiosErr: any = err;
    status = axiosErr.response?.status ?? status;
    details = {
      url: axiosErr.config?.url,
      method: axiosErr.config?.method,
      requestBody: axiosErr.config?.data,
      responseData: axiosErr.response?.data,
      responseHeaders: axiosErr.response?.headers,
    };
    error = axiosErr.message || 'Upstream request failed';
  }

  // ---- Body parser SyntaxError ----
  if (!details && err instanceof SyntaxError && /JSON/.test(String(err.message))) {
    status = 400;
    error = 'Invalid JSON payload';
  }

  const body: any = { error, status };

  if (details !== undefined) body.details = details;

  if (SHOW_INTERNAL_TRACE) {
    const own = extractOwnFrames(err?.stack);
    body.trace = own.map((f) => (f.fileRel ? `${f.fileRel.replaceAll('\\', '/')}:${f.line}:${f.col}` : f.raw));
  }
  logger.error(JSON.stringify(body, null, 2));

  res.status(status).json(body);
};
