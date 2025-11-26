const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI not set in .env");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

const cartItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CartItem = mongoose.model("CartItem", cartItemSchema);

app.get("/api/cart/:userId", async (req, res) => {
  try {
    const items = await CartItem.find({ userId: req.params.userId }).populate("productId");
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/cart", async (req, res) => {
  try {
    const { userId, productId, quantity, price } = req.body;

    const existingItem = await CartItem.findOne({ userId, productId });
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.updatedAt = Date.now();
      await existingItem.save();
      return res.json(existingItem);
    }

    const item = new CartItem({ userId, productId, quantity, price });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/cart/:id", async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await CartItem.findByIdAndUpdate(
      req.params.id,
      { quantity, updatedAt: Date.now() },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Cart item not found" });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/cart/:id", async (req, res) => {
  try {
    const item = await CartItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Cart item not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/cart/user/:userId", async (req, res) => {
  try {
    await CartItem.deleteMany({ userId: req.params.userId });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Cart service running on port ${PORT}`);
});
