// imageUpload.js
import apiClient from '../api/apiClient.js';

export const UPLOAD_ENDPOINT = '/uploads/image'; // backend route (apiClient baseURL ke baad)
export const STUDENT_PHOTO_UPLOAD_ENDPOINT = '/students/photo'; // student photo (student routes ke andar)
export const UPLOAD_FILE_FIELD = 'file'; // multer: upload.single('file')
export const UPLOAD_FOLDER_FIELD = 'folder'; // backend folder kaise leta hai (body field)

export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

// Backend limit ke barabar (constants/upload.js: UPLOAD_MAX_FILE_SIZE_BYTES)
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

// Backend ke CLOUDINARY_FOLDERS se match — Cloudinary path: Schools/<schoolId>/<Folder>
export const UPLOAD_FOLDERS = {
    STUDENTS: 'Students', // student passport photo
    LOGOS: 'Logos',
    SIGNATURES: 'Signatures',
    STAMPS: 'Stamps',
    LETTERHEADS: 'Letterheads',
    GENERAL: 'General',
    // Purane keys (backend inhe General mein map karta hai)
    COLLEGES: 'colleges',
    COLLEGE_ASSETS: 'college-assets',
};

/**
 * Badi photo ko upload se pehle chhota karta hai.
 * Kuch bhi fail ho to original file hi lauta deta hai.
 *
 * ⚠️ Abhi koi screen ise use nahi karti. Upload hamesha ORIGINAL file ka hota hai —
 * student photo, letterhead, logo, signature, stamp kisi ko bhi resize MAT karo.
 *
 * PNG ki transparency bachi rehti hai (PNG → PNG). Baaki JPEG banti hain.
 */
export const resizeImage = (file, { maxSize = 800, quality = 0.85 } = {}) =>
    new Promise((resolve) => {
        if (typeof document === 'undefined' || typeof Image === 'undefined' || !file.type.startsWith('image/')) {
            resolve(file);
            return;
        }
        const keepPng = file.type === 'image/png';
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        let settled = false;
        const finish = (result) => {
            if (settled) return;
            settled = true;
            URL.revokeObjectURL(objectUrl);
            resolve(result);
        };
        const timer = setTimeout(() => finish(file), 3000);

        img.onload = () => {
            clearTimeout(timer);
            const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
            if (scale === 1 && file.size < 500 * 1024) {
                finish(file);
                return;
            }
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                finish(file);
                return;
            }
            // JPEG mein transparency nahi hoti, isliye safed background; PNG transparent hi rahega
            if (!keepPng) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const outType = keepPng ? 'image/png' : 'image/jpeg';
            const outExt = keepPng ? '.png' : '.jpg';
            canvas.toBlob(
                (blob) => finish(blob ? new File([blob], file.name.replace(/\.\w+$/, outExt), { type: outType }) : file),
                outType,
                keepPng ? undefined : quality
            );
        };
        img.onerror = () => {
            clearTimeout(timer);
            finish(file);
        };
        img.src = objectUrl;
    });

/**
 * Backend response ka shape kuch bhi ho — upload result nikaal leta hai.
 * url + publicId ke saath format / size / width / height bhi (asset API ko chahiye).
 */
const extractUploadResult = (response) => {
    const candidates = [
        response,
        response?.data,
        response?.data?.data,
        response?.data?.file,
        response?.data?.image,
        response?.data?.upload,
        response?.file,
        response?.image,
        response?.upload,
    ];
    for (const c of candidates) {
        const url = c?.url || c?.secure_url || c?.secureUrl;
        if (typeof url === 'string' && url) {
            return {
                url,
                publicId: c.publicId || c.public_id || null,
                format: c.format || null,
                mimeType: c.mimeType || null,
                sizeBytes: c.sizeBytes ?? c.bytes ?? null,
                widthPx: c.widthPx ?? c.width ?? null,
                heightPx: c.heightPx ?? c.height ?? null,
            };
        }
    }
    return null;
};

/**
 * File ko jaisa hai waisa hi bhejta hai — koi resize / crop / compression nahi.
 *
 * @param {File|Blob} file
 * @param {{ folder?: string, endpoint?: string, onProgress?: (percent:number)=>void, signal?: AbortSignal }} options
 * @returns {Promise<{ url: string, publicId: string|null, format: string|null, mimeType: string|null,
 *   sizeBytes: number|null, widthPx: number|null, heightPx: number|null }>}
 */
export const uploadImage = async (file, { folder, endpoint = UPLOAD_ENDPOINT, onProgress, signal } = {}) => {
    const formData = new FormData();
    formData.append(UPLOAD_FILE_FIELD, file);
    if (folder) formData.append(UPLOAD_FOLDER_FIELD, folder);

    const response = await apiClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal,
        onUploadProgress: (e) => {
            if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
        },
    });

    const result = extractUploadResult(response);
    if (!result) {
        throw new Error('Upload finished but the server did not return an image link');
    }
    return result;
};