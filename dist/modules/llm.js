var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// src/llm.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
});
export function parseProducts(markdownContent) {
    return __awaiter(this, void 0, void 0, function* () {
        // Explicitly cast the literal values to SchemaType
        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
        };
        // Construct a specific prompt instructing Gemini to extract product details.
        const prompt = `
    Please parse the following content and extract the details for all product listings on the page. Each product listing should be represented as an object with exactly two properties:
    - "product_title": the text contained after the ###,
    - "product_url": the website URL to the product. This URL is not 'www.launchingnext.com' URL. It is a URL that points to the product's actual website.
    Ensure there is no mismatch between the product title and URL.
    Return a JSON array containing one object per product. For example:
    [
        {
            "product_title": "Example Product",
            "product_url": "https://example.com/"
        },
        ...
    ]
    If no products are found, return an empty JSON array.
    Content:
    ${markdownContent}
  `;
        const chatSession = model.startChat({
            generationConfig,
            history: [],
        });
        const result = yield chatSession.sendMessage(prompt);
        const responseText = result.response.text();
        //console.log("Gemini response text:", responseText);
        try {
            return JSON.parse(responseText);
        }
        catch (err) {
            throw new Error(`Error parsing LLM output: ${responseText}`);
        }
    });
}
/**
 * Parses an individual product page's content to generate a detailed summary.
 * @param productContent The markdown content of the product page.
 * @returns A promise resolving to a string summary of the product.
 */
export function parseProductPageContent(productContent) {
    return __awaiter(this, void 0, void 0, function* () {
        // Explicitly cast the literal values to SchemaType
        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain",
        };
        const prompt = `
Please parse the following content of a product page and generate a concise summary of the product's key features and value proposition. 
Use a professional and journalistic tone. Use less than 300 characters. Be truthful and maintain accuracy. Only respond with the contents of the summary. 
If the content is not sufficient to generate a summary, return an empty string.

Example Response 1: 

Mistral Small 3 is a latency-optimized 24B-parameter model under Apache 2.0 license, competitive with larger models like Llama 3.3 70B. It excels in low-latency tasks and is efficient for local deployment, boasting 81% accuracy on MMLU and 150 tokens/s.'

Example Response 2:

Palify offers professional networking for Gen Z and Millennials. Create a profile to manage jobs, collaborate, share content, and build community. Promote your brand and connect with others, all in one spot!

Content: ${productContent} `;
        const chatSession = model.startChat({
            generationConfig,
            history: [],
        });
        const result = yield chatSession.sendMessage(prompt);
        let responseText = result.response.text().trim();
        // Attempt to parse as JSON. If it's a JSON object with a 'summary' field, return that.
        try {
            const parsed = JSON.parse(responseText);
            if (parsed && typeof parsed === "object" && "summary" in parsed) {
                return parsed.summary;
            }
        }
        catch (err) {
            // Not valid JSON; fall through.
        }
        // Otherwise, remove any extraneous surrounding quotes and return.
        return responseText.replace(/^"|"$/g, "");
    });
}
