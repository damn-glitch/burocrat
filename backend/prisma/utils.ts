// prisma/utils.ts

export type SelectSpec = string | { [key: string]: SelectSpec[] | RelationSpec };

type RelationSpec = {
  select?: SelectSpec[];
  args?: Record<string, any>;
};

type SelectResult = Record<string, true | ({ select?: SelectResult } & Record<string, any>)>;

const isScalarIdLike = (key: string) => key === 'id' || key.endsWith('_id');

/**
 * relationsWhitelist — множество ИМЕН отношений этой модели (НЕ *_id, НЕ 'id').
 * Всё, что не в whitelist, трактуем как скаляр.
 */
export const toSelect = (spec: SelectSpec[], relationsWhitelist: Set<string> = new Set()): SelectResult => {
  const acc: SelectResult = {};

  for (const item of spec) {
    if (typeof item === 'string') {
      acc[item] = true;
      continue;
    }

    for (const [key, subSpec] of Object.entries(item)) {
      // 1) Никогда не строим relation для id/*_id
      if (isScalarIdLike(key)) {
        acc[key] = true;
        continue;
      }

      // 2) Только whitelisted имена считаем relation
      const isRelation = relationsWhitelist.has(key);

      if (!isRelation) {
        // Кто-то передал объект под скалярным полем — игнорим вложенности
        acc[key] = true;
        continue;
      }

      // relation-cases
      if (!subSpec) {
        acc[key] = true;
        continue;
      }

      if (!Array.isArray(subSpec)) {
        const rel = subSpec as RelationSpec;
        const node: any = {};
        if (rel.select?.length) node.select = toSelect(rel.select, relationsWhitelist);
        if (rel.args) Object.assign(node, rel.args);
        acc[key] = Object.keys(node).length ? node : true;
        continue;
      }

      acc[key] = subSpec.length ? { select: toSelect(subSpec, relationsWhitelist) } : true;
    }
  }

  return acc;
};
