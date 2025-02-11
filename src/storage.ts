// src/storage.ts
import * as fs from 'fs';
import * as path from 'path';

// Define the full product interface for storage.
export interface StoredProduct {
  product_title: string;
  product_url: string;
  scrapedAt: string; // ISO string timestamp when the product was first scraped
  posted: boolean;   // flag indicating whether the product has been posted already
}

// Define the file path for the products JSON file.
const dataFilePath = path.join(__dirname, "../data/products.json");

/**
 * Loads the existing products from the JSON file.
 * If the file does not exist or is invalid, returns an empty array.
 */
export function loadExistingProducts(): StoredProduct[] {
  if (fs.existsSync(dataFilePath)) {
    try {
      const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
      const products: StoredProduct[] = JSON.parse(fileContent);
      return products;
    } catch (err) {
      console.error("Error parsing existing products.json:", err);
      return [];
    }
  }
  return [];
}

/**
 * Merges new products into the existing storage.
 * Each new product is an object with product_title and product_url.
 * A product is only appended if its product_url or product_title does not already exist.
 * For each new product, we add:
 *  - scrapedAt: the current timestamp (ISO string)
 *  - posted: false
 */
export function saveProducts(newProducts: { product_title: string; product_url: string }[]): void {
  const existingProducts = loadExistingProducts();

  // Filter new products to keep only those not already in existing products (based on product_url and product_title).
  const filteredNewProducts = newProducts.filter(newProduct =>
    !existingProducts.some(existingProduct => existingProduct.product_url === newProduct.product_url || existingProduct.product_title === newProduct.product_title)
  );

  const mergedProducts: StoredProduct[] = [...existingProducts];

  filteredNewProducts.forEach((newProd) => { // Iterate over filteredNewProducts
    mergedProducts.push({
      product_title: newProd.product_title,
      product_url: newProd.product_url,
      scrapedAt: new Date().toISOString(),
      posted: false,
    });
  });

  fs.writeFileSync(dataFilePath, JSON.stringify(mergedProducts, null, 2), "utf-8");
  console.log(`Added ${filteredNewProducts.length} products to ${dataFilePath}`);
  console.log(`Total products in storage: ${mergedProducts.length}`);
}
