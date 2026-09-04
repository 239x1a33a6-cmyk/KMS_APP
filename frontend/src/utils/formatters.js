export const formatDate = (dateValue) => {
  if (!dateValue) return "—";

  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
};
