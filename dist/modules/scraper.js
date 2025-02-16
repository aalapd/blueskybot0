var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// src/scraper.ts
import axios from "axios";
import fetch from "node-fetch";
import { writeLog } from ".././utils/logger.js";
const scraperUrl = "https://r.jina.ai/";
const landingPageUrl = "https://www.launchingnext.com/?ref=producthunt";
export function scrapeNewProducts() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios.get(`${scraperUrl}${landingPageUrl}`, {
                headers: {
                    "X-No-Cache": "true",
                    "X-Return-Format": "markdown",
                    'X-With-Shadow-Dom': 'true'
                },
            });
            writeLog(`Scraped ${landingPageUrl} successfully.`);
            return response.data;
        }
        catch (error) {
            writeLog(`Error scraping ${landingPageUrl}: ${error}`);
            throw error;
        }
    });
}
/**
 * Scrapes the HTML content for a single product page.
 * @param productPageUrl The URL of the product page to scrape.
 * @returns A promise resolving to the HTML content of the product page.
 */
export function scrapeProductPage(productPageUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const url = `${scraperUrl}${productPageUrl}`;
            const headers = {
                Accept: "text/event-stream",
                "X-Base": "final",
                "X-No-Cache": "true",
                "X-Respond-With": "readerlm-v2",
                "X-Return-Format": "markdown",
            };
            const response = yield fetch(url, { headers });
            const textResponse = yield response.text();
            return textResponse;
        }
        catch (error) {
            throw new Error(`Error scraping product page ${productPageUrl}: ${error}`);
        }
    });
}
export function getProductPageScreenshot(productPageUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const headers = {
                "Content-Type": "application/json",
                "X-No-Cache": "true",
                "X-Return-Format": "screenshot",
            };
            const data = {
                url: productPageUrl,
                injectPageScript: [
                    "// Remove headers, footers, navigation elements\ndocument.querySelectorAll('header, footer, nav').forEach(el => el.remove());\n\n// Or a url that returns a valid JavaScript code snippet\n// https://example.com/script.js",
                ],
            };
            const response = yield fetch(scraperUrl, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(data),
            });
            // Instead of trying to parse JSON, we treat the response as binary image data.
            const arrayBuffer = yield response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64Image = buffer.toString("base64");
            // Return a Data URI (assuming the image is a PNG)
            return `data:image/png;base64,${base64Image}`;
        }
        catch (error) {
            throw new Error(`Error retrieving product page screenshot ${productPageUrl}: ${error}`);
        }
    });
}
