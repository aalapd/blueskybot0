// src/main.ts
import { scrapeNewProducts } from "./modules/scraper";
import { parseProducts } from "./modules/llm";
import { writeLog } from "./utils/logger";
import { saveProducts, closeDatabaseConnection } from "./modules/storage";
import { filterProducts } from "./modules/filter";

async function main() {
  try {
    writeLog("Starting daily scrape.");
    const rawData = await scrapeNewProducts();
    writeLog("Scrape successful.");
    console.log("Raw data snippet:", rawData.slice(0, 300));
    
    // Pass the raw data to Gemini for parsing.
    const parsedResult = await parseProducts(rawData);
    writeLog("LLM parsing successful.");
    console.log("LLM parsed result:", JSON.stringify(parsedResult).slice(0, 300));
    
    // Filter out products from producthunt.com and launchingnext.com
    const { filteredProducts, removedProducts } = filterProducts(parsedResult);
    if (removedProducts.length > 0) {
      writeLog(`Removed ${removedProducts.length} products.`);
      console.log("Removed products:", JSON.stringify(removedProducts).slice(0, 100));
    }

    // Save only new products (appending if not already present) to the JSON file.
    await saveProducts(filteredProducts);
    writeLog("Products saved successfully.");

  } catch (error) {
    writeLog(`Error in main: ${error}`);
  } finally {
    // Ensure that the MongoDB client is closed so the process can exit
    await closeDatabaseConnection();
  }
}

main();
