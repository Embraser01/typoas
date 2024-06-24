import { Transform } from './transform';

// Typing here is only for information purposes
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export const DateTransformer: Transform<unknown, Date | unknown> = (val) => {
  if (typeof val !== 'string') {
    return val;
  }
  const date = new Date(val);
  if (isNaN(date.getTime())) {
    return val;
  }
  return date;
};
