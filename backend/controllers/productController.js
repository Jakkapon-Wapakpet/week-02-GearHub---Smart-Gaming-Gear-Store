const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

// Helper function to populate specifications from separate collections
async function populateSpecs(db, products) {
  if (!products) return null;
  const isArray = Array.isArray(products);
  const list = isArray ? products : [products];

  for (const product of list) {
    let collectionName = '';
    if (product.category === 'Mouse') {
      collectionName = 'mouse_specs';
    } else if (product.category === 'Keyboard') {
      collectionName = 'keyboard_specs';
    } else if (product.category === 'Headset') {
      collectionName = 'headset_specs';
    }

    if (collectionName) {
      const specs = await db.collection(collectionName).findOne({ productId: product._id });
      if (specs) {
        const { _id, productId, ...specDetails } = specs;
        product.specifications = specDetails;
      } else {
        product.specifications = {};
      }
    } else {
      product.specifications = {};
    }
  }

  return isArray ? list : list[0];
}

// @desc    Get all products (with optional filtering by category and search)
// @route   GET /api/products
// @access  Public
async function getProducts(req, res) {
  try {
    const db = getDB();
    const productsCollection = db.collection('products');

    const { category, search } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await productsCollection.find(filter).toArray();
    const populatedProducts = await populateSpecs(db, products);
    res.json(populatedProducts);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
async function getProductById(req, res) {
  try {
    const db = getDB();
    const productsCollection = db.collection('products');

    const product = await productsCollection.findOne({ _id: new ObjectId(req.params.id) });

    if (product) {
      const populatedProduct = await populateSpecs(db, product);
      res.json(populatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(500).json({ message: "Invalid ID or server error" });
  }
}

// @desc    Compare products (up to 3 products)
// @route   GET /api/products/compare
// @access  Public
async function getCompareProducts(req, res) {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({ message: "No product IDs provided" });
    }

    const idList = ids.split(',').map(id => new ObjectId(id.trim()));

    if (idList.length > 3) {
      return res.status(400).json({ message: "You can compare up to 3 products only" });
    }

    const db = getDB();
    const productsCollection = db.collection('products');

    const products = await productsCollection.find({ _id: { $in: idList } }).toArray();
    const populatedProducts = await populateSpecs(db, products);

    res.json(populatedProducts);
  } catch (error) {
    console.error("Compare products error:", error);
    res.status(500).json({ message: "Invalid product IDs or server error" });
  }
}

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
async function createProduct(req, res) {
  const { name, description, category, price, stock, images, specifications, tags } = req.body;

  if (!name || !category || price === undefined || stock === undefined || !specifications) {
    return res.status(400).json({ message: "Please fill in all required fields" });
  }

  try {
    const db = getDB();
    const productsCollection = db.collection('products');

    const newProduct = {
      name,
      description: description || "",
      category,
      price: Number(price),
      stock: Number(stock),
      images: images || [],
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await productsCollection.insertOne(newProduct);
    const productId = result.insertedId;

    let specsCollectionName = '';
    if (category === 'Mouse') {
      specsCollectionName = 'mouse_specs';
    } else if (category === 'Keyboard') {
      specsCollectionName = 'keyboard_specs';
    } else if (category === 'Headset') {
      specsCollectionName = 'headset_specs';
    }

    if (specsCollectionName && specifications) {
      await db.collection(specsCollectionName).insertOne({
        productId,
        ...specifications
      });
    }

    const createdProduct = await productsCollection.findOne({ _id: productId });
    const populatedProduct = await populateSpecs(db, createdProduct);

    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(400).json({ message: error.message || "Failed to create product" });
  }
}

module.exports = { getProducts, getProductById, getCompareProducts, createProduct };
