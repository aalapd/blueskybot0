import { parseWithGemini, parseProductPageContent } from "../src/modules/llm";

describe("LLM Module Integration Tests", () => {
  // describe("parseWithGemini", () => {
  //   test("Successful Parsing with Product Listings", async () => {
  //     const markdownContent = `
  //       # Product Listings

  //       ### Awesome Gadget
  //       [Check it out here](https://example.com/gadget)

  //       ### Super Widget
  //       [Visit Website](https://widget-store.net/buy)

  //       Some other text that is not a product.
  //     `;

  //     const expectedOutput = [
  //       {
  //         product_title: "Awesome Gadget",
  //         product_url: "https://example.com/gadget",
  //       },
  //       {
  //         product_title: "Super Widget",
  //         product_url: "https://widget-store.net/buy",
  //       },
  //     ];

  //     const result = await parseWithGemini(markdownContent);
  //     expect(result).toEqual(expectedOutput);
  //   });

  //   test("No Products Found", async () => {
  //     const markdownContent = `
  //       # No Products Here

  //       This is just some text without any product listings.
  //     `;
  //     const expectedOutput = [];
  //     const result = await parseWithGemini(markdownContent);
  //     expect(result).toEqual(expectedOutput);
  //   });

  //   test("Handling Empty Input", async () => {
  //     const markdownContent = "";
  //     const expectedOutput = [];
  //     const result = await parseWithGemini(markdownContent);
  //     expect(result).toEqual(expectedOutput);
  //   });
  // });

  describe("parseProductPageContent", () => {
    test("Successful Summary Generation", async () => {
      const productContent = `
        ## Product: Amazing Smartwatch

        This smartwatch is packed with features! 
        - Tracks your fitness
        - Monitors your sleep
        - Connects to your phone

        Get yours today!
      `;
      const result = await parseProductPageContent(productContent);
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThan(300); // Check if summary is concise
    });

    test("Empty Content", async () => {
      const productContent = "";
      const expectedOutput = "";
      const result = await parseProductPageContent(productContent);
      expect(result).toEqual(expectedOutput);
    });

    test("Short Content - Empty Summary", async () => {
      const productContent = "Just a title.";
      const expectedOutput = "";
      const result = await parseProductPageContent(productContent);
      expect(result).toEqual(expectedOutput);
    });
  });
});
