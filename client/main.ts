import {
  ApiRequestError,
  getHealth,
  getPreparationItems,
  getPreparationSummary,
  type PreparationItem,
  type PreparationSummary
} from './apiClient.ts';
import { getReadinessLevel } from './readiness.ts';

const READINESS_NOTE_STORAGE_KEY = 'week2:interview-readiness-note';

class InterviewPreparationPage {
  private readonly environmentLabel = requireElement('environment-label');
  private readonly environmentMessage = requireElement('environment-message');
  private readonly serviceStatus = requireElement('service-status');
  private readonly itemsList = requireElement('preparation-items', HTMLUListElement);
  private readonly itemsStatus = requireElement('items-status');
  private readonly summaryStatus = requireElement('summary-status');
  private readonly totalValue = requireElement('summary-total');
  private readonly completedValue = requireElement('summary-completed');
  private readonly remainingValue = requireElement('summary-remaining');
  private readonly percentageValue = requireElement('summary-percentage');
  private readonly readinessLevel = requireElement('readiness-level');
  private readonly readinessPercentage = requireElement('readiness-percentage');
  private readonly readinessProgress = requireElement('readiness-progress', HTMLProgressElement);
  private readonly readinessFocus = requireElement('readiness-focus');
  private readonly readinessNote = requireElement('readiness-note', HTMLTextAreaElement);
  private readonly readinessNoteStatus = requireElement('readiness-note-status');
  private readonly refreshButton = requireElement('refresh-data', HTMLButtonElement);

  start(): void {
    this.refreshButton.addEventListener('click', () => void this.refresh());
    this.readinessNote.addEventListener('input', () => this.saveReadinessNote());
    this.loadReadinessNote();
    void this.refresh();
  }

  private async refresh(): Promise<void> {
    this.refreshButton.disabled = true;
    this.itemsStatus.textContent = 'Učitavanje stavki...';
    this.summaryStatus.textContent = 'Učitavanje pregleda...';

    await Promise.allSettled([
      this.loadHealth(),
      this.loadItems(),
      this.loadSummary()
    ]);

    this.refreshButton.disabled = false;
  }

  private async loadHealth(): Promise<void> {
    try {
      const health = await getHealth();
      this.environmentLabel.textContent = health.environment;
      this.environmentMessage.textContent = health.message;
      this.serviceStatus.textContent = health.preparationServiceConfigured
        ? 'Servisna konfiguracija je pronađena.'
        : 'Servisna konfiguracija nedostaje.';
      this.serviceStatus.dataset.state = health.preparationServiceConfigured ? 'ok' : 'error';
    } catch (error) {
      this.serviceStatus.textContent = describeError(error);
      this.serviceStatus.dataset.state = 'error';
    }
  }

  private async loadItems(): Promise<void> {
    try {
      const items = await getPreparationItems();
      this.renderItems(items);
      this.renderNextFocus(items);
      this.itemsStatus.textContent = `${items.length} stavki je učitano iz pripremljenog izvora.`;
      this.itemsStatus.dataset.state = 'ok';
    } catch (error) {
      this.itemsList.replaceChildren();
      this.clearNextFocus();
      this.itemsStatus.textContent = describeError(error);
      this.itemsStatus.dataset.state = 'error';
    }
  }

  private async loadSummary(): Promise<void> {
    try {
      const summary = await getPreparationSummary();
      this.renderSummary(summary);
      this.renderReadiness(summary);
      this.summaryStatus.textContent = 'Pregled je izračunat na serveru.';
      this.summaryStatus.dataset.state = 'ok';
    } catch (error) {
      this.clearSummary();
      this.clearReadiness();
      this.summaryStatus.textContent = describeError(error);
      this.summaryStatus.dataset.state = 'error';
    }
  }

  private renderItems(items: readonly PreparationItem[]): void {
    const listItems = items.map((item) => {
      const element = document.createElement('li');
      element.className = item.completed ? 'preparation-item completed' : 'preparation-item';

      const marker = document.createElement('span');
      marker.className = 'item-marker';
      marker.textContent = item.completed ? '✓' : '○';
      marker.setAttribute('aria-hidden', 'true');

      const title = document.createElement('span');
      title.textContent = item.title;

      element.append(marker, title);
      return element;
    });

    this.itemsList.replaceChildren(...listItems);
  }

  private renderSummary(summary: PreparationSummary): void {
    this.totalValue.textContent = String(summary.total);
    this.completedValue.textContent = String(summary.completed);
    this.remainingValue.textContent = String(summary.remaining);
    this.percentageValue.textContent = `${summary.percentage}%`;
  }

  private renderReadiness(summary: PreparationSummary): void {
    this.readinessLevel.textContent = getReadinessLevel(summary.percentage);
    this.readinessLevel.dataset.state = 'ok';
    this.readinessPercentage.textContent = `${summary.percentage}%`;
    this.readinessProgress.value = summary.percentage;
    this.readinessProgress.textContent = `${summary.percentage}%`;
  }

  private renderNextFocus(items: readonly PreparationItem[]): void {
    const nextItem = items.find((item) => !item.completed);
    this.readinessFocus.textContent = nextItem?.title ?? 'Sve stavke su završene.';
  }

  private clearNextFocus(): void {
    this.readinessFocus.textContent = 'Sledeći fokus trenutno nije dostupan.';
  }

  private clearSummary(): void {
    this.totalValue.textContent = '–';
    this.completedValue.textContent = '–';
    this.remainingValue.textContent = '–';
    this.percentageValue.textContent = '–';
  }

  private clearReadiness(): void {
    this.readinessLevel.textContent = 'Status pripreme trenutno nije dostupan.';
    delete this.readinessLevel.dataset.state;
    this.readinessPercentage.textContent = '–';
    this.readinessProgress.removeAttribute('value');
    this.readinessProgress.textContent = 'Status pripreme trenutno nije dostupan.';
  }

  private loadReadinessNote(): void {
    try {
      const savedNote = localStorage.getItem(READINESS_NOTE_STORAGE_KEY) ?? '';
      this.readinessNote.value = savedNote.slice(0, this.readinessNote.maxLength);
      this.readinessNoteStatus.textContent = savedNote
        ? 'Sačuvana beleška je učitana iz ovog browsera.'
        : 'Beleška se čuva samo u ovom browseru i ne šalje se serveru.';
      this.readinessNoteStatus.dataset.state = 'ok';
    } catch {
      this.showStorageUnavailableMessage();
    }
  }

  private saveReadinessNote(): void {
    try {
      if (this.readinessNote.value) {
        localStorage.setItem(READINESS_NOTE_STORAGE_KEY, this.readinessNote.value);
      } else {
        localStorage.removeItem(READINESS_NOTE_STORAGE_KEY);
      }

      this.readinessNoteStatus.textContent = 'Beleška je sačuvana samo u ovom browseru.';
      this.readinessNoteStatus.dataset.state = 'ok';
    } catch {
      this.showStorageUnavailableMessage();
    }
  }

  private showStorageUnavailableMessage(): void {
    this.readinessNoteStatus.textContent = 'Lokalno čuvanje nije dostupno; beleška važi samo tokom ove sesije.';
    this.readinessNoteStatus.dataset.state = 'error';
  }
}

function requireElement<TElement extends HTMLElement>(
  id: string,
  constructorFunction?: { new (): TElement }
): TElement {
  const element = document.getElementById(id);

  if (!element || (constructorFunction && !(element instanceof constructorFunction))) {
    throw new Error(`Nedostaje očekivani element #${id}.`);
  }

  return element as TElement;
}

function describeError(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return `API greška ${error.status}: ${error.message}`;
  }

  return error instanceof Error ? error.message : 'Nepoznata greška.';
}

try {
  new InterviewPreparationPage().start();
} catch (error) {
  console.error(error);
}
