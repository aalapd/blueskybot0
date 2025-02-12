// src/post.ts
import {
  getProducts,
  markProductAsPosted,
  closeDatabaseConnection,
} from "./modules/storage";
import { scrapeProductPage, getProductPageScreenshot } from "./modules/scraper";
import { parseProductPageContent } from "./modules/llm";
import { postToBluesky } from "./modules/bluesky";
import { writeLog } from "./utils/logger";

async function post(): Promise<void> {
  try {
    // Reuse the storage module's getCollection() method to query the DB directly.
    const collection = await getProducts();

    // Randomly pick one unposted product from your collection
    const unpostedProduct = await collection
      .aggregate([{ $match: { posted: false } }, { $sample: { size: 1 } }])
      .next();

    if (!unpostedProduct) {
      writeLog("No unposted product found. Exiting post process.");
      return;
    }
    writeLog(
      `Processing unposted product: ${unpostedProduct.product_title} (${unpostedProduct.product_url})`
    );

    // Scrape the individual product page using the product_url
    const productPageContent = await scrapeProductPage(
      unpostedProduct.product_url
    );
    writeLog(`Scraped product page for ${unpostedProduct.product_title}.`);
    console.log(
      "Product page content snippet:",
      productPageContent.slice(0, 300)
    );

    const productPageScreenshot = await getProductPageScreenshot(
      unpostedProduct.product_url
    );
    writeLog(
      `Retrieved product page screenshot for ${unpostedProduct.product_title}.`
    );
    console.log(
      "Retrieved page screenshot:" + productPageScreenshot.slice(0, 300)
    );

    // Parse the product page content with Gemini to generate a detailed summary
    const productSummary = await parseProductPageContent(productPageContent);
    writeLog(
      `Parsed product page content for ${unpostedProduct.product_title}.`
    );
    console.log("Product summary:", productSummary);
    if (productSummary.length < 40) {
      writeLog(`Product summary was too short. Skipping post.`);
      console.log("Product summary was too short. Skipping post.");
      return;
    }

    // Post the generated summary to Bluesky
    await postToBluesky(
      unpostedProduct.product_title.toUpperCase(),
      productSummary,
      unpostedProduct.product_url,
      productPageScreenshot
    );
    writeLog(`Posted product ${unpostedProduct.product_title} to Bluesky.`);

    // Mark the product as posted in the database
    await markProductAsPosted(unpostedProduct.product_url);
    writeLog(`Marked product ${unpostedProduct.product_title} as posted.`);
  } catch (error) {
    writeLog(`Error in processing unposted product: ${error}`);
  } finally {
    // Ensure that the MongoDB client is closed so the process can exit
    await closeDatabaseConnection();
    // Exit the process to ensure the script terminates if running in a scheduled job.
    process.exit(0);
  }
}

post();
