export const load = (key) => {
  try {
    const value = localStorage.getItem(key);
    console.log(JSON.parse(value));
    return typeof value === "string" ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};