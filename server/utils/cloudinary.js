// Lazy / dynamic Cloudinary initialization helper to avoid top-level SDK import errors
let cloudinaryInstance = null;

const getCloudinaryInstance = async () => {
  if (cloudinaryInstance) return cloudinaryInstance;

  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Direct API credentials take priority - delete CLOUDINARY_URL if invalid or redundant
    if (
      cloudName &&
      apiKey &&
      apiSecret &&
      !apiKey.includes('<') &&
      !apiSecret.includes('<')
    ) {
      delete process.env.CLOUDINARY_URL;
    } else if (process.env.CLOUDINARY_URL) {
      const url = process.env.CLOUDINARY_URL;
      if (
        typeof url !== 'string' ||
        !url.startsWith('cloudinary://') ||
        url.includes('<') ||
        url.includes('>')
      ) {
        delete process.env.CLOUDINARY_URL;
      }
    }

    // Dynamic import to prevent Cloudinary SDK from executing module-level checks during static import phase
    const { v2: cloudinary } = await import('cloudinary');

    if (
      cloudName &&
      apiKey &&
      apiSecret &&
      !apiKey.includes('<') &&
      !apiSecret.includes('<')
    ) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      cloudinaryInstance = cloudinary;
      return cloudinaryInstance;
    }

    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (
      cloudinaryUrl &&
      typeof cloudinaryUrl === 'string' &&
      cloudinaryUrl.startsWith('cloudinary://')
    ) {
      cloudinary.config({
        cloudinary_url: cloudinaryUrl,
        secure: true,
      });
      cloudinaryInstance = cloudinary;
      return cloudinaryInstance;
    }
  } catch (err) {
    console.warn('Cloudinary initialization warning:', err.message);
  }

  return null;
};

export const configureCloudinary = async () => {
  try {
    const instance = await getCloudinaryInstance();
    return !!instance;
  } catch (err) {
    console.warn('Cloudinary configuration failed:', err.message);
    return false;
  }
};

export const uploadToCloudinary = async (fileBuffer, originalName) => {
  let cloudinary = null;
  try {
    cloudinary = await getCloudinaryInstance();
  } catch (err) {
    console.warn('Error obtaining Cloudinary instance:', err.message);
  }

  if (!cloudinary) {
    console.warn('Cloudinary environment variables missing or invalid. Falling back to local Data URI representation.');
    const base64 = fileBuffer.toString('base64');
    const dataUri = `data:application/pdf;base64,${base64}`;
    const mockPublicId = `resume_demo_${Date.now()}`;
    return {
      secure_url: dataUri,
      public_id: mockPublicId,
    };
  }

  const sanitizedName = (originalName || 'resume.pdf')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/\.pdf$/i, '');

  return new Promise((resolve) => {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'job_tracker_resumes',
          resource_type: 'raw',
          public_id: `${Date.now()}_${sanitizedName}`,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload stream error:', error);
            const base64 = fileBuffer.toString('base64');
            const dataUri = `data:application/pdf;base64,${base64}`;
            const mockPublicId = `resume_demo_${Date.now()}`;
            return resolve({
              secure_url: dataUri,
              public_id: mockPublicId,
            });
          }
          resolve(result);
        }
      );

      uploadStream.end(fileBuffer);
    } catch (err) {
      console.error('Cloudinary stream instantiation error:', err.message);
      const base64 = fileBuffer.toString('base64');
      const dataUri = `data:application/pdf;base64,${base64}`;
      const mockPublicId = `resume_demo_${Date.now()}`;
      return resolve({
        secure_url: dataUri,
        public_id: mockPublicId,
      });
    }
  });
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId || publicId.startsWith('resume_demo_')) return;

  try {
    const cloudinary = await getCloudinaryInstance();
    if (!cloudinary) {
      console.warn('Cloudinary credentials missing or invalid. Skipping delete request.');
      return;
    }

    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  } catch (error) {
    console.error('Cloudinary destruction error:', error.message);
  }
};
