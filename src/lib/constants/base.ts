export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// Website ID artık header'dan alınacak
export const getWebsiteBaseUrl = (version: 'v1' | 'v2' = 'v1') => {
  if (typeof window === 'undefined') return BACKEND_URL;
  const websiteId = document.querySelector('meta[name="x-website-id"]')?.getAttribute('content');
  if (!websiteId) return BACKEND_URL;
  return version === 'v2' 
    ? `${BACKEND_URL}/website/v2/${websiteId}`
    : `${BACKEND_URL}/website/${websiteId}`;
};
