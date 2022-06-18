import { Transform } from './transform';

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
