import { Request, Response } from "express";
import multer, { Multer } from "multer";
import axios from "axios";
import FormData from "form-data";

const router = require("express").Router();

const upload: Multer = multer({ storage: multer.memoryStorage() });


interface ImageResponse {
  data: {link: string}
}
/**
 * Helper function to upload image to Imgur API 
 * @param imageBuffer Buffer containing the bytes of the uploaded image
 * @param fileName The name of the file 
 * @returns The url for the uploaded image
 */
async function uploadImage(imageBuffer: Buffer, fileName: string): Promise<string> {
  const formData = new FormData();
  formData.append("image", imageBuffer, {
    filename: `${fileName}.png`,
    contentType: "image/png",
  });

  try {
    const response = await axios.post<ImageResponse>(
      "https://api.imgur.com/3/image",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Client-ID ${process.env.IMGUR_CLIENTID}`,
        },
      }
    );
    return response.data.data.link;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

/**
 * Creates a URL of a photo uploaded
 * @param {File} image The file containing the photo's information (used in middleware as 'image')
 * @param {String} fileName The name of the file
 */
router.route("/").post(upload.single("image"), async (req: Request, res: Response) => {
  const { filename } = req.body;
  try {
    if (!req.file) {
      throw new Error("No file uploaded");
    }
    const imageUrl: string = await uploadImage(req.file.buffer, filename);
    res.json({ imageUrl });
  } catch (error) {
    console.error("Failed to upload image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router
