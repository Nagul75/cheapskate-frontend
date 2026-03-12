export const formatCurrency = (amount: string | number, currency: string = "INR") => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
  }).format(num);
};

