# BLUESKYBOT0
A little bot that scrapes the web for new product launches and posts them to Bluesky.
See the bot in action [here](https://launchbot.bsky.social).

## Overview
This project automates the process of discovering, summarizing, and sharing new product launches. It consists of two main scripts: `src/main.ts` for scraping and processing new product listings, and `src/post.ts` for posting product summaries to Bluesky. Both scripts are designed to run as automated GitHub Workflows, ensuring regular updates.

## Project Setup and Program Execution

1.  **Install Node.js and npm:**
    *   Download and install Node.js from [https://nodejs.org/](https://nodejs.org/). This will also install npm (Node Package Manager), which we'll use to manage project dependencies. Choose the LTS (Long-Term Support) version for stability.
    *   After installation, verify that Node.js and npm are installed correctly by running the following commands in your terminal:
        ```bash
        node -v
        npm -v
        ```
        You should see version numbers for both Node.js and npm.

2.  **Clone the Project Repository:**
    *   Open your terminal and navigate to the directory where you want to store your project.
    *   Clone the project repository using `git clone`:
        ```bash
        git clone https://github.com/aalapd/blueskybot0.git
        cd blueskybot0
        ```

3.  **Install Project Dependencies:**
    *   Navigate into the cloned project directory in your terminal (if you haven't already).
    *   Run the following command to install all the necessary npm packages listed in `package.json`:
        ```bash
        npm install
        ```
        This will download and install libraries like `@google/generative-ai`, `@atproto/api`, `mongodb`, `axios`, `dotenv`, etc.

4.  **(If You Make Any Changes to the TS Files) Rebuild the TypeScript Code:**
    *   Run the TypeScript build command to compile the TypeScript code into JavaScript, which Node.js can execute:
        ```bash
        npm run build
        ```
        This command uses the `tsc` (TypeScript compiler) configured in `tsconfig.json` and specified in the `scripts` section of `package.json` to transpile the `.ts` files in your `src` directory into `.js` files in the `dist` directory.

5.  **Create `.env` file:**
    *   Create a file named `.env` in the root of your project directory.
    *   Add the necessary environment variables to this file:
        ```bash
        GEMINI_API_KEY: Your Gemini API key.
        MONGODB_URI: Your MongoDB connection string.
        MONGODB_DBNAME: The MongoDB database name.
        MONGODB_COLLNAME: Enter your MongoDB collection name.
        BLUESKY_SERVICE: https://bsky.social (unless youre using a different service).
        BLUESKY_IDENTIFIER: yourusername.bsky.social
        BLUESKY_PASSWORD: Enter your Bluesky account password.
        ```

6. **To Run the Workflows:**
    *   To run the scraper, run the following command in your terminal:
        ```bash
        npm run scrape
        ```
    *   To run the poster, run the following command:
        ```bash
        npm run post
        ```

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

## Scripts

**`src/main.ts` (Scraper Script):**
This script is responsible for scraping new product listings from target websites, parsing the scraped data using Google's Gemini AI, filtering out unwanted products, and storing the processed product information in a MongoDB database.

**`src/post.ts` (Poster Script):**
This script retrieves unprocessed product listings from the MongoDB database, scrapes the individual product pages, generates a detailed product summary using Gemini AI, and posts this summary to a Bluesky account. It also includes functionality to take a screenshot of the product page and attach it to the Bluesky post.

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

## Contributing

Contributions are welcome! Whether you're reporting bugs, suggesting features, writing code, or improving documentation, your help is appreciated.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
