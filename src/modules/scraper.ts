// src/scraper.ts
import axios from "axios";
import fetch from "node-fetch";

const url = "https://r.jina.ai/https://www.launchingnext.com";

export async function scrapeNewProducts(): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        "X-No-Cache": "true",
        "X-Return-Format": "markdown",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Scrapes the HTML content for a single product page.
 * @param productPageUrl The URL of the product page to scrape.
 * @returns A promise resolving to the HTML content of the product page.
 */
export async function scrapeProductPage(
  productPageUrl: string
): Promise<string> {
  try {
    const url = `https://r.jina.ai/${productPageUrl}`;
    const headers = {
      Accept: "text/event-stream",
      "X-Base": "final",
      "X-No-Cache": "true",
      "X-Respond-With": "readerlm-v2",
      "X-Return-Format": "markdown",
    };
    const response = await fetch(url, { headers });
    const textResponse = await response.text();
    return textResponse;
  } catch (error) {
    throw new Error(`Error scraping product page ${productPageUrl}: ${error}`);
  }
}

export async function getProductPageScreenshot(
  productPageUrl: string
): Promise<string> {
  try {
    const url = "https://r.jina.ai/";
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

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    // Instead of trying to parse JSON, we treat the response as binary image data.
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    // Return a Data URI (assuming the image is a PNG)
    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    throw new Error(
      `Error retrieving product page screenshot ${productPageUrl}: ${error}`
    );
  }
}
