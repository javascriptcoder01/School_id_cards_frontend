// accountDisplay.js
import { useEffect, useState } from 'react';

const ROLE_LABELS = {
    SUPER_ADMIN: 'Super Admin',
    COLLEGE_ADMIN: 'School Admin',
    OPERATOR: 'Class Teacher',
};

export const getRoleLabel = (role) =>
    ROLE_LABELS[role] || (role ? String(role).replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : 'User');

export const getInstitution = (profile) => {
    if (!profile) return { name: '—', code: null, isPlatform: false };
    if (profile.collegeName) {
        return { name: profile.collegeName, code: profile.collegeCode || null, isPlatform: false };
    }
    if (profile.collegeId) {
        return { name: `College #${String(profile.collegeId).slice(-6)}`, code: null, isPlatform: false };
    }
    return { name: 'All schools', code: null, isPlatform: true };
};

/** 'Vineet Kumar' → 'VK' */
export const getInitials = (name) => {
    const parts = String(name || 'User').trim().split(/\s+/).filter(Boolean);
    const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] || 'U').slice(0, 2);
    return letters.toUpperCase();
};

export const useAppear = () => {
    const [shown, setShown] = useState(false);
    useEffect(() => {
        const id = requestAnimationFrame(() => setShown(true));
        return () => cancelAnimationFrame(id);
    }, []);
    return shown;
};

/** useAppear ke saath lagne wali classes */
export const appearClass = (shown) =>
    `transition-all duration-500 ease-out motion-reduce:transition-none ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 motion-reduce:opacity-100 motion-reduce:translate-y-0'
    }`;

export default {
    getRoleLabel,
    getInstitution,
    getInitials,
    useAppear,
    appearClass,
};