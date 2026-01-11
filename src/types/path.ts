type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;

type PathImpl<T, D extends number = 5> = D extends 0
  ? never
  : T extends object
  ? {
      [K in Extract<keyof T, string>]: T[K] extends Array<infer U>
        ?
            | `${K}`
            | `${K}.${number}`
            | (D extends 1
                ? never
                : `${K}.${number}${DotPrefix<PathImpl<U, Prev[D]>>}`)
        :
            | `${K}`
            | (D extends 1
                ? never
                : `${K}${DotPrefix<PathImpl<T[K], Prev[D]>>}`);
    }[Extract<keyof T, string>]
  : "";

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export type Path<T> = PathImpl<T>;

export type PathValue<T, P extends string | undefined> = string extends P
  ? unknown
  : P extends keyof NonNullable<T>
  ? NonNullable<T>[P]
  : P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof NonNullable<T>
    ? PathValue<NonNullable<T>[Key], Rest>
    : Key extends `${number}`
    ? NonNullable<T> extends ReadonlyArray<infer U>
      ? PathValue<U, Rest>
      : never
    : never
  : P extends `${number}`
  ? NonNullable<T> extends ReadonlyArray<infer U>
    ? U
    : never
  : never;
