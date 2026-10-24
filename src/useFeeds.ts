import { useEffect, useState } from 'react';
import { cdnBase, initialAssets, initialJapaneseAssets, initialNews } from './data';
import type { Asset, NewsArticle } from './data';

export default function useFeeds() {
  const [assets, setAssets] = useState(initialAssets);
  const [japaneseAssets, setJapaneseAssets] = useState(initialJapaneseAssets);
  const [news, setNews] = useState(initialNews);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    let cancelled = false;
    setLoading(true);
    const fetchFeed = async (path: string) => {
      const response = await fetch(cdnBase + path, { signal: controller.signal, credentials: 'omit' });
      if (!response.ok) throw new Error(`Official feed returned HTTP ${response.status}`);
      const feed: unknown = await response.json();
      if (!feed || typeof feed !== 'object' || !('data' in feed) || !Array.isArray(feed.data) || feed.data.length === 0 || feed.data.some(item => !item || typeof item.documentId !== 'string' || typeof item.title !== 'string')) {
        throw new Error('The official feed returned an unrecognised catalogue format.');
      }
      const newsFeed = path.startsWith('nrcg_info_article_5_');
      if (feed.data.some(item => newsFeed
        ? !Number.isFinite(item.set_on_status_time) || !Array.isArray(item.coverImage1)
        : typeof item.fileType !== 'string' || typeof item.description !== 'string' || (item.coverImage !== null && (!Array.isArray(item.coverImage) || item.coverImage.some((url: unknown) => typeof url !== 'string'))))) {
        throw new Error('The official content format has changed. Keeping the saved catalogue.');
      }
      return feed.data;
    };
    Promise.allSettled([
      fetchFeed('nrcg_info_article_413_labels_16062_en.json'),
      fetchFeed('nrcg_info_article_413_labels_16062_ja-JP.json'),
      fetchFeed('nrcg_info_article_5_local_en.json'),
    ]).then(results => {
      if (cancelled) return;
      if (results[0].status === 'fulfilled') setAssets(results[0].value as Asset[]);
      if (results[1].status === 'fulfilled') setJapaneseAssets(results[1].value as Asset[]);
      if (results[2].status === 'fulfilled') setNews(results[2].value as NewsArticle[]);
      const failures = results.filter(result => result.status === 'rejected');
      failures.forEach(result => console.warn('Roco Index: could not refresh official content', result.reason));
      setError(failures.length > 0);
      setLoading(false);
      clearTimeout(timeout);
    });
    return () => { cancelled = true; controller.abort(); clearTimeout(timeout); };
  }, [retry]);

  return { assets, japaneseAssets, news, error, loading, refresh: () => setRetry(value => value + 1) };
}
