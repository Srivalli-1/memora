const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const isCloudinaryConfigured = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  return Boolean(
    name &&
    key &&
    secret &&
    !name.includes('YOUR_') &&
    !key.includes('YOUR_') &&
    !secret.includes('YOUR_')
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Upload a single file buffer or local disk path
const uploadImageToCloudinary = async (file, folder = 'memora') => {
  if (!file) return null;

  if (isCloudinaryConfigured()) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `memora/${folder}`,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(new Error(`Cloudinary upload failed: ${error.message}`));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  // Graceful fallback for local development: Save to uploads directory
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = path.extname(file.originalname || '.jpg') || '.jpg';
  const fileName = `${folder}-${uniqueSuffix}${ext}`;
  const filePath = path.join(uploadsDir, fileName);

  fs.writeFileSync(filePath, file.buffer);

  const baseUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
  return {
    url: `${baseUrl}/uploads/${fileName}`,
    publicId: `local_${fileName}`,
    isLocalFallback: true
  };
};

const deleteImageFromCloudinary = async (publicId) => {
  if (!publicId) return;

  if (publicId.startsWith('local_')) {
    const fileName = publicId.replace('local_', '');
    const filePath = path.join(__dirname, '..', 'uploads', fileName);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error deleting local file:', err);
      }
    }
    return;
  }

  if (isCloudinaryConfigured()) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error('Error deleting from Cloudinary:', err);
    }
  }
};

module.exports = {
  isCloudinaryConfigured,
  uploadImageToCloudinary,
  deleteImageFromCloudinary
};
