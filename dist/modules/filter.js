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
export function filterProducts(products) {
    const filteredProducts = [];
    const removedProducts = [];
    products.forEach(product => {
        const url = product.product_url;
        if (!url) {
            removedProducts.push(product); // No URL, so remove the product.
        }
        else if (!(url.includes('producthunt.com') || url.includes('launchingnext.com') || url.includes('track.mailerlite.com'))) { // Check if the URL contains any of the blacklisted domains.
            filteredProducts.push(product);
        }
        else {
            removedProducts.push(product);
        }
    });
    return { filteredProducts, removedProducts };
}
