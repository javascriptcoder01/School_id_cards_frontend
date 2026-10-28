// StudentPhotoUpload.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, RefreshCw, Trash2, AlertCircle, Undo2 } from 'lucide-react';
import {
    uploadImage,
    UPLOAD_FOLDERS,
    ACCEPTED_IMAGE_TYPES,
    MAX_UPLOAD_SIZE_BYTES,
    STUDENT_PHOTO_UPLOAD_ENDPOINT,
} from '../../utils/imageUpload.js';

// Original file hi upload hoti hai — koi crop / resize / compression nahi.
// Passport (7:9) look sirf preview ki CSS hai (aspect-[7/9] + object-cover).
const MAX_UPLOAD_SIZE_MB = Math.round(MAX_UPLOAD_SIZE_BYTES / (1024 * 1024));

const getErrorMessage = (err) =>
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Photo upload failed. Please try again';

export const StudentPhotoUpload = ({
    value = null,
    onChange,
    onUploadingChange,
    disabled = false,
    error = null,
    label = 'Passport Photo',
    folder = UPLOAD_FOLDERS.STUDENTS,
    endpoint = STUDENT_PHOTO_UPLOAD_ENDPOINT,
    savedPhoto = null,
}) => {
    const inputRef = useRef(null);
    const abortRef = useRef(null);
    const [localPreview, setLocalPreview] = useState(null);
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const previewUrl = localPreview || value?.url || null;
    const isBusy = disabled || isUploading;
    // Edit mein photo badli ya hatai hai → saved photo wapas lane ka option
    const canRestore = Boolean(savedPhoto?.url) && value?.url !== savedPhoto.url && !isUploading;

    // Unmount par chalta upload cancel + preview URL free
    useEffect(
        () => () => {
            if (abortRef.current) abortRef.current.abort();
        },
        []
    );

    useEffect(
        () => () => {
            if (localPreview) URL.revokeObjectURL(localPreview);
        },
        [localPreview]
    );

    const setUploading = (state) => {
        setIsUploading(state);
        if (onUploadingChange) onUploadingChange(state);
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = ''; // same file dobara chun sakein
        if (!file) return;

        setUploadError(null);

        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            setUploadError('Only PNG, JPEG or WEBP photos are allowed');
            return;
        }
        if (file.size > MAX_UPLOAD_SIZE_BYTES) {
            setUploadError(`Photo is too large. Please choose a photo under ${MAX_UPLOAD_SIZE_MB} MB`);
            return;
        }

        const controller = new AbortController();
        abortRef.current = controller;
        setProgress(0);
        setUploading(true);

        try {
            setLocalPreview(URL.createObjectURL(file));

            const result = await uploadImage(file, {
                folder,
                endpoint,
                onProgress: setProgress,
                signal: controller.signal,
            });

            setLocalPreview(null);
            if (onChange) onChange({ url: result.url, publicId: result.publicId });
        } catch (err) {
            if (controller.signal.aborted) return;
            setLocalPreview(null);
            setUploadError(getErrorMessage(err));
        } finally {
            if (abortRef.current === controller) abortRef.current = null;
            setUploading(false);
        }
    };

    const handleRestore = () => {
        setUploadError(null);
        setLocalPreview(null);
        if (onChange) onChange({ url: savedPhoto.url, publicId: savedPhoto.publicId || null });
    };

    const handleRemove = () => {
        setUploadError(null);
        setLocalPreview(null);
        if (onChange) onChange(null);
    };

    const shownError = uploadError || error;

    return (
        <div className="space-y-2">
            <span className="block text-sm font-semibold text-slate-700">{label}</span>

            <div className="flex items-start gap-4">
                {/* Preview — 7:9 frame */}
                <button
                    type="button"
                    onClick={() => !isBusy && inputRef.current?.click()}
                    disabled={isBusy}
                    aria-label={previewUrl ? 'Change photo' : 'Upload photo'}
                    className={`relative w-28 aspect-[7/9] shrink-0 overflow-hidden rounded-lg border-2 border-dashed transition-colors
            ${shownError ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-slate-50 hover:border-indigo-400'}
            ${isBusy ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    {previewUrl ? (
                        <img src={previewUrl} alt="Student" className="h-full w-full object-cover" />
                    ) : (
                        <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-400">
                            <Camera className="h-7 w-7" />
                            <span className="text-xs font-medium">Add photo</span>
                        </span>
                    )}

                    {isUploading && (
                        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/75 text-indigo-600">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="text-xs font-semibold">{progress}%</span>
                        </span>
                    )}
                </button>

                <div className="space-y-2 pt-1">
                    <p className="text-xs text-slate-500">
                        Front-facing photo, plain background. PNG, JPEG or WEBP up to {MAX_UPLOAD_SIZE_MB} MB.
                    </p>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            {previewUrl ? <RefreshCw className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
                            {previewUrl ? 'Change' : 'Upload'}
                        </button>

                        {value?.url && !isUploading && (
                            <button
                                type="button"
                                onClick={handleRemove}
                                disabled={disabled}
                                className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove
                            </button>
                        )}

                        {canRestore && (
                            <button
                                type="button"
                                onClick={handleRestore}
                                disabled={disabled}
                                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            >
                                <Undo2 className="h-3.5 w-3.5" />
                                Restore saved
                            </button>
                        )}
                    </div>

                    {shownError && (
                        <p className="flex items-center gap-1 text-xs font-medium text-red-600">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {shownError}
                        </p>
                    )}
                </div>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
};

export default StudentPhotoUpload;