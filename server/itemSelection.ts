import type { PreparationItem } from './contracts.ts';
import { RequestValidationError } from './errors.ts';

export type ItemSelection =
  | Readonly<{ kind: 'list'; items: PreparationItem[] }>
  | Readonly<{ kind: 'detail'; item: PreparationItem | undefined }>;

export function selectPreparationItems(items: readonly PreparationItem[], requestUrl: string): ItemSelection {
  const url = new URL(requestUrl, 'http://localhost');
  const completedValue = url.searchParams.get('completed');
  const idValue = url.searchParams.get('id');

  if (completedValue !== null && completedValue !== 'true' && completedValue !== 'false') {
    throw new RequestValidationError('completed mora biti true ili false.');
  }

  if (idValue !== null) {
    if (!/^\d+$/.test(idValue) || Number(idValue) <= 0) {
      throw new RequestValidationError('id mora biti pozitivan ceo broj.');
    }

    return {
      kind: 'detail',
      item: items.find((item) => item.id === Number(idValue))
    };
  }

  const filteredItems = completedValue === null
    ? [...items]
    : items.filter((item) => item.completed === (completedValue === 'true'));

  return { kind: 'list', items: filteredItems };
}
