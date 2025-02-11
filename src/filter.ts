// src/filter.ts

/**
 * Filters a list of products to remove entries from specific domains.
 * It removes products with URLs containing 'producthunt.com' or 'launchingnext.com'.
 *
 * @param {any[]} products - An array of product objects, each expected to have a 'product_url' property.
 * @returns {{ filteredProducts: any[], removedProducts: any[] }} - An object containing two arrays:
 *   - 'filteredProducts': Products that passed the filter (i.e., not from the blacklisted domains).
 *   - 'removedProducts': Products that were removed because they are from the blacklisted domains.
 */
export function filterProducts(products: any[]): { filteredProducts: any[], removedProducts: any[] } {
  const filteredProducts: any[] = [];
  const removedProducts: any[] = [];

  products.forEach(product => {
    const url = product.product_url;
    if (!url) {
      filteredProducts.push(product); // Keep products without a URL
    } else if (!(url.includes('producthunt.com') || url.includes('launchingnext.com'))) {
      filteredProducts.push(product);
    } else {
      removedProducts.push(product);
    }
  });

  return { filteredProducts, removedProducts };
}
