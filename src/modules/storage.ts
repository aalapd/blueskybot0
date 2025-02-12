// src/storage.ts
import { MongoClient, Db, Collection } from 'mongodb';

export interface StoredProduct {
  product_title: string;
  product_url: string;
  scrapedAt: string; 
  posted: boolean;
}

require('dotenv').config();

const dbName = process.env.MONGODB_DBNAME;
const collectionName = process.env.MONGODB_COLLNAME;
const uri = process.env.MONGODB_URI;

let client: MongoClient | null = null;

/**
 * Connects to MongoDB and returns the products collection.
 * Also ensures that a unique index is created on product_url.
 */
export async function getProducts(): Promise<Collection<StoredProduct>> {
  if (!client) {
    client = new MongoClient(uri, {
      serverApi: { version: "1", strict: true, deprecationErrors: true },
    });
    await client.connect();
    console.log("Connected to MongoDB Atlas.");
  }
  const db: Db = client.db(dbName);
  const collection: Collection<StoredProduct> = db.collection(collectionName);
  // Create a unique index on product_url to enforce uniqueness and improve query speed.
  await collection.createIndex({ product_url: 1 }, { unique: true });
  return collection;
}

/**
 * Saves new products to MongoDB Atlas.
 * Each new product should have a product_title and product_url.
 * A product is only inserted if no document exists with the same product_url or product_title.
 * For each inserted product, the current timestamp (scrapedAt) is added, and posted is set to false.
 */
export async function saveProducts(newProducts: { product_title: string; product_url: string }[]): Promise<void> {
  try {
    const collection = await getProducts();
    let insertedCount = 0;
    for (const newProd of newProducts) {
      // Check if the product already exists using product_url or product_title.
      const exists = await collection.findOne({
        $or: [
          { product_url: newProd.product_url },
          { product_title: newProd.product_title }
        ]
      });
      if (!exists) {
        await collection.insertOne({
          product_title: newProd.product_title,
          product_url: newProd.product_url,
          scrapedAt: new Date().toISOString(),
          posted: false,
        });
        insertedCount++;
      }
    }
    console.log(`Inserted ${insertedCount} new products into MongoDB.`);
  } catch (error) {
    console.error("Error saving products to MongoDB:", error);
    throw error;
  }
}

/**
 * Marks a product as posted by updating its document in MongoDB.
 * @param productUrl - The product URL to mark as posted.
 */
export async function markProductAsPosted(productUrl: string): Promise<void> {
  try {
    const collection = await getProducts();
    const result = await collection.updateOne(
      { product_url: productUrl },
      { $set: { posted: true } }
    );
    if (result.modifiedCount > 0) {
      console.log(`Product ${productUrl} marked as posted.`);
    } else {
      console.log(`Product ${productUrl} was not found or already marked as posted.`);
    }
  } catch (error) {
    console.error("Error marking product as posted:", error);
    throw error;
  }
}

/**
 * Closes the MongoDB client connection if it's open.
 */
export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
    console.log("MongoDB connection closed.");
    client = null;
  }
}
