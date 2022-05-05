import * as Handlebars from 'handlebars/runtime';
import enumPartial from './type-generator/typescript/templates/enum.hbs';
import { configureHandlebars } from './type-generator';

const handlebars = Handlebars.create();
configureHandlebars(handlebars);

handlebars.registerPartial('enum', handlebars.template(enumPartial));
