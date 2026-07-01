// src/components/ArticleCard.js
import React, { useEffect, useState } from 'react';

export default function ArticleCard({ article }) {
  if (!article) return null;

  const { title, summary, url, category, country, publishedAt, imageUrl } = article;
  const [imageBroken, setImageBroken] = useState(false);

  useEffect(() => {
    setImageBroken(false);
  }, [imageUrl]);

  // Render a clean fallback background gradient if no source image is extracted
  const fallbackImageBg = "linear-gradient(135deg, #10b981 0%, #065f46 100%)";

  return (
    <article className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200 min-w-[280px]">
      
      {/* Card Header Media Workspace */}
      <div
        className="w-full h-40 flex items-center justify-center text-white p-4 font-bold relative text-sm select-none overflow-hidden"
        style={{
          backgroundImage: !imageUrl || imageBroken ? fallbackImageBg : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {imageUrl && !imageBroken && (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImageBroken(true)}
            referrerPolicy="no-referrer"
          />
        )}

        {(!imageUrl || imageBroken) && (
          <span className="text-center tracking-wide drop-shadow-sm uppercase text-xs">
            {category}
          </span>
        )}
        <span className="absolute top-2 right-2 bg-slate-950/70 backdrop-blur-sm text-white px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold rounded">
          {country}
        </span>
      </div>

      {/* Content Metadata Block */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <span>{category}</span>
          </div>

          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-2 hover:text-emerald-600">
            <a href={url} target="_blank" rel="noopener noreferrer">
              {title}
            </a>
          </h3>

          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
            {summary || 'No descriptive excerpt text extracted from the target publisher. Select below to review canonical source files directly.'}
          </p>
        </div>

        {/* Card Footer Interaction Bar */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
          <span>
            {new Date(publishedAt).toLocaleDateString('en-NG', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-700 font-bold tracking-wide uppercase transition-colors"
          >
            Read Original →
          </a>
        </div>
      </div>

    </article>
  );
}