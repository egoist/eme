//Copyright 2019 The EME authors

export function truncate(str: string, maxLength: number): string {
  if(str.length > maxLength) return str.substr(Math.max(0, maxLength - 3)) + "...";
  return str;
}
