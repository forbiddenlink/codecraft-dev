export interface Challenge {
  id: string;
  title: string;
  description: string;
  initialState?: Record<string, unknown>;
} 