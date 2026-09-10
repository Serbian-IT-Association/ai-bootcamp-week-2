import type { PreparationItem } from './contracts.ts';

const FALLBACK_ITEMS: readonly PreparationItem[] = [
  { id: 1, title: 'Pročitaj opis pozicije', completed: true },
  { id: 2, title: 'Izdvoji tri najvažnije tehnologije', completed: true },
  { id: 3, title: 'Pripremi STAR primer za timski rad', completed: false },
  { id: 4, title: 'Pripremi primer debugovanja', completed: false },
  { id: 5, title: 'Proveri GitHub profil', completed: true },
  { id: 6, title: 'Zapiši pitanja za intervjuera', completed: false },
  { id: 7, title: 'Proveri lokalno pokretanje projekta', completed: false },
  { id: 8, title: 'Napravi kratak plan učenja', completed: false }
];

export async function readFallbackPreparationItems(): Promise<PreparationItem[]> {
  return FALLBACK_ITEMS.map((item) => ({ ...item }));
}
