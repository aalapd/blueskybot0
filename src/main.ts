import { scrapeLaunchingNext } from "./scraper";
import { parseProducts, Product } from "./parser";
import { writeLog } from "./logger";
import { saveProducts } from "./storage";
// import { generateSummary } from "./llm";
// import { postToBluesky } from "./bluesky";

async function main() {
  try {
    writeLog("Starting daily scrape.");
    const markdown = await scrapeLaunchingNext();
    writeLog("Scrape successful.");
    console.log("Markdown snippet:", markdown.slice(0, 300));

    const products: Product[] = parseProducts(markdown);
    writeLog(`Parsed ${products.length} products.`);
    saveProducts(products);
    writeLog("Products saved successfully.");

    // For each product, generate a summary and post to Bluesky.
    
    for (const product of products) {
      //const summary = await generateSummary(product.title, product.link);
      //await postToBluesky(summary);
      //writeLog(`Posted product: ${product.title}`);
    }
  } catch (error) {
    writeLog(`Error in main: ${error}`);
  }
}

main();
