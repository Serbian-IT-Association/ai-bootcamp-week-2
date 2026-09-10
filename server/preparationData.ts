import type { PreparationItem } from './contracts.ts';
import { DataContractError } from './errors.ts';

export function parsePreparationItems(value: unknown): PreparationItem[] {
  if (!Array.isArray(value)) {
    throw new DataContractError('Seed vrednost mora biti JSON niz.');
  }

  const items = value.map(parsePreparationItem);
  const uniqueIds = new Set(items.map((item) => item.id));

  if (uniqueIds.size !== items.length) {
    throw new DataContractError('Svaka seed stavka mora imati jedinstven id.');
  }

  return items;
}

function parsePreparationItem(value: unknown, index: number): PreparationItem {
  if (!isRecord(value)) {
    throw new DataContractError(`Seed stavka na indeksu ${index} nije objekat.`);
  }

  if (!Number.isInteger(value.id) || Number(value.id) <= 0) {
    throw new DataContractError(`Seed stavka na indeksu ${index} nema pozitivan celobrojni id.`);
  }

  if (typeof value.title !== 'string' || value.title.trim().length === 0) {
    throw new DataContractError(`Seed stavka na indeksu ${index} nema naslov.`);
  }

  if (typeof value.completed !== 'boolean') {
    throw new DataContractError(`Seed stavka na indeksu ${index} nema boolean completed vrednost.`);
  }

  return {
    id: Number(value.id),
    title: value.title.trim(),
    completed: value.completed
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
