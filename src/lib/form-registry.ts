import { FormInstance } from "../types/utils";

class FormRegistry {
  private forms = new Map<string, FormInstance<any>>();

  add<T>(id: string, form: FormInstance<T>) {
    this.forms.set(id, form);
    return () => {
      this.forms.delete(id);
    };
  }

  get<T extends FormInstance<any>>(id: string): T {
    const form = this.forms.get(id) as T | undefined;
    if (!form) throw new Error(`Form with ID "${id}" not found`);
    return form;
  }

  delete(id: string) {
    this.forms.delete(id);
  }
}

export const registry = new FormRegistry();
