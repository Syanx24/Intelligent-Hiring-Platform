import { v2 as cloudinary } from "cloudinary";

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

cloudinary.config(cloudinaryConfig);

export function isCloudinaryConfigured() {
  return Object.values(cloudinaryConfig).every(Boolean);
}

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
}

export function uploadCloudinaryImage(buffer, { publicId, folder }) {
  return uploadBuffer(buffer, {
    resource_type: "image",
    folder,
    public_id: publicId,
    overwrite: true,
    invalidate: true,
  });
}

export function uploadCloudinaryPdf(buffer, { publicId, folder }) {
  return uploadBuffer(buffer, {
    resource_type: "raw",
    folder,
    public_id: publicId,
    overwrite: true,
    invalidate: true,
  });
}

export async function deleteCloudinaryAsset(url, resourceType) {
  if (!url || !url.includes("res.cloudinary.com/")) return;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  if (!match) return;

  const publicId = decodeURIComponent(match[1]);
  const resourcePublicId = resourceType === "raw" ? publicId : publicId.replace(/\.[^.\/]+$/, "");
  const result = await cloudinary.uploader.destroy(resourcePublicId, {
    resource_type: resourceType,
    invalidate: true,
  });
  if (!["ok", "not found"].includes(result.result)) {
    throw new Error("Could not remove the file from Cloudinary.");
  }
}

export default cloudinary;
