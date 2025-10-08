import express from 'express';
import axios from 'axios';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;

    

