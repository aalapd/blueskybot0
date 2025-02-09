import * as fs from "fs";
import * as path from "path";
import { Product } from "./parser";

export function saveProducts(products: Product[]): void {
  const dataDir = path.join(__dirname, "../data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  const outputPath = path.join(dataDir, "products.json");
  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), "utf-8");
  console.log(`Saved ${products.length} products to ${outputPath}`);
}
