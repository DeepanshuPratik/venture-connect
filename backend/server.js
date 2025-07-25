require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = [
  'http://localhost:3000', // Your local React dev server
  'https://venture-connect.deepanshupratik.in' // Your deployed frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  optionsSuccessStatus: 200
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

app.post('/upload-avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'Please upload a file.' });
  }

  // Construct the full URL for the uploaded file
  const fileUrl = `${process.env.SERVER_BASE_URL || `http://localhost:${PORT}`}/uploads/${req.file.filename}`;

  // Send the URL back to the React client
  res.status(200).send({
    message: 'Avatar uploaded successfully!',
    photoURL: fileUrl,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});
