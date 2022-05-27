export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const ALLOWED_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJIKLMNOPQRSTUVWXYZ123456789_';
export const toSnakeUppercase = (s: string) => {
  const original = [...s];
  let snakeNext = false;
  const nameArray = original.map((char) => {
    if (ALLOWED_CHARS.indexOf(char) >= 0) {
      if (snakeNext) {
        snakeNext = false;
        return char.toUpperCase();
      }
      return char;
    }
    snakeNext = true;
    return null;
  });

  let name = nameArray.filter((c) => c != null).join('');
  if (name.match(/^[0-9]/)) {
    name = `_${name}`;
  }
  return name.toUpperCase();
};
