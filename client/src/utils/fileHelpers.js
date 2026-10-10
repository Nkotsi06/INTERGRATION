export const validateFileType = (file, allowedTypes) => {
  const extension = file.name.split('.').pop().toLowerCase();
  const allowed = allowedTypes.split(',').map((t) => t.trim().toLowerCase());
  return allowed.includes(extension);
};

export const validateFileSize = (file, maxSizeMb) => {
  const maxBytes = maxSizeMb * 1024 * 1024;
  return file.size <= maxBytes;
};

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};