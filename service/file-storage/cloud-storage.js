import { v2 as cloudinary } from 'cloudinary';
import { promisify } from 'util';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
});

const save = async (cloudFolders, fileBuffer, fileName, ownerId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: null,
        folder: `${cloudFolders}/${ownerId}`,
        filename_override: fileName,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            fileUrl: result.secure_url,
            returnedIdFileCloud: result.public_id,
          });
        }
      },
    );

    uploadStream.end(fileBuffer);
  });
};

const removeFiles = async idFileCloud => {
  const deleteFiles = promisify(cloudinary.uploader.destroy);
  const result = deleteFiles(idFileCloud)
    .then(data => {
      return data;
    })
    .catch(error => {
      console.log(error);
    });
  return result;
};

const removeFolder = async (cloudFolder, idFolderCloud) => {
  const deleteFolder = promisify(cloudinary.api.delete_folder);
  const folderPath = `${cloudFolder}/${idFolderCloud}`;
  const result = deleteFolder(folderPath)
    .then(data => {
      return data;
    })
    .catch(error => {
      console.log(error);
    });
  return result;
};

export default {
  save,
  removeFiles,
  removeFolder,
};
