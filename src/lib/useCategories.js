'use client';

import { useEffect, useState } from 'react';
import { fetchCategories, buildCategoryTree } from './catalog';

/**
 * Client-side category loader with a module-level cache, so the mega-menu / mobile tree fetch the
 * category list once per session instead of on every navigation. Returns the raw flat list plus the
 * built parent→children tree.
 */
let _cache = null;      // resolved flat array
let _promise = null;    // in-flight fetch (dedupe concurrent mounts)

export function useCategories() {
    const [categories, setCategories] = useState(_cache || []);
    const [loading, setLoading] = useState(!_cache);

    useEffect(() => {
        let alive = true;
        if (_cache) { setCategories(_cache); setLoading(false); return; }
        if (!_promise) {
            _promise = fetchCategories()
                .then((list) => { _cache = Array.isArray(list) ? list : []; return _cache; })
                .catch(() => { _promise = null; return []; });
        }
        _promise.then((list) => { if (alive) { setCategories(list); setLoading(false); } });
        return () => { alive = false; };
    }, []);

    return { categories, tree: buildCategoryTree(categories), loading };
}
