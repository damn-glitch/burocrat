export type Lang = 'RUS' | 'KAZ';

export function parseLang(input: unknown): Lang {
  return input === 'KAZ' ? 'KAZ' : 'RUS';
}

export function pickLang<T extends { name_rus?: string | null; name_kaz?: string | null }>(row: T | null, lang: Lang) {
  return lang === 'KAZ' ? (row?.name_kaz ?? null) : (row?.name_rus ?? null);
}
