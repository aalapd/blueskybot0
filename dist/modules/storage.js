var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// src/storage.ts
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
const dbName = process.env.MONGODB_DBNAME;
const collectionName = process.env.MONGODB_COLLNAME;
const uri = process.env.MONGODB_URI;
let client = null;
/**
 * Connects to MongoDB and returns the products collection.
 * Also ensures that a unique index is created on product_url.
 */
export function getProducts() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!client) {
            client = new MongoClient(uri, {
                serverApi: { version: "1", strict: true, deprecationErrors: true },
            });
            yield client.connect();
            console.log("Connected to MongoDB Atlas.");
        }
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        // Create a unique index on product_url to enforce uniqueness and improve query speed.
        yield collection.createIndex({ product_url: 1 }, { unique: true });
        return collection;
    });
}
/**
 * Saves new products to MongoDB Atlas.
 * Each new product should have a product_title and product_url.
 * A product is only inserted if no document exists with the same product_url or product_title.
 * For each inserted product, the current timestamp (scrapedAt) is added, and posted is set to false.
 */
export function saveProducts(newProducts) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const collection = yield getProducts();
            let insertedCount = 0;
            for (const newProd of newProducts) {
                // Check if the product already exists using product_url or product_title.
                const exists = yield collection.findOne({
                    $or: [
                        { product_url: newProd.product_url },
                        { product_title: newProd.product_title }
                    ]
                });
                if (!exists) {
                    yield collection.insertOne({
                        product_title: newProd.product_title,
                        product_url: newProd.product_url,
                        scrapedAt: new Date().toISOString(),
                        posted: false,
                    });
                    insertedCount++;
                }
            }
            console.log(`Inserted ${insertedCount} new products into MongoDB.`);
        }
        catch (error) {
            console.error("Error saving products to MongoDB:", error);
            throw error;
        }
    });
}
/**
 * Marks a product as posted by updating its document in MongoDB.
 * @param productUrl - The product URL to mark as posted.
 */
export function markProductAsPosted(productUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const collection = yield getProducts();
            const result = yield collection.updateOne({ product_url: productUrl }, { $set: { posted: true } });
            if (result.modifiedCount > 0) {
                console.log(`Product ${productUrl} marked as posted.`);
            }
            else {
                console.log(`Product ${productUrl} was not found or already marked as posted.`);
            }
        }
        catch (error) {
            console.error("Error marking product as posted:", error);
            throw error;
        }
    });
}
/**
 * Closes the MongoDB client connection if it's open.
 */
export function closeDatabaseConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        if (client) {
            yield client.close();
            console.log("MongoDB connection closed.");
            client = null;
        }
    });
}
