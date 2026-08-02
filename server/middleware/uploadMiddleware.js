import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/pdf' ||
    file.originalname.toLowerCase().endsWith('.pdf')
  ) {
    cb(null, true);
  } else {
    cb(new Error('INVALID_FILE_TYPE: Only PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
}).single('resume');

export const uploadResumeMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ msg: 'File size limit exceeded. Max file size allowed is 5MB.' });
      }
      if (err.message && err.message.startsWith('INVALID_FILE_TYPE')) {
        return res.status(400).json({ msg: 'Invalid file format. Please upload a PDF file.' });
      }
      return res.status(400).json({ msg: err.message || 'File upload failed.' });
    }
    next();
  });
};
