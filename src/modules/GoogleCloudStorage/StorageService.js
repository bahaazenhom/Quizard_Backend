import dotenv from "dotenv";
import { Storage } from "@google-cloud/storage";
dotenv.config();

// Initialize Google Cloud Storage (lazy initialization)
let storage = null;
let bucket = null;

const initializeStorage = () => {
  if (
    !storage &&
    process.env.GCS_BUCKET_NAME &&
    process.env.GOOGLE_CLOUD_PROJECT_ID
  ) {
    storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    });
    bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
  }
  return bucket;
};

export class StorageService {
  /**
   * Upload file to Google Cloud Storage
   * @param {Object} file - Multer file object
   * @returns {Promise<string>} - Public URL of uploaded file
   */
  async uploadFile(file) {
    try {
      const bucket = initializeStorage();
      if (!bucket) {
        throw new Error(
          "Google Cloud Storage is not configured. Please set GCS_BUCKET_NAME and GOOGLE_CLOUD_PROJECT_ID environment variables."
        );
      }

      // Create a unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.originalname}`
        .replace(/\s+/g, "-")
        .toLowerCase();

      const blob = bucket.file(filename);
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: file.mimetype,
        },
      });

      return new Promise((resolve, reject) => {
        blobStream.on("error", (err) => {
          reject(err);
        });

        blobStream.on("finish", async () => {
          // Generate public URL
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          resolve({
            fileName: file.originalname,
            fileUrl: publicUrl,
            fileType: file.mimetype,
            fullName: filename,
          });
        });

        blobStream.end(file.buffer);
      });
    } catch (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }
  }

  /**
   * Delete file from Google Cloud Storage
   * @param {string} filename - Name of file to delete
   */
  async deleteFile(filename) {
    try {
      const bucket = initializeStorage();
      if (!bucket) {
        throw new Error("Google Cloud Storage is not configured.");
      }
      await bucket.file(filename).delete();
      return { message: "File deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  }

  /**
   * Get signed URL for private file access
   * @param {string} filename - Name of file
   * @param {number} expiresIn - Expiration time in minutes (default: 15)
   */
  async getSignedUrl(filename, expiresIn = 15) {
    try {
      const bucket = initializeStorage();
      if (!bucket) {
        throw new Error("Google Cloud Storage is not configured.");
      }
      const options = {
        version: "v4",
        action: "read",
        expires: Date.now() + expiresIn * 60 * 1000,
      };

      const [url] = await bucket.file(filename).getSignedUrl(options);
      return url;
    } catch (error) {
      throw new Error(`Error generating signed URL: ${error.message}`);
    }
  }

  /**
   * Get file metadata
   * @param {string} filename - Name of file
   */
  async getFileMetadata(filename) {
    try {
      const bucket = initializeStorage();
      if (!bucket) {
        throw new Error("Google Cloud Storage is not configured.");
      }
      const file = bucket.file(filename);
      const [metadata] = await file.getMetadata();

      return {
        name: metadata.name,
        bucket: metadata.bucket,
        size: metadata.size,
        contentType: metadata.contentType,
        created: metadata.timeCreated,
        updated: metadata.updated,
        md5Hash: metadata.md5Hash,
        publicUrl: `https://storage.googleapis.com/${bucket.name}/${metadata.name}`,
      };
    } catch (error) {
      throw new Error(`Error getting file metadata: ${error.message}`);
    }
  }

  /**
   * Download file content
   * @param {string} filename - Name of file to download
   * @returns {Promise<Buffer>} - File content as buffer
   */
  async downloadFile(filename) {
    try {
      const bucket = initializeStorage();
      if (!bucket) {
        throw new Error("Google Cloud Storage is not configured.");
      }
      const file = bucket.file(filename);
      const [contents] = await file.download();
      return contents;
    } catch (error) {
      throw new Error(`Error downloading file: ${error.message}`);
    }
  }

  /**
   * Check if file exists
   * @param {string} filename - Name of file
   */
  async fileExists(filename) {
    try {
      const bucket = initializeStorage();
      if (!bucket) {
        throw new Error("Google Cloud Storage is not configured.");
      }
      const file = bucket.file(filename);
      const [exists] = await file.exists();
      return exists;
    } catch (error) {
      throw new Error(`Error checking file existence: ${error.message}`);
    }
  }

  /**
   * List all files in bucket
   */
  async listFiles() {
    try {
      const bucket = initializeStorage();
      if (!bucket) {
        throw new Error("Google Cloud Storage is not configured.");
      }
      const [files] = await bucket.getFiles();
      return files.map((file) => ({
        name: file.name,
        size: file.metadata.size,
        contentType: file.metadata.contentType,
        created: file.metadata.timeCreated,
        updated: file.metadata.updated,
      }));
    } catch (error) {
      throw new Error(`Error listing files: ${error.message}`);
    }
  }
}
