
export interface Unit {
  name: string;
  vocab: string[];
  topicChips: string[];
  qs: string[];
  builderType: 'country' | 'routine' | 'week' | 'party' | 'ability';
  theme: [string, string];
}

export interface Units {
  [key: number]: Unit;
}

export interface Data {
  units: Units;
  days: string[];
  countries: string[];
  routines: string[];
  partyEat: string[];
  partyDrink: string[];
  abilities: string[];
}

export interface Illustrations {
  [key: string]: string;
}

export enum AppMode {
  Vocabulary = 'VOCABULARY',
  Sentence = 'SENTENCE',
}

export type ToastType = 'ok' | 'warn' | 'bad';

export interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}
