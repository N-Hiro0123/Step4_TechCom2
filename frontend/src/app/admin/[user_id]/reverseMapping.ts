export const mappingValue2Key = (mapping: { [key: number]: string }, Name: string): number => {
  const reverseMapping: { [key: string]: string } = {};
  for (const [key, value] of Object.entries(mapping)) {
    reverseMapping[value] = key;
  }
  return parseInt(reverseMapping[Name], 10) || 1;
};
