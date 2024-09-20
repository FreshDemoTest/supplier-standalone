export const IMAGE_CDN = "https://res.cloudinary.com/dynivnmji/";

export function buildImageUrl(publicId: string, width: number): string {
  return `${IMAGE_CDN}q_auto,w_${width}/${publicId}`;
}

export function buildImageThumbnail(publicId: string): string {
  return buildImageUrl(publicId, 200);
}

export function buildImageDetail(publicId: string): string {
  return buildImageUrl(publicId, 512);
}

export function buildIBannerImageDetail(publicId: string): string {
  return `${IMAGE_CDN}${publicId}`;
}

export function buildAllImage(publicId: string): string {
  return `${IMAGE_CDN}${publicId}`;
}
