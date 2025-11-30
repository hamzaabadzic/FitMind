export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  name: string;
  height?: number;
  weight?: number;
  goal?: string;
  level?: string;
}

export const QUICK_ACTIONS = [
  { label: "🏋️ Plan Treninga", prompt: "Želim plan treninga. " },
  { label: "🥗 Plan Ishrane", prompt: "Želim plan ishrane za mršavljenje. " },
  { label: "🔥 Motivacija", prompt: "Daj mi motivaciju za današnji trening! " },
  { label: "🍎 Kalorije", prompt: "Koliko kalorija ima..." },
];