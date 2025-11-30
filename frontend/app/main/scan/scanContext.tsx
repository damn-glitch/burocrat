import dayjs from 'dayjs';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export type ScannedPage = {
  uri: string;
  size: number;
  capturedAt: string;
};

type ScanStatus = 'idle' | 'saving' | 'saved';

type ScanContextValue = {
  pages: ScannedPage[];
  addPage: (page: ScannedPage) => void;
  removePage: (index: number) => void;
  clear: () => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  fileName: string;
  setFileName: (value: string) => void;
  totalSizeMb: number;
  createdAt: string;
  status: ScanStatus;
  startSaving: () => void;
  completeSave: (location: string) => void;
  selectedLocation: string | null;
  resetSaveState: () => void;
};

const ScanContext = createContext<ScanContextValue | undefined>(undefined);

export const useScan = () => {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
};

export const ScanProvider = ({ children }: { children: React.ReactNode }) => {
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fileName, setFileName] = useState(() => `Scan_${dayjs().format('DD.MM.YYYY_HH-mm')}`);
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const addPage = useCallback((page: ScannedPage) => {
    setPages((prev) => {
      const next = [...prev, page];
      setCurrentIndex(next.length - 1);
      return next;
    });
    setStatus('idle');
    setSelectedLocation(null);
  }, []);

  const removePage = useCallback((index: number) => {
    setPages((prev) => {
      const next = prev.filter((_, pageIndex) => pageIndex !== index);
      setCurrentIndex((current) => Math.max(0, Math.min(current, next.length - 1)));
      if (!next.length) {
        setStatus('idle');
        setSelectedLocation(null);
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setPages([]);
    setCurrentIndex(0);
    setFileName(`Scan_${dayjs().format('DD.MM.YYYY_HH-mm')}`);
    setStatus('idle');
    setSelectedLocation(null);
  }, []);

  const totalSizeMb = useMemo(() => {
    if (!pages.length) return 0;
    const totalBytes = pages.reduce((sum, page) => sum + page.size, 0);
    return totalBytes / (1024 * 1024);
  }, [pages]);

  const createdAt = useMemo(() => {
    const first = pages.at(0);
    if (!first) return dayjs().format('DD.MM.YYYY');
    return dayjs(first.capturedAt).format('DD.MM.YYYY');
  }, [pages]);

  const startSaving = useCallback(() => {
    setStatus('saving');
  }, []);

  const completeSave = useCallback((location: string) => {
    setSelectedLocation(location);
    setStatus('saved');
  }, []);

  const resetSaveState = useCallback(() => {
    setStatus('idle');
    setSelectedLocation(null);
  }, []);

  const value: ScanContextValue = {
    pages,
    addPage,
    removePage,
    clear,
    currentIndex,
    setCurrentIndex,
    fileName,
    setFileName,
    totalSizeMb,
    createdAt,
    status,
    startSaving,
    completeSave,
    selectedLocation,
    resetSaveState,
  };

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
};
