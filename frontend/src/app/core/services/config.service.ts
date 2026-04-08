import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config = { apiUrl: environment.apiUrl };

  load(): Promise<void> {
    return fetch('/assets/config.json')
      .then((r) => r.json())
      .then((c) => {
        if (c.apiUrl !== undefined) {
          this.config = c;
        }
      })
      .catch(() => {});
  }

  get apiUrl(): string {
    return this.config.apiUrl;
  }
}
