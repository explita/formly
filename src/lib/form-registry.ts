import { FormInstance } from "../types/utils.js";

class FormRegistry {
  private forms = new Map<string, FormInstance<any>>();
  private listeners = new Set<() => void>();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    setTimeout(() => {
      this.listeners.forEach((l) => l());
    }, 0);
  }

  add<T>(id: string, form: FormInstance<T>) {
    const isNew = !this.forms.has(id);
    this.forms.set(id, form);
    if (isNew) {
      this.notify();
    }
    return () => {
      this.forms.delete(id);
      this.notify();
    };
  }

  get<T extends FormInstance<any>>(id: string): T {
    const form = this.forms.get(id) as T | undefined;
    if (!form) throw new Error(`Form with ID "${id}" not found`);
    return form;
  }

  delete(id: string) {
    this.forms.delete(id);
    this.notify();
  }

  has(id: string): boolean {
    return this.forms.has(id);
  }

  getAll(): Array<[string, FormInstance<any>]> {
    return Array.from(this.forms.entries());
  }
}

export const registry = new FormRegistry();
