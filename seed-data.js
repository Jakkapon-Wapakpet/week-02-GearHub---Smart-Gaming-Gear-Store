const { MongoClient, ObjectId } = require("mongodb");
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

// Helper function to recursively map JSON {"$oid": "..."} objects to MongoDB ObjectIds
function mapOids(obj) {
  if (!obj || typeof obj !== "object") return obj;
  
  if (obj.$oid && typeof obj.$oid === "string") {
    return new ObjectId(obj.$oid);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(mapOids);
  }
  
  const mapped = {};
  for (const key in obj) {
    mapped[key] = mapOids(obj[key]);
  }
  return mapped;
}

async function main() {
  const client = new MongoClient(uri);

  try {
    console.log("⏳ Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected successfully to server");

    const db = client.db(dbName);

    // --- CLEAN EXISTING DATA ---
    console.log("🧹 Cleaning existing data (keeping schemas intact)...");
    await db.collection("users").deleteMany({});
    await db.collection("products").deleteMany({});
    await db.collection("orders").deleteMany({});
    await db.collection("mouse_specs").deleteMany({});
    await db.collection("keyboard_specs").deleteMany({});
    await db.collection("headset_specs").deleteMany({});

    // --- READ MOCK DATA FROM EXAMPLE JSON FILES ---
    console.log("📖 Reading mock data from example JSON files...");
    const rawUsers = JSON.parse(fs.readFileSync(path.join(__dirname, "05_mongodb.example_user.json"), "utf8"));
    const rawProducts = JSON.parse(fs.readFileSync(path.join(__dirname, "06_mongodb-example_products.json"), "utf8"));
    const rawOrders = JSON.parse(fs.readFileSync(path.join(__dirname, "07_mongodb-example_orders.json"), "utf8"));
    const rawMouseSpecs = JSON.parse(fs.readFileSync(path.join(__dirname, "06_mongodb-example_mouse_specs.json"), "utf8"));
    const rawKeyboardSpecs = JSON.parse(fs.readFileSync(path.join(__dirname, "06_mongodb-example_keyboard_specs.json"), "utf8"));
    const rawHeadsetSpecs = JSON.parse(fs.readFileSync(path.join(__dirname, "06_mongodb-example_headset_specs.json"), "utf8"));

    // --- PREPARE DATA (Converting string IDs to ObjectIds and adding Timestamps) ---
    const users = rawUsers.map(u => ({
      ...mapOids(u),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const products = rawProducts.map(p => ({
      ...mapOids(p),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const orders = rawOrders.map(o => ({
      ...mapOids(o),
      orderDate: new Date(),
      updatedAt: new Date()
    }));

    const mouseSpecs = rawMouseSpecs.map(s => ({
      ...mapOids(s)
    }));

    const keyboardSpecs = rawKeyboardSpecs.map(s => ({
      ...mapOids(s)
    }));

    const headsetSpecs = rawHeadsetSpecs.map(s => ({
      ...mapOids(s)
    }));

    // --- SEED DATA ---
    console.log("🌱 Seeding data...");

    const userInsertResult = await db.collection("users").insertMany(users);
    console.log(`✅ Seeded ${userInsertResult.insertedCount} users.`);

    const productInsertResult = await db.collection("products").insertMany(products);
    console.log(`✅ Seeded ${productInsertResult.insertedCount} products.`);

    const orderInsertResult = await db.collection("orders").insertMany(orders);
    console.log(`✅ Seeded ${orderInsertResult.insertedCount} orders.`);

    if (mouseSpecs.length > 0) {
      const mouseSpecsInsertResult = await db.collection("mouse_specs").insertMany(mouseSpecs);
      console.log(`✅ Seeded ${mouseSpecsInsertResult.insertedCount} mouse specifications.`);
    }

    if (keyboardSpecs.length > 0) {
      const keyboardSpecsInsertResult = await db.collection("keyboard_specs").insertMany(keyboardSpecs);
      console.log(`✅ Seeded ${keyboardSpecsInsertResult.insertedCount} keyboard specifications.`);
    }

    if (headsetSpecs.length > 0) {
      const headsetSpecsInsertResult = await db.collection("headset_specs").insertMany(headsetSpecs);
      console.log(`✅ Seeded ${headsetSpecsInsertResult.insertedCount} headset specifications.`);
    }

    console.log("\n🎉 Database seeding completed successfully!");
  } catch (err) {
    console.error("❌ Error during database seed:", err);
  } finally {
    await client.close();
    console.log("🔌 Connection closed.");
  }
}

main();
