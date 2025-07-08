export function FormatNumber(value: number | string): string {
  const str = String(value);
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}