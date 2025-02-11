// src/llm.ts
import { GoogleGenerativeAI, GenerationConfig } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

// Explicitly cast the literal values to SchemaType
const generationConfig: GenerationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

export async function parseWithGemini(markdownContent: string): Promise<any> {
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

  const result = await chatSession.sendMessage(prompt);
  const responseText = result.response.text();
  //console.log("Gemini response text:", responseText);
  try {
    return JSON.parse(responseText);
  } catch (err) {
    throw new Error(`Error parsing LLM output: ${responseText}`);
  }
}
