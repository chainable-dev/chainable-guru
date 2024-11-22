export type UIBlockStatus = 'idle' | 'streaming' | 'loading' | 'error' | 'success';

export interface UIBlock {
  documentId: string;
  content: string;
  title: string;
  status: UIBlockStatus;
  isVisible: boolean;
  boundingBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
} 