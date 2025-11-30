// src/dictionary/service.ts
import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '@src/http/errors';
import { validateFields } from '@utils/additional';

class DictionaryService {
  constructor(private db: PrismaClient) {}

  async getCountries() {
    return this.db.country.findMany({ orderBy: { name: 'asc' } });
  }

  async getIndustries() {
    return this.db.industry.findMany({ orderBy: { name: 'asc' } });
  }

  async getLegalForms() {
    return this.db.legal_form.findMany({ orderBy: { name: 'asc' } });
  }
}

export default DictionaryService;
