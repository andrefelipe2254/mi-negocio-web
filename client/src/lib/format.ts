// Utility functions for formatting data in the business inventory system

export function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) return '0';
  
  // Format with thousands separator and no decimals if whole number
  if (numPrice % 1 === 0) {
    return numPrice.toLocaleString('es-CO');
  }
  
  // Format with decimals but remove trailing zeros
  return numPrice.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

export function formatCurrency(price: string | number): string {
  return `$${formatPrice(price)}`;
}

export function calculateProfit(salePrice: string, purchasePrice: string): string {
  const sale = parseFloat(salePrice);
  const purchase = parseFloat(purchasePrice);
  const profit = sale - purchase;
  return formatPrice(profit);
}

export function calculateProfitMargin(salePrice: string, purchasePrice: string): string {
  const sale = parseFloat(salePrice);
  const purchase = parseFloat(purchasePrice);
  const margin = ((sale - purchase) / purchase) * 100;
  return margin.toFixed(1);
}