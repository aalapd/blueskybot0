var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// src/post.ts
import { getProducts, markProductAsPosted, closeDatabaseConnection, } from "./modules/storage.js";
import { scrapeProductPage, getProductPageScreenshot } from "./modules/scraper.js";
import { parseProductPageContent } from "./modules/llm.js";
import { postToBluesky } from "./modules/bluesky.js";
import { writeLog } from "./utils/logger.js";
function post() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Reuse the storage module's getCollection() method to query the DB directly.
            const collection = yield getProducts();
            // Randomly pick one unposted product from your collection
            const unpostedProduct = yield collection
                .aggregate([{ $match: { posted: false } }, { $sample: { size: 1 } }])
                .next();
            if (!unpostedProduct) {
                writeLog("No unposted product found. Exiting post process.");
                return;
            }
            writeLog(`Processing unposted product: ${unpostedProduct.product_title} (${unpostedProduct.product_url})`);
            // Scrape the individual product page using the product_url
            const productPageContent = yield scrapeProductPage(unpostedProduct.product_url);
            writeLog(`Scraped product page for ${unpostedProduct.product_title}.`);
            console.log("Product page content snippet:", productPageContent.slice(0, 300));
            const productPageScreenshot = yield getProductPageScreenshot(unpostedProduct.product_url);
            writeLog(`Retrieved product page screenshot for ${unpostedProduct.product_title}.`);
            console.log("Retrieved page screenshot:" + productPageScreenshot.slice(0, 300));
            // Parse the product page content with Gemini to generate a detailed summary
            const productSummary = yield parseProductPageContent(productPageContent);
            writeLog(`Parsed product page content for ${unpostedProduct.product_title}.`);
            console.log("Product summary:", productSummary);
            if (productSummary.length < 40) {
                writeLog(`Product summary was too short. Skipping post.`);
                console.log("Product summary was too short. Skipping post.");
                return;
            }
            // Post the generated summary to Bluesky
            yield postToBluesky(unpostedProduct.product_title.toUpperCase(), productSummary, unpostedProduct.product_url, productPageScreenshot);
            writeLog(`Posted product ${unpostedProduct.product_title} to Bluesky.`);
            // Mark the product as posted in the database
            yield markProductAsPosted(unpostedProduct.product_url);
            writeLog(`Marked product ${unpostedProduct.product_title} as posted.`);
        }
        catch (error) {
            writeLog(`Error in processing unposted product: ${error}`);
        }
        finally {
            // Ensure that the MongoDB client is closed so the process can exit
            yield closeDatabaseConnection();
            // Exit the process to ensure the script terminates if running in a scheduled job.
            process.exit(0);
        }
    });
}
post();
