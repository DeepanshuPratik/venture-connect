require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;

// --- Explicit CORS Configuration ---
const corsOptions = {
  // Allow requests only from your React app's origin
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // For older browsers
};

app.use(cors(corsOptions)); // Use the explicit options

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- API Endpoint for File Upload ---
app.post('/upload', upload.single('media'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'Please upload a file.' });
  }

  const fileUrl = `${process.env.SERVER_BASE_URL || `http://localhost:${PORT}`}/uploads/${req.file.filename}`;

  res.status(200).send({
    message: 'File uploaded successfully!',
    mediaUrl: fileUrl,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});
