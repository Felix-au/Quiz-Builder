
const IMGBB_API_KEY = 'f8c9a7a35313f80eccff2b56863b002d';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

export const uploadImageToImgBB = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('key', IMGBB_API_KEY);
  formData.append('image', file);

  try {
    const response = await fetch(IMGBB_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error('Failed to upload image to ImgBB');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const downloadImageAsFile = async (url: string, originalFileName: string): Promise<File> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    return new File([blob], originalFileName, { type: blob.type });
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
};
