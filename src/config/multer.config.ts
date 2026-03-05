import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";
import multer from "multer";

const storage = new CloudinaryStorage({
    cloudinary : cloudinaryUpload,
    params : async (req, file) => {
      const originalName = file.originalname;
      const extension = originalName.split('.').pop()?.toLocaleLowerCase();

      const fileNameWithoutExtension = originalName
        .split('.')
        .slice(0, -1)
        .join('.')
        .toLocaleLowerCase()
        .replace(/\s+/g, "-")
        // eslint-disable-next-line no-useless-escape
        .replace(/[^a-z0-9\-]/g, "");

        const uniqeName = 
          Math.random().toString(36).substring(2)+
          "-"+
          Date.now()+
          "-"+
          fileNameWithoutExtension;

        const folder = extension === "pdf" ? "pdfs" : "images";

        return {
          folder : `ph-healthcare/${folder}`,
          public_id : uniqeName,
          resource_type : extension === "auto",
        }
    }
})

export const multerUpload = multer({storage});