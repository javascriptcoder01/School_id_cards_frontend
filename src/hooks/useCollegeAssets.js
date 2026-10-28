import { useCallback, useEffect, useState } from 'react';
import { getCollegeAssetsApi } from '../features/collegeAsset/collegeAssetApi';
// import { getCollegeAssetsApi } from '../features/collegeAssets/collegeAssetApi.js';

// Response ka shape alag-alag ho sakta hai: { data: { assets } }, { assets }, ya array
const extractAssets = (response) => {
    const data = response?.data ?? response;
    const list =
        data?.assets ||
        data?.collegeAssets ||
        data?.data?.assets ||
        (Array.isArray(data) ? data : null) ||
        (Array.isArray(data?.data) ? data.data : null);
    return Array.isArray(list) ? list : [];
};

/**
 * Logged-in college ke assets (LETTERHEAD, LOGO, SIGNATURE, STAMP, ...)
 * Template designer ke pickers isi se bharte hain.
 */
export const useCollegeAssets = ({ enabled = true } = {}) => {
    const [assets, setAssets] = useState([]);
    const [isLoading, setIsLoading] = useState(enabled);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getCollegeAssetsApi({ isActive: true });
            setAssets(extractAssets(response));
        } catch (err) {
            setError(err?.message || 'Could not load college assets');
            setAssets([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (enabled) load();
    }, [enabled, load]);

    return { assets, isLoading, error, reload: load };
};

export default useCollegeAssets;