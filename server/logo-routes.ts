import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for logo uploads
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public');
    
    // Ensure the public directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Always save as logo.png to replace the existing one
    const ext = path.extname(file.originalname);
    cb(null, `logo${ext}`);
  }
});

const uploadLogo = multer({
  storage: logoStorage,
  fileFilter: (req, file, cb) => {
    // Allow PNG, JPG, JPEG, SVG
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, JPEG, and SVG files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Upload logo endpoint
router.post('/upload', uploadLogo.single('logo'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const logoUrl = `/logo${path.extname(req.file.filename)}`;
    
    // Return the URL with a cache-busting timestamp
    res.json({
      message: 'Logo uploaded successfully',
      logoUrl: `${logoUrl}?v=${Date.now()}`,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

// Get current logo info
router.get('/info', (req: Request, res: Response) => {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const logoExtensions = ['.png', '.jpg', '.jpeg', '.svg'];
    
    let logoFile = null;
    let logoPath = null;
    
    // Check for existing logo files
    for (const ext of logoExtensions) {
      const filePath = path.join(publicDir, `logo${ext}`);
      if (fs.existsSync(filePath)) {
        logoFile = `logo${ext}`;
        logoPath = `/logo${ext}`;
        break;
      }
    }
    
    if (logoFile) {
      const stats = fs.statSync(path.join(publicDir, logoFile));
      res.json({
        exists: true,
        logoUrl: `${logoPath}?v=${Date.now()}`,
        filename: logoFile,
        size: stats.size,
        lastModified: stats.mtime
      });
    } else {
      res.json({
        exists: false,
        logoUrl: null
      });
    }
  } catch (error) {
    console.error('Error getting logo info:', error);
    res.status(500).json({ error: 'Failed to get logo info' });
  }
});

// Delete logo endpoint
router.delete('/delete', (req: Request, res: Response) => {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const logoExtensions = ['.png', '.jpg', '.jpeg', '.svg'];
    
    let deletedFiles = 0;
    
    // Remove all logo files
    for (const ext of logoExtensions) {
      const filePath = path.join(publicDir, `logo${ext}`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        deletedFiles++;
      }
    }
    
    res.json({
      message: `Deleted ${deletedFiles} logo file(s)`,
      deletedFiles
    });
  } catch (error) {
    console.error('Error deleting logo:', error);
    res.status(500).json({ error: 'Failed to delete logo' });
  }
});

export default router;