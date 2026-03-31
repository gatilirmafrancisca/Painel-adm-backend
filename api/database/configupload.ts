import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Configuração com as suas credenciais do Cloudinary (.env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Usando MemoryStorage em vez de DiskStorage por causa do Vercel
const storage = multer.memoryStorage();
export const upload = multer({ storage });
export { cloudinary };