// src/document/service.ts
import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '@src/http/errors';
import { validateFields } from '@utils/additional';

class DocumentService {
  constructor(private db: PrismaClient) {}

  // ---------------- Folder ----------------
  async createFolder(data: any) {
    validateFields(data, ['name', 'company_id']);

    const company = await this.db.company.findUnique({ where: { id: data.company_id } });
    if (!company) throw new BadRequestError('Компания не найдена.');

    const exists = await this.db.folder.findFirst({
      where: {
        name: data.name.trim(),
        parent_id: data.parent_id ?? null,
        company_id: data.company_id,
      },
    });

    if (exists) throw new BadRequestError('Папка с таким именем уже существует в этом уровне.');

    const folder = await this.db.folder.create({
      data: {
        name: data.name.trim(),
        parent_id: data.parent_id ?? null,
        company_id: data.company_id,
      },
    });

    return { success: true, folder };
  }

  async getFolders() {
    return this.db.folder.findMany({
      orderBy: { created_at: 'asc' },
      include: {
        company: { select: { id: true, name: true } },
        parent: { select: { id: true, name: true } },
      } as any,
    });
  }

  async getFolderById(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const folder = await this.db.folder.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true } },
        company: { select: { id: true, name: true } },
      } as any,
    });
    if (!folder) throw new BadRequestError('Папка не найдена.');
    return folder;
  }

  async updateFolder(id: number, data: any) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const folder = await this.db.folder.findUnique({ where: { id } });
    if (!folder) throw new BadRequestError('Папка не найдена.');

    const updated = await this.db.folder.update({
      where: { id },
      data: {
        name: data.name ?? folder.name,
        parent_id: data.parent_id ?? folder.parent_id,
      },
    });

    return { success: true, updated };
  }

  async deleteFolder(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    await this.db.folder.delete({ where: { id } });
    return { success: true };
  }

  // ---------------- Documents ----------------
  async create(data: any) {
    validateFields(data, ['title', 'company_id']);

    const company = await this.db.company.findUnique({ where: { id: data.company_id } });
    if (!company) throw new BadRequestError('Компания не найдена.');

    const document = await this.db.document.create({
      data: {
        title: data.title.trim(),
        content: data.content ?? '',
        created_by: data.created_by ?? null,
        folder_id: data.folder_id ?? null,
        company_id: data.company_id,
        attachments: data.attachments ?? [],
      },
    });

    return { success: true, document };
  }

  async getAll() {
    return this.db.document.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        company: { select: { id: true, name: true } },
        folder: { select: { id: true, name: true } },
        created_by_user: { select: { id: true, firstname: true, lastname: true } },
      } as any,
    });
  }

  async getById(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const doc = await this.db.document.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true } },
        folder: { select: { id: true, name: true } },
        created_by_user: { select: { id: true, firstname: true, lastname: true } },
      } as any,
    });
    if (!doc) throw new BadRequestError('Документ не найден.');
    return doc;
  }

  async getByFolder(folder_id: number) {
    if (!folder_id) throw new BadRequestError('folder_id обязателен.');
    return this.db.document.findMany({
      where: { folder_id },
      orderBy: { created_at: 'desc' },
    });
  }

  async getByCompany(company_id: number) {
    if (!company_id) throw new BadRequestError('company_id обязателен.');
    return this.db.document.findMany({
      where: { company_id },
      orderBy: { created_at: 'desc' },
    });
  }

  async update(id: number, data: any) {
    if (!id) throw new BadRequestError('ID обязателен.');
    const doc = await this.db.document.findUnique({ where: { id } });
    if (!doc) throw new BadRequestError('Документ не найден.');

    const updated = await this.db.document.update({
      where: { id },
      data: {
        title: data.title ?? doc.title,
        content: data.content ?? doc.content,
        folder_id: data.folder_id ?? doc.folder_id,
        attachments: data.attachments ?? doc.attachments,
        updated_at: new Date(),
      },
    });

    return { success: true, updated };
  }

  async delete(id: number) {
    if (!id) throw new BadRequestError('ID обязателен.');
    await this.db.document.delete({ where: { id } });
    return { success: true };
  }
}

export default DocumentService;
