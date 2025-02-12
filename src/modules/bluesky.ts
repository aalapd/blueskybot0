// src/modules/bluesky.ts
import { AtpAgent, RichText } from "@atproto/api";
import { writeLog } from "../utils/logger.js";

import dotenv from 'dotenv';
dotenv.config();


// Read service and credentials from environment variables
const service = process.env.BLUESKY_SERVICE;
const identifier = process.env.BLUESKY_IDENTIFIER;
const password = process.env.BLUESKY_PASSWORD;

if (!service) {
  throw new Error("BLUESKY_SERVICE environment variable is not defined");
}
const agent = new AtpAgent({ service });

async function login(): Promise<void> {
  if (!agent.session) {
    if (!identifier || !password) {
      throw new Error("BLUESKY_IDENTIFIER or BLUESKY_PASSWORD environment variable is not defined");
    }
    await agent.login({ identifier, password });
    writeLog("Logged in to Bluesky successfully.");
  }
}

/**
 * Converts a Data URI to a Uint8Array.
 * @param dataURI The data URI string.
 * @returns A Uint8Array of the decoded data.
 */
function convertDataURIToUint8Array(dataURI: string): Uint8Array {
  const base64Index = dataURI.indexOf(",") + 1;
  const base64 = dataURI.substring(base64Index);
  const raw = Buffer.from(base64, "base64");
  return new Uint8Array(raw);
}

/**
 * Posts a website card to Bluesky with an external embed.
 * @param productTitle The product title.
 * @param productSummary The product summary.
 * @param productUrl The product's actual website URL.
 * @param productPageScreenshotDataURI The screenshot image as a Data URI.
 */
export async function postToBluesky(
  productTitle: string,
  productSummary: string,
  productUrl: string,
  productPageScreenshotDataURI: string
): Promise<void> {
  try {
    await login();

    // Compose the post text.
    const postText = `✨${productTitle}✨\n\n${productSummary}\n`;

    // Prepare RichText to detect facets.
    const rt = new RichText({ text: postText });
    await rt.detectFacets(agent);

    // Convert the Data URI to a Uint8Array.
    const imageData = convertDataURIToUint8Array(productPageScreenshotDataURI);

    // Upload the image blob.
    const blobUpload = await agent.uploadBlob(imageData, {
      encoding: "image/png",
    });

    // Construct the embed with the blob ref directly.
    const embed = {
      $type: "app.bsky.embed.external",
      external: {
        uri: productUrl,
        title: productTitle,
        description: productSummary,
        thumb: blobUpload.data.blob, // Use the blob ref directly.
      },
    };

    const record = {
      text: rt.text,
      facets: rt.facets,
      embed,
      createdAt: new Date().toISOString(),
    };

    const result = await agent.post(record);
    writeLog(
      `Posted successfully. Post URI: ${result.uri}, CID: ${result.cid}`
    );
  } catch (error) {
    writeLog(`Error posting to Bluesky: ${error}`);
    throw error;
  }
}
