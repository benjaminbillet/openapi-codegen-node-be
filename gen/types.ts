/* tslint:disable */
/* eslint-disable */
/* istanbul ignore file */

export type Dict<V = string> = { [key: string]: V };

export type Derived<T, Keys extends keyof T, U> = Omit<T, Keys> & U;

export interface Problem {
  type: string,
  title?: string,
  status?: number,
  detail?: string,
  parameters?: Dict<any>,
};

export type ShapeType = 'square' | 'circle' | 'triangle';

export interface ShapePosition {
  x: number,
  y: number,
};

export interface Shape {
  'shape-type': ShapeType,
  text?: string,
  rotation: number,
  position: ShapePosition,
};

export interface SquarePart2 {
  size: number,
};

export type Square = Shape & SquarePart2;

export interface CirclePart2 {
  diameter: number,
};

export type Circle = Shape & CirclePart2;

export type SubResource = {
  id: string,
} & SubResourceOneOf;

export type SubResourceOneOf = Derived<Square, 'shape-type', { 'shape-type': 'square' }> | Derived<Circle, 'shape-type', { 'shape-type': 'circle' }>;

export type GetSubResource200ResponseBody = {
  id: string,
} & GetSubResource200ResponseBodyOneOf;

export type GetSubResource200ResponseBodyOneOf = Derived<Square, 'shape-type', { 'shape-type': 'square' }> | Derived<Circle, 'shape-type', { 'shape-type': 'circle' }>;

export interface GetSubResource4xxResponseBody {
  type: string,
  title?: string,
  status?: number,
  detail?: string,
  parameters?: Dict<any>,
};

export type GetSubResourceQueryParams = {
  'resource-id'?: string,
  'sub-resource-id'?: string,
};

