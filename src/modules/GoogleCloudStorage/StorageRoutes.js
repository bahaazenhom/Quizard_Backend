const express = require('express');
const multer = require('multer');
const storageService = require('./StorageService');

const router = express.Router();

// Configure Multer to use memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only specific file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
    }
  },
});

// Upload single file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const {fileUrl, filename} = await storageService.uploadFile(req.file);
    
    res.status(200).json({
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload multiple files
router.post('/upload-multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadPromises = req.files.map(file => storageService.uploadFile(file));
    const fileUrls = await Promise.all(uploadPromises);

    res.status(200).json({
      message: 'Files uploaded successfully',
      files: fileUrls.map((url, index) => ({
        url,
        filename: req.files[index].originalname,
      })),
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete file
router.delete('/delete/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const result = await storageService.deleteFile(filename);
    res.status(200).json(result);
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get signed URL for private file
router.get('/signed-url/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const expiresIn = parseInt(req.query.expires) || 15; // default 15 minutes
    const url = await storageService.getSignedUrl(filename, expiresIn);
    res.status(200).json({ url });
  } catch (error) {
    console.error('Signed URL error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List all files
router.get('/files', async (req, res) => {
  try {
    const files = await storageService.listFiles();
    res.status(200).json({ files });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// NEW ROUTES FOR FILE RETRIEVAL
// ============================================

// Get specific file metadata
router.get('/file/:filename/metadata', async (req, res) => {
  try {
    const { filename } = req.params;
    const metadata = await storageService.getFileMetadata(filename);
    res.status(200).json(metadata);
  } catch (error) {
    console.error('Get metadata error:', error);
    res.status(404).json({ error: error.message });
  }
});

// Download specific file
router.get('/file/:filename/download', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Check if file exists first
    const exists = await storageService.fileExists(filename);
    if (!exists) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get file metadata to set proper headers
    const metadata = await storageService.getFileMetadata(filename);
    
    // Download file content
    const fileContent = await storageService.downloadFile(filename);
    
    // Set response headers
    res.setHeader('Content-Type', metadata.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', metadata.size);
    
    // Send file
    res.send(fileContent);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stream/view specific file (inline, not download)
router.get('/file/:filename/view', async (req, res) => {
  try {
    const { filename } = req.params;
    
    const exists = await storageService.fileExists(filename);
    if (!exists) {
      return res.status(404).json({ error: 'File not found' });
    }

    const metadata = await storageService.getFileMetadata(filename);
    const fileContent = await storageService.downloadFile(filename);
    
    // Set headers for inline viewing
    res.setHeader('Content-Type', metadata.contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Length', metadata.size);
    
    res.send(fileContent);
  } catch (error) {
    console.error('View error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check if file exists
router.get('/file/:filename/exists', async (req, res) => {
  try {
    const { filename } = req.params;
    const exists = await storageService.fileExists(filename);
    res.status(200).json({ exists, filename });
  } catch (error) {
    console.error('File exists check error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default {router};