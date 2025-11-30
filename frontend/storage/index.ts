// storage/index.ts
import { createMMKV  } from 'react-native-mmkv';

// Создаем экземпляр MMKV
export const storage = createMMKV();

// Хелпер функции для работы с хранилищем
export const MMKVStorage = {
  // Сохранение строки
  setString: (key: string, value: string): void => {
    storage.set(key, value);
  },

  // Сохранение числа
  setNumber: (key: string, value: number): void => {
    storage.set(key, value);
  },

  // Сохранение булевого значения
  setBoolean: (key: string, value: boolean): void => {
    storage.set(key, value);
  },

  // Сохранение объекта
  setObject: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },

  // Получение строки
  getString: (key: string): string | undefined => {
    return storage.getString(key);
  },

  // Получение числа
  getNumber: (key: string): number | undefined => {
    return storage.getNumber(key);
  },

  // Получение булевого значения
  getBoolean: (key: string): boolean | undefined => {
    return storage.getBoolean(key);
  },

  // Получение объекта
  getObject: <T>(key: string): T | null => {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : null;
  },

  // Удаление значения
  delete: (key: string): void => {
    storage.remove(key);
  },

  // Получение всех ключей
  getAllKeys: (): string[] => {
    return storage.getAllKeys();
  },

  // Очистка хранилища
  clear: (): void => {
    storage.clearAll();
  },
};