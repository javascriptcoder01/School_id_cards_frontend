// useThemeArtworkContent.js — ARTWORK layers ka sanitised SVG (id se), ek baar fetch, sab cards share karte hain.
// Redux nahi (IdCardSide pure presentational rehta hai): chhota module cache + useSyncExternalStore.
// renderData sirf { id, updatedAt } bhejta hai; updatedAt badle to dobara fetch.
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { getThemeArtwork } from '../features/themeArtwork/themeArtworkApi.js';

const cache = new Map(); // id → { status: 'loading'|'ready'|'error', artwork?, updatedAt? }
const listeners = new Set();
let version = 0;

const emit = () => {
  version += 1;
  listeners.forEach((listener) => listener());
};
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getVersion = () => version;

const toEntry = (artwork) => ({
  status: 'ready',
  artwork: { svg: artwork.svg, viewBox: artwork.viewBox, slots: artwork.slots || [] },
  updatedAt: artwork.updatedAt || null,
});

const load = (id, updatedAt) => {
  const current = cache.get(id);
  if (current?.status === 'loading' || current?.status === 'error') return;
  if (current?.status === 'ready' && (!updatedAt || current.updatedAt === updatedAt)) return;
  cache.set(id, { status: 'loading' });
  getThemeArtwork(id)
    .then((response) => {
      const artwork = (response?.data ?? response)?.artwork;
      cache.set(id, artwork?.svg ? toEntry(artwork) : { status: 'error' });
      emit();
    })
    .catch(() => {
      // Delete / inactive: layer bina artwork ke (renderer skip karta hai)
      cache.set(id, { status: 'error' });
      emit();
    });
};

/** Super Admin page / upload ke baad seedha cache mein (dobara fetch nahi) */
export const primeThemeArtwork = (artwork) => {
  if (!artwork?.id || !artwork.svg) return;
  cache.set(artwork.id, toEntry(artwork));
  emit();
};

/** Edit / delete ke baad: agli baar naya content */
export const forgetThemeArtwork = (artworkId) => {
  if (cache.delete(artworkId)) emit();
};

/**
 * @param {string[]} ids - artwork ids (layers se)
 * @param {Array<{ id: string, updatedAt?: string }>} [refs] - renderData.themeLayers.artworks
 * @returns {Record<string, { svg: string, viewBox: string, slots: object[] }>} jo load ho chuke
 */
export const useThemeArtworkContent = (ids = [], refs = null) => {
  const idsKey = ids.join('|');
  const refsKey = (refs || []).map((r) => `${r.id}@${r.updatedAt || ''}`).join('|');
  useEffect(() => {
    if (!idsKey) return;
    const stamps = new Map((refs || []).map((r) => [r.id, r.updatedAt]));
    idsKey.split('|').forEach((id) => load(id, stamps.get(id)));
    // refs ka content refsKey mein hai
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, refsKey]);
  const current = useSyncExternalStore(subscribe, getVersion, getVersion);
  return useMemo(() => {
    const out = {};
    if (!idsKey) return out;
    for (const id of idsKey.split('|')) {
      const entry = cache.get(id);
      if (entry?.status === 'ready') out[id] = entry.artwork;
    }
    return out;
    // current: cache badalne par naya map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, current]);
};

export default useThemeArtworkContent;
