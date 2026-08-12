export interface Problem {
  _id: string;
  name: string;
  grade: string;            // e.g. 'V5'
  imageUrl?: string;
  attempts: number;
  status: 'working' | 'sent';
  notes?: string;
  accessoryIds?: string[];  // gear used on this problem
  dateAdded: string;        // ISO date string
}

export type AccessoryCategory = 'shoes' | 'chalk' | 'harness' | 'other';
export type AccessoryCondition = 'good' | 'low' | 'worn_out';

export interface Accessory {
  _id: string;
  userId?: string;
  name: string;
  category: AccessoryCategory;
  condition: AccessoryCondition;
  dateAdded: string;
}
