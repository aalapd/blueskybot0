var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function login() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!agent.session) {
            if (!identifier || !password) {
                throw new Error("BLUESKY_IDENTIFIER or BLUESKY_PASSWORD environment variable is not defined");
            }
            yield agent.login({ identifier, password });
            writeLog("Logged in to Bluesky successfully.");
        }
    });
}
/**
 * Converts a Data URI to a Uint8Array.
 * @param dataURI The data URI string.
 * @returns A Uint8Array of the decoded data.
 */
function convertDataURIToUint8Array(dataURI) {
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
export function postToBluesky(productTitle, productSummary, productUrl, productPageScreenshotDataURI) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield login();
            // Compose the post text.
            const postText = `✨${productTitle}✨\n\n${productSummary}\n`;
            // Prepare RichText to detect facets.
            const rt = new RichText({ text: postText });
            yield rt.detectFacets(agent);
            // Convert the Data URI to a Uint8Array.
            const imageData = convertDataURIToUint8Array(productPageScreenshotDataURI);
            // Upload the image blob.
            const blobUpload = yield agent.uploadBlob(imageData, {
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
            const result = yield agent.post(record);
            writeLog(`Posted successfully. Post URI: ${result.uri}, CID: ${result.cid}`);
        }
        catch (error) {
            writeLog(`Error posting to Bluesky: ${error}`);
            throw error;
        }
    });
}
