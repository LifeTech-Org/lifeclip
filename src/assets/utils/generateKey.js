export const generateKey = () => {
  let key = "";
  const l =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
  for (let x = 0; x < l.length; x++) {
    key += l[Math.floor(Math.random() * l.length)];
  }
  return key;
};
