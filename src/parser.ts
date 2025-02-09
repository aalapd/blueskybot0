export interface Product {
  title: string;
  link: string;
}

export function parseProducts(markdown: string): Product[] {
  const products: Product[] = [];

  // Split the markdown into blocks by detecting product blocks (each starting with an image markdown).
  const blocks = markdown.split(/(?=!\[Image\s+\d+:\s*)/);

  for (const block of blocks) {
    // Extract the product's website URL from the image markdown's alt text.
    const imageRegex = /!\[Image\s+\d+:\s*(https?:\/\/[^\]]+)\]/;
    const imageMatch = block.match(imageRegex);
    if (!imageMatch) continue;
    const link = imageMatch[1].trim();

    // Extract the product title from the first level-3 heading that follows.
    const titleRegex = /###\s*(.+)/;
    const titleMatch = block.match(titleRegex);
    if (!titleMatch) continue;
    // If the heading spans multiple lines, take only the first line.
    const titleLine = titleMatch[1].split(/\r?\n/)[0].trim();

    products.push({ title: titleLine, link });
  }

  return products;
}
