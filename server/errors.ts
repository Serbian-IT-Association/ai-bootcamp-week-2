export class ServiceConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceConfigurationError';
  }
}

export class ExternalServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExternalServiceError';
  }
}

export class DataContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataContractError';
  }
}

export class RequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RequestValidationError';
  }
}

export class SummaryNotImplementedError extends Error {
  constructor() {
    super('Preparation summary još nije implementiran.');
    this.name = 'SummaryNotImplementedError';
  }
}
