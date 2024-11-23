export function formatFileName(fileName: string, maxLength: number = 20): string {
  if (fileName.length <= maxLength) return fileName;

  const extension = fileName.split('.').pop() || '';
  const nameWithoutExt = fileName.slice(0, fileName.lastIndexOf('.'));
  
  if (nameWithoutExt.length <= maxLength - 4) return fileName;

  const truncatedName = nameWithoutExt.slice(0, maxLength - 4);
  return `${truncatedName}...${extension}`;
} 