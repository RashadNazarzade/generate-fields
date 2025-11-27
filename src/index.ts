import type { DICT, GenerateFields } from './types.ts';

import { convert } from './utils/convert.js';

export const generateFields = <const Fields extends DICT>(
  fields: Fields,
): GenerateFields<Fields> => convert(fields) as GenerateFields<Fields>;

export default generateFields;
