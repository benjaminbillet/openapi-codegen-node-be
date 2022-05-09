import { EOL } from 'os';
import path from 'path';
import fs from 'fs';
import { OpenApiNode } from 'openapi-ref-resolver';
import Handlebars from 'handlebars/runtime';
import config from './templates/config.hbs';
import constant from './templates/constant.hbs';
import route from './templates/route.hbs';
import { Dict } from '../types/common';
import routesTemplate from './templates/routes.hbs';
import { processSpec } from '../generator/model';

export const configureHandlebars = (handlebars: typeof Handlebars) => {
  handlebars.registerHelper(
    'equals',
    function (this: unknown, a: string, b: string, options: Handlebars.HelperOptions): string {
      return a === b ? options.fn(this) : options.inverse(this);
    },
  );

  handlebars.registerHelper(
    'notEquals',
    function (this: unknown, a: string, b: string, options: Handlebars.HelperOptions): string {
      return a !== b ? options.fn(this) : options.inverse(this);
    },
  );

  Handlebars.registerHelper('snakeCase', function (value: string): string {
    return value
      .replace(/\*\//g, '*')
      .replace(/\/\*/g, '*')
      .replace(/\r?\n(.*)/g, (_, w) => `${EOL} * ${w.trim()}`);
  });

  Handlebars.registerHelper('escapeComment', function (value: string): string {
    return value
      .replace(/\*\//g, '*')
      .replace(/\/\*/g, '*')
      .replace(/\r?\n(.*)/g, (_, w) => `${EOL} * ${w.trim()}`);
  });

  Handlebars.registerHelper('escapeDescription', function (value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
  });

  handlebars.registerPartial('config', handlebars.template(config));
  handlebars.registerPartial('constant', handlebars.template(constant));
  handlebars.registerPartial('route', handlebars.template(route));
};

export const generate = (spec: OpenApiNode, options: Dict = { outputDir: 'gen' }) => {
  const { models, operations } = processSpec(spec);

  const handlebars = Handlebars.create();
  configureHandlebars(handlebars);

  const template = handlebars.template(routesTemplate);

  const outputFile = path.resolve(options.outputDir, 'routes.ts');
  const code = template({ models, operations });
  fs.writeFileSync(outputFile, code, { flag: 'w' });
};
