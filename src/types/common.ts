export type Dict<V = string> = {
  [key: string]: V;
};

export type OneOrMany<T> = T | T[];
