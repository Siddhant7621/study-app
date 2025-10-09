import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import Book from "../models/Book.js";
import { extractTextFromPDF } from "../services/pdfService.js";
import { authMiddleware } from "../middleware/auth.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Upload PDF to Cloudinary
router.post("/", authMiddleware, upload.single("pdf"), async (req, res) => {
  let cloudinaryResult = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("📤 Uploading to Cloudinary...");

    // Upload to Cloudinary with explicit PDF settings
    cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "raw", // Use 'raw' for PDF files
      type: "authenticated", // Try 'authenticated' if 'upload' doesn't work
      folder: "study-app/books",
      use_filename: true,
      unique_filename: true,
      access_mode: "public",
      allowed_formats: ["pdf"], // Explicitly allow PDF format
      quality: "auto", // For potential optimization
      flags: "attachment", // Optional: force download behavior
    });

    console.log(
      "✅ Cloudinary upload successful:",
      cloudinaryResult.secure_url
    );

    // Extract text from PDF
    const textContent = await extractTextFromPDF(req.file.path);

    // Get the original filename without extension
    const originalName = req.file.originalname.replace(".pdf", "");

    // Save book to database
    const book = new Book({
      title: req.body.title || originalName,
      originalName: req.file.originalname,
      filename: req.file.filename,
      filePath: req.file.path,
      cloudinaryId: cloudinaryResult.public_id,
      fileUrl: cloudinaryResult.secure_url,
      fileSize: req.file.size,
      textContent: textContent,
      uploadedBy: req.user._id,
    });

    await book.save();

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { uploadedBooks: book._id },
    });

    // Clean up local file
    try {
      fs.unlinkSync(req.file.path);
      console.log("🧹 Local file cleaned up");
    } catch (cleanupError) {
      console.warn("⚠️ Could not delete local file:", cleanupError.message);
    }

    res.json({
      success: true,
      book: {
        id: book._id,
        title: book.title,
        fileUrl: book.fileUrl,
        fileSize: book.fileSize,
        uploadDate: book.uploadDate,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);

    // More specific error handling for Cloudinary
    if (
      error.message.includes("Format") ||
      error.message.includes("not allowed")
    ) {
      return res.status(400).json({
        error:
          "PDF files are not allowed by your Cloudinary configuration. Please check your security settings.",
      });
    }

    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Delete book route
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Check if user owns the book
    if (book.uploadedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this book" });
    }

    // Delete from Cloudinary if cloudinaryId exists
    if (book.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(book.cloudinaryId);
        console.log("✅ Cloudinary file deleted:", book.cloudinaryId);
      } catch (cloudinaryError) {
        console.error("Failed to delete from Cloudinary:", cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Clean up local file if it exists
    if (book.filePath && fs.existsSync(book.filePath)) {
      try {
        fs.unlinkSync(book.filePath);
        console.log("✅ Local file deleted:", book.filePath);
      } catch (fileError) {
        console.warn("Could not delete local file:", fileError.message);
      }
    }

    // Delete from database
    await Book.findByIdAndDelete(req.params.id);

    // Remove from user's uploaded books
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { uploadedBooks: req.params.id },
    });

    res.json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

// Get all books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find()
      .populate("uploadedBy", "name email")
      .sort({ uploadDate: -1 });

    res.json(books);
  } catch (error) {
    console.error("Fetch books error:", error);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// Get single book
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate(
      "uploadedBy",
      "name email"
    );

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    console.error("Fetch book error:", error);
    res.status(500).json({ error: "Failed to fetch book" });
  }
});

export default router;
