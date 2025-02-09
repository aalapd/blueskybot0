import axios from "axios";

const url = "https://r.jina.ai/https://www.launchingnext.com/?ref=producthunt";
const headers = {
  Accept: "text/event-stream",
  Authorization: `Bearer ${process.env.JINA_API_KEY}`, // Replace with your actual API key
  "X-No-Cache": "true",
  "X-Return-Format": "markdown",
};

export async function scrapeLaunchingNext(): Promise<string> {
  try {
    const response = await axios.get(url, { headers });
    console.log("Scrape successful:", response.status);
    // The response is expected to be JSON with a "content" field containing markdown.
    let markdown: string;
    if (typeof response.data === "string") {
      const trimmed = response.data.trim();
      if (trimmed.startsWith("{")) {
        const jsonData = JSON.parse(trimmed);
        markdown = jsonData.content;
      } else {
        markdown = response.data;
      }
    } else {
      markdown = response.data.content;
    }
    return markdown;
  } catch (error) {
    console.error("Error during scraping:", error);
    throw error;
  }
}
