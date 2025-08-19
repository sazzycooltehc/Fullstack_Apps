
export interface User {
  id: string;
  name: string;
}

export interface DropdownOption {
  value: string;
  label: string;
}

export interface Article {
  id: string;
  title: string;
  imageUrl: string;
  snippet: string;
  category: string;
  topic: string;
}

export enum Flow {
  Tech = 'tech',
  Health = 'health',
  Finance = 'finance',
}
