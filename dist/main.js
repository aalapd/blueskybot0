var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// src/main.ts
import { scrapeNewProducts } from "./modules/scraper.js";
import { parseProducts } from "./modules/llm.js";
import { writeLog } from "./utils/logger.js";
import { saveProducts, closeDatabaseConnection } from "./modules/storage.js";
import { filterProducts } from "./modules/filter.js";
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            writeLog("Starting daily scrape.");
            const rawData = yield scrapeNewProducts();
            writeLog("Scrape successful.");
            console.log("Raw data snippet:", rawData.slice(0, 300));
            // Pass the raw data to Gemini for parsing.
            const parsedResult = yield parseProducts(rawData);
            writeLog("LLM parsing successful.");
            console.log("LLM parsed result:", JSON.stringify(parsedResult).slice(0, 300));
            // Filter out products from producthunt.com and launchingnext.com
            const { filteredProducts, removedProducts } = filterProducts(parsedResult);
            if (removedProducts.length > 0) {
                writeLog(`Removed ${removedProducts.length} products.`);
                console.log("Removed products:", JSON.stringify(removedProducts).slice(0, 100));
            }
            // Save only new products (appending if not already present) to the JSON file.
            yield saveProducts(filteredProducts);
            writeLog("Products saved successfully.");
        }
        catch (error) {
            writeLog(`Error in main: ${error}`);
        }
        finally {
            // Ensure that the MongoDB client is closed so the process can exit
            yield closeDatabaseConnection();
        }
    });
}
main();
