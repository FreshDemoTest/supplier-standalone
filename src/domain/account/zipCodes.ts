export type zipCode = {
  value: string;
  label: string;
  estate: string;
  city? : string;
};
export type zipCodeIndex = { [k: string]: zipCode };
export type zipCodeKey = keyof zipCodeIndex;

export const zipCodes: zipCode[] = require('./zipcodes.json');

export const estatesMx = zipCodes
  .map((v) => v.estate)
  .reduce((acc, val) => {
    if (!acc.includes(val)) {
      acc.push(val);
    }
    return acc;
  }, [] as string[]);
