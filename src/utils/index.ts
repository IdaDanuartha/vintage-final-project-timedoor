export const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseInt(price) : price;
  return numPrice.toLocaleString('id-ID');
};