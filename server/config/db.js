import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore DNS setServers error if environment restricts it
}

let lastAttemptTime = 0;
let lastError = null;
let lastUri = null;

export const formatMongoUri = (rawUrl) => {
  if (!rawUrl) return rawUrl;
  let url = rawUrl;
  
  // Auto-correct outdated cluster domain from README/old config if present
  if (url.includes('m99zx7f')) {
    url = url.replace('m99zx7f', 'zyrq0ei');
  }

  try {
    const protocolMatch = url.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
    if (protocolMatch) {
      const protocol = protocolMatch[1];
      const rest = protocolMatch[2];
      
      const atIndex = rest.lastIndexOf('@');
      if (atIndex !== -1) {
        const credentials = rest.substring(0, atIndex);
        const hostAndRest = rest.substring(atIndex + 1);
        
        const colonIndex = credentials.indexOf(':');
        if (colonIndex !== -1) {
          const username = credentials.substring(0, colonIndex);
          const rawPassword = credentials.substring(colonIndex + 1);
          
          const decodedPassword = decodeURIComponent(rawPassword);
          const encodedPassword = encodeURIComponent(decodedPassword);
          
          return `${protocol}${username}:${encodedPassword}@${hostAndRest}`;
        }
      }
    }
  } catch (err) {
    console.warn('Could not parse or format MONGO_URI:', err);
  }
  return url;
};

const connectDB = async (url) => {
  if (!url || !url.trim()) {
    return false;
  }

  // Reset error/throttling state if connection URI has changed
  if (url !== lastUri) {
    lastError = null;
    lastAttemptTime = 0;
    lastUri = url;
  }

  // Throttling: If we tried within the last 15 seconds and failed, don't spam connection attempts
  const now = Date.now();
  if (now - lastAttemptTime < 15000 && lastError) {
    return false;
  }
  lastAttemptTime = now;
  
  mongoose.set('strictQuery', true);
  const formattedUrl = formatMongoUri(url);

  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch (e) {
    // Ignore DNS setServers error if environment restricts it
  }

  try {
    await mongoose.connect(formattedUrl, {
      serverSelectionTimeoutMS: 5000,
    });
    lastError = null;
    console.log('MongoDB connection established successfully.');
    return true;
  } catch (err) {
    lastError = err;
    console.log('[Database] Status: Offline (Waiting for valid MONGO_URI in Settings > Secrets)');
    return false;
  }
};

export default connectDB;
