export type ChangeLogRecord<T> = Array<{
  field: keyof T;
  old_value: unknown;
  new_value: unknown;
  date: Date;
  user_id: number;
  description: string;
}>;
