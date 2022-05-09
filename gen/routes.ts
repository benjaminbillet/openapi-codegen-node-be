/* tslint:disable */
/* eslint-disable */
/* istanbul ignore file */
import { Router, RequestHandler } from 'express';
import { body } from 'express-validator';
import { Dict } from './types';

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

/* CONSTANTS */
export const GETSUBRESOURCE_PATH = '/api/resources/{resource-id}/sub-resources/{sub-resource-id}';
export const GETSUBRESOURCE_ID = 'getSubResource';

/* CONFIGS */
export class RouteConfiguration {
  private validators: RequestHandler[] = [];
  private preMiddlewares: RequestHandler[] = [];
  private postMiddlewares: RequestHandler[] = [];
  private routeFunction?: RequestHandler;

  private path: string;
  private method: HttpMethod;

  constructor(path: string, method: HttpMethod) {
    this.path = path;
    this.method = method;
  }

  pushValidator(handler: RequestHandler) {
    this.validators.push(handler);
  }
  unshiftValidator(handler: RequestHandler) {
    this.validators.unshift(handler);
  }

  pushPreMiddleware(handler: RequestHandler) {
    this.preMiddlewares.push(handler);
  }
  unshiftPreMiddleware(handler: RequestHandler) {
    this.preMiddlewares.unshift(handler);
  }

  pushPostMiddleware(handler: RequestHandler) {
    this.postMiddlewares.push(handler);
  }
  unshiftPostMiddleware(handler: RequestHandler) {
    this.postMiddlewares.unshift(handler);
  }

  setRouteFunction(handler: RequestHandler) {
    this.routeFunction = handler;
  }

  getMiddlewares(): RequestHandler[] {
    const middlewares = [
      ...this.preMiddlewares,
      ...this.validators,
      ...this.postMiddlewares,
    ];
    if (this.routeFunction) {
      middlewares.push(this.routeFunction);
    }
    return middlewares;
  }

  getMethod() {
    return this.method;
  }

  getPath() {
    return this.path;
  }
}

const configs: Dict<RouteConfiguration> = {
  [GETSUBRESOURCE_ID]: new RouteConfiguration(GETSUBRESOURCE_PATH, 'get'),
};

export const configure = (operationId: string): RouteConfiguration => {
  return configs[operationId];
};

/* ROUTER */
export const getRouter = () => {
  const router = Router();
  Object.values(configs).forEach((config) => {
    router[config.getMethod()](config.getPath(), config.getMiddlewares());
  });
  return router;
};
