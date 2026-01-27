const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Function to create storage with dynamic destination
const createStorage = (subfolder = '') => {
  const baseUploadDir = 'src/uploads/';
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: function (req, file, cb) {
      let dest = baseUploadDir;
      if (subfolder) {
        dest = path.join(baseUploadDir, subfolder);
      }
      
      // Ensure the specific destination exists
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      cb(null, dest);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
};

// Default upload (root /uploads)
const upload = multer({ storage: createStorage() });

// Specialized uploads
upload.category = multer({ storage: createStorage('categories') });
upload.image = multer({ storage: createStorage('images') });

module.exports = upload;
