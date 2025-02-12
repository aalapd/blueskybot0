# BLUESKYBOT0
An little bot that scrapes the web for new product launches and posts them to Bluesky.
See the bot in action [here](https://launchbot.bsky.social).

## Overview
This project automates the process of discovering, summarizing, and sharing new product launches. It consists of two main scripts: `src/main.ts` for scraping and processing new product listings, and `src/post.ts` for posting product summaries to Bluesky. Both scripts are designed to run as automated GitHub Workflows, ensuring regular updates.

**`src/main.ts` (Scraper Script):**
This script is responsible for scraping new product listings from target websites, parsing the scraped data using Google's Gemini AI, filtering out unwanted products, and storing the processed product information in a MongoDB database.

**`src/post.ts` (Poster Script):**
This script retrieves unprocessed product listings from the MongoDB database, scrapes the individual product pages, generates a detailed product summary using Gemini AI, and posts this summary to a Bluesky account. It also includes functionality to take a screenshot of the product page and attach it to the Bluesky post.

## Project Structure
```
├── .github/workflows          # GitHub Workflow configurations
│   ├── scrape.yml             # Workflow for running the scraper script (src/main.ts)
│   └── post.yml               # Workflow for running the poster script (src/post.ts)
├── src                        # Source code directory
│   ├── main.ts                # Entry point for the scraper script
│   ├── post.ts                # Entry point for the poster script
│   ├── modules                # Modular components
│   │   ├── bluesky.ts         # Handles posting product updates to Bluesky
│   │   ├── filter.ts          # Filters out unwanted product listings
│   │   ├── llm.ts             # Uses Gemini AI for parsing and summarization
│   │   ├── scraper.ts         # Handles scraping of product listings and pages
│   │   └── storage.ts         # Manages database interactions (MongoDB)
│   └── utils                  # Utility functions
│   │   └── logger.ts          # Logging utility
├── .env                       # Environment variables (API keys, database URIs, etc.)
├── package-lock.json
├── package.json               # Project dependencies and metadata
├── README.md                  # Project documentation
└── tsconfig.json              # TypeScript configuration
```

## Workflows
### 1. Scrape Workflow (`scrape.yml`)
- **Script:** `src/main.ts`
- **Schedule:** Daily at midnight UTC
- **Purpose:**
    - Scrapes new product listings from predefined sources.
    - Parses raw data using Google Gemini AI to extract product details.
    - Filters out products from unwanted domains.
    - Saves filtered and parsed product data to a MongoDB database.

### 2. Poster Workflow (`post.yml`)
- **Script:** `src/post.ts`
- **Schedule:** Every 6 hours starting at 12:30AM UTC
- **Purpose:**
    - Retrieves unprocessed product listings from the MongoDB database.
    - Scrapes individual product pages for detailed content.
    - Generates a concise product summary using Gemini AI.
    - Posts the product summary to a Bluesky social media account, including a screenshot of the product page.
    - Updates the product status in the database to mark it as "posted".