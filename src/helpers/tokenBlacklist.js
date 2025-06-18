export const tokenBlacklist = new Set();

export const agregarATokenBlacklist = (token) => {
  tokenBlacklist.add(token);
};

export const estaEnBlacklist = (token) => {
  return tokenBlacklist.has(token);
};