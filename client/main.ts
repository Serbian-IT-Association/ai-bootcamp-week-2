import {
  ApiRequestError,
  getHealth,
  getPreparationItems,
  getPreparationSummary,
  type PreparationItem,
  type PreparationSummary
} from './apiClient.ts';

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
  private readonly refreshButton = requireElement('refresh-data', HTMLButtonElement);
  private readonly lastRefreshed = requireElement('last-refreshed');

  start(): void {
    this.refreshButton.addEventListener('click', () => void this.refresh());
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
    this.lastRefreshed.textContent = `Poslednje osveženo u ${new Date().toLocaleTimeString('sr-Latn-RS')}`;
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
      this.itemsStatus.textContent = `${items.length} stavki je učitano iz pripremljenog izvora.`;
      this.itemsStatus.dataset.state = 'ok';
    } catch (error) {
      this.itemsList.replaceChildren();
      this.itemsStatus.textContent = describeError(error);
      this.itemsStatus.dataset.state = 'error';
    }
  }

  private async loadSummary(): Promise<void> {
    try {
      const summary = await getPreparationSummary();
      this.renderSummary(summary);
      this.summaryStatus.textContent = 'Pregled je izračunat na serveru.';
      this.summaryStatus.dataset.state = 'ok';
    } catch (error) {
      this.clearSummary();
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

  private clearSummary(): void {
    this.totalValue.textContent = '–';
    this.completedValue.textContent = '–';
    this.remainingValue.textContent = '–';
    this.percentageValue.textContent = '–';
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
