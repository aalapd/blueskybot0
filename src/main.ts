// src/main.ts
import { scrapeLaunchingNext } from "./scraper";
import { parseWithGemini } from "./llm";
import { writeLog } from "./logger";
import { saveProducts } from "./storage";

async function main() {
  try {
    writeLog("Starting daily scrape.");

    const rawData = await scrapeLaunchingNext();
    writeLog("Scrape successful.");
    console.log("Raw data snippet:", rawData.slice(0, 300));

    // Pass the raw data (which should contain the JSON with HTML) to Gemini for parsing.
    const parsedResult = await parseWithGemini(rawData);
    writeLog("LLM parsing successful.");
    console.log("LLM parsed result:", parsedResult.slice(0, 100));

    // Save the result in an array (for now, wrapping the object in an array).
    saveProducts([parsedResult]);
    writeLog("Products saved successfully.");

    // Save the results one-by-one to a database and check if any of the URLs have already been saved.

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
