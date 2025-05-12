export const load = (key) => {
  try {
    const value = localStorage.getItem(key);
    return typeof value === "string" ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};