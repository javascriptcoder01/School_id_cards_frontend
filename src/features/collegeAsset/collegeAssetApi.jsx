// collegeAssetApi.js
import apiClient from '../../api/apiClient.js';

/**
 * ⚠️ Backend route ka path apne project ke hisaab se check kar lena.
 * Expected: GET <endpoint>?isActive=true  -> logged-in COLLEGE_ADMIN ke college ke assets
 * Response: { assets: [{ _id, type, name, url, isActive }] }  (ya seedha array)
 */
export const COLLEGE_ASSETS_ENDPOINT = '/college-assets';

export const getCollegeAssetsApi = async (params = {}) => {
    const response = await apiClient.get(COLLEGE_ASSETS_ENDPOINT, { params });
    return response;
};

export default { getCollegeAssetsApi };