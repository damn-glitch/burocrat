export type CompanyDocument = {
    id: string;
    name: string;
    extension: string;
    date: string;
    updatedAt: string;
    companyId: string;
    companyName: string;
    project?: string;
    category?: string;
};

export type CompanyDocumentsGroup = {
    id: string;
    name: string;
    documents: CompanyDocument[];
};

const baseGroups = [
    {
        id: 'company-1',
        name: 'Tleu agency',
        documents: [
            {
                id: 'company-doc-1',
                name: 'Пример договора.pdf',
                extension: 'pdf',
                project: 'Бюрократ',
                date: '10.10.2025',
                updatedAt: '2025-10-12T09:00:00Z',
            },
            {
                id: 'company-doc-2',
                name: 'Смета проекта.docx',
                extension: 'docx',
                project: 'Проект 2',
                date: '10.10.2025',
                updatedAt: '2025-10-11T15:30:00Z',
            },
            {
                id: 'company-doc-3',
                name: 'Презентация.pptx',
                extension: 'pptx',
                project: 'Проект 1',
                date: '10.10.2025',
                updatedAt: '2025-10-10T18:45:00Z',
            },
            {
                id: 'company-doc-4',
                name: 'Акт выполненных работ.pdf',
                extension: 'pdf',
                project: 'Проект 2',
                date: '01.10.2025',
                updatedAt: '2025-09-28T08:10:00Z',
            },
            {
                id: 'company-doc-5',
                name: 'Согласование условий.pdf',
                extension: 'pdf',
                project: 'Проект 3',
                date: '20.09.2025',
                updatedAt: '2025-09-20T11:25:00Z',
            },
            {
                id: 'company-doc-6',
                name: 'Справка о доходах.pdf',
                extension: 'pdf',
                project: 'Проект 4',
                date: '05.09.2025',
                updatedAt: '2025-09-05T14:50:00Z',
            },
        ],
    },
    {
        id: 'company-2',
        name: 'AlmaTech Solutions',
        documents: [
            {
                id: 'company-doc-7',
                name: 'Коммерческое предложение.pdf',
                extension: 'pdf',
                project: 'Внедрение ERP',
                date: '15.10.2025',
                updatedAt: '2025-10-15T16:00:00Z',
            },
            {
                id: 'company-doc-8',
                name: 'Договор поставки.pdf',
                extension: 'pdf',
                project: 'Проект снабжения',
                date: '12.10.2025',
                updatedAt: '2025-10-12T12:15:00Z',
            },
            {
                id: 'company-doc-9',
                name: 'Техническое задание.docx',
                extension: 'docx',
                project: 'Модернизация склада',
                date: '08.10.2025',
                updatedAt: '2025-10-08T08:35:00Z',
            },
            {
                id: 'company-doc-10',
                name: 'Акт сверки.pdf',
                extension: 'pdf',
                project: 'Финансовый аудит',
                date: '05.10.2025',
                updatedAt: '2025-10-05T07:20:00Z',
            },
            {
                id: 'company-doc-11',
                name: 'Регламент обслуживания.pdf',
                extension: 'pdf',
                project: 'Сервисное направление',
                date: '25.09.2025',
                updatedAt: '2025-09-25T10:00:00Z',
            },
            {
                id: 'company-doc-12',
                name: 'Отчет по проекту.pdf',
                extension: 'pdf',
                project: 'Внедрение ERP',
                date: '18.09.2025',
                updatedAt: '2025-09-18T09:40:00Z',
            },
        ],
    },
] as const;

export const COMPANY_DOCUMENT_GROUPS: CompanyDocumentsGroup[] = baseGroups.map(group => ({
    ...group,
    documents: group.documents.map(doc => ({
        ...doc,
        companyId: group.id,
        companyName: group.name,
    })),
}));

export const COMPANY_DOCUMENTS: CompanyDocument[] = COMPANY_DOCUMENT_GROUPS.flatMap(group => group.documents);

export const parseSelectedDocumentsParam = (value: string | string[] | undefined): string[] => {
    if (!value) return [];
    const asString = Array.isArray(value) ? value.join(',') : value;
    return asString
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
};
