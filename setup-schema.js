const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Manually load env variables from backend/.env if it exists
const envPath = path.join(__dirname, "backend", ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const index = trimmed.indexOf("=");
      if (index !== -1) {
        const key = trimmed.substring(0, index).trim();
        const value = trimmed.substring(index + 1).trim();
        process.env[key] = value;
      }
    }
  });
}

// Connection URI (Default to local MongoDB)
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = "gearhub";

async function main() {
  const client = new MongoClient(uri);

  try {
    console.log("⏳ Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected successfully to server");

    const db = client.db(dbName);

    // Read Schema JSON files
    const userSchemaData = JSON.parse(fs.readFileSync(path.join(__dirname, "05_mongodb.schema_user.json"), "utf8"));
    const productSchemaData = JSON.parse(fs.readFileSync(path.join(__dirname, "06_mongodb-schema_products.json"), "utf8"));
    const orderSchemaData = JSON.parse(fs.readFileSync(path.join(__dirname, "07_mongodb-shcema_orders.json"), "utf8"));
    const mouseSpecsSchemaData = JSON.parse(fs.readFileSync(path.join(__dirname, "06_mongodb-schema_mouse_specs.json"), "utf8"));
    const keyboardSpecsSchemaData = JSON.parse(fs.readFileSync(path.join(__dirname, "06_mongodb-schema_keyboard_specs.json"), "utf8"));
    const headsetSpecsSchemaData = JSON.parse(fs.readFileSync(path.join(__dirname, "06_mongodb-schema_headset_specs.json"), "utf8"));

    const collections = [
      { name: "users", schema: userSchemaData.schema },
      { name: "products", schema: productSchemaData.schema },
      { name: "orders", schema: orderSchemaData.schema },
      { name: "mouse_specs", schema: mouseSpecsSchemaData.schema },
      { name: "keyboard_specs", schema: keyboardSpecsSchemaData.schema },
      { name: "headset_specs", schema: headsetSpecsSchemaData.schema }
    ];

    for (const col of collections) {
      // Check if collection exists
      const existingCollections = await db.listCollections({ name: col.name }).toArray();
      if (existingCollections.length > 0) {
        console.log(`🗑️ Dropping existing collection: ${col.name}`);
        await db.collection(col.name).drop();
      }

      // Create collection with Schema Validation
      console.log(`📦 Creating collection with schema validation: ${col.name}`);
      await db.createCollection(col.name, {
        validator: {
          $jsonSchema: col.schema
        }
      });
    }

    console.log("\n🎉 Database schema setup completed successfully!");
  } catch (err) {
    console.error("❌ Error during database schema setup:", err);
  } finally {
    await client.close();
    console.log("🔌 Connection closed.");
  }
}

main();
