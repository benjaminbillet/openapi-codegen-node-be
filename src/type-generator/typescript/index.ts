import Handlebars from 'handlebars';

export const configureHandlebars = (handlebars: typeof Handlebars) => {
  handlebars.registerHelper('propName', (propName: string) => {
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(propName)) {
      return propName;
    }
    return `'${propName}'`;
  });

  handlebars.registerHelper('hasMapping', (index: number, options: Handlebars.HelperOptions) => {
    const composition = options.data.root;
    const schema = composition.subSchemas[index];
    return Boolean(composition.discriminator != null && schema && schema.discriminatorValue != null);
  });
};
