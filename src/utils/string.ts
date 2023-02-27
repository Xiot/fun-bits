export const trimEnd = (text: string, charToTrim: string): string => {
  for (let index = text.length - 1; index >= 0; index--) {
    if (text[index] !== charToTrim) {
      return text.slice(0, index + 1)
    }
  }
  if (text[0] === charToTrim) return '';
  return text;
}