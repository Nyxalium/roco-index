import { ArrowUpRight } from 'lucide-react';
import Artwork from './Artwork';
import { dateLabel } from './data';
import type { NewsArticle } from './data';

export default function News({ articles, compact = false }: { articles: NewsArticle[]; compact?: boolean }) {
  const sorted = [...articles].sort((a, b) => b.set_on_status_time - a.set_on_status_time);
  return <section className={`news-section page-width ${compact ? 'news-compact' : ''}`} aria-labelledby="news-heading">
    <div className="section-heading"><h2 id="news-heading">Official news<span className="heading-count">{articles.length}</span></h2>{compact && <a className="text-button" href="#/news">All news <ArrowUpRight size={17} /></a>}</div>
    <div className="news-grid">{sorted.slice(0, compact ? 3 : articles.length).map(article => <a className="news-card" key={article.documentId} href={`https://rocokingdom.com/news/detail/?id=${encodeURIComponent(article.documentId)}`} target="_blank" rel="noopener noreferrer"><div className="news-image"><Artwork key={article.coverImage1?.[0]} url={article.coverImage1?.[0]} name={article.title} /><span className="news-link-icon"><ArrowUpRight size={22} /></span></div><div className="news-meta"><span>Roco Kingdom</span><time dateTime={new Date(article.set_on_status_time * 1000).toISOString()}>{dateLabel(article.set_on_status_time)}</time></div><h3>{article.title}</h3></a>)}</div>
    {!articles.length && <p className="empty-state">No official articles are available.</p>}
  </section>;
}
