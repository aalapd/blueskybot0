// src/main.ts
import { scrapeLaunchingNext } from "./scraper";
import { parseWithGemini } from "./llm";
import { writeLog } from "./logger";
import { saveProducts } from "./storage";
import { filterProducts } from "./filter";

async function main() {
  try {
    writeLog("Starting daily scrape.");
    const rawData = await scrapeLaunchingNext();
    writeLog("Scrape successful.");
    console.log("Raw data snippet:", rawData.slice(0, 300));
    
    // Pass the raw data to Gemini for parsing.
    // We assume the LLM returns an array of product objects (each with product_title and product_url).
    const parsedResult = await parseWithGemini(rawData);
    writeLog("LLM parsing successful.");
    console.log("LLM parsed result:", JSON.stringify(parsedResult).slice(0, 300));
    
    // Ensure we have an array of new products.
    //let newProducts = Array.isArray(parsedResult) ? parsedResult : [parsedResult];
    
    // Filter out products from producthunt.com and launchingnext.com
    const { filteredProducts, removedProducts } = filterProducts(parsedResult);

    if (removedProducts.length > 0) {
      writeLog(`Removed ${removedProducts.length} products: ${JSON.stringify(removedProducts, null, 2)}`);
      console.log("Removed products:", JSON.stringify(removedProducts).slice(0, 100));
    }

    // Save only new products (appending if not already present) to the JSON file.
    saveProducts(filteredProducts);
    writeLog("Products saved successfully.");

    // Save the results one-by-one to a local database while keeping the URLs unique.

    // LOOP 4-6 TIMES A DAY>>>

    // Take a break before the next scrape.

    // Fetch the first unposted result from the database and scrape the product URL.

    // Parse the product page content with Gemini.

    // Post the content to Bluesky.

    // Mark the product as posted in the database.

    // Rinse and repeat for the rest of the products.

    // <<< LOOP


  } catch (error) {
    writeLog(`Error in main: ${error}`);
  }
}

main();
