import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMovieDetails, getTVDetails, TMDBDetails } from '@/lib/tmdb';
import { WatchPageClient } from './WatchPageClient';

interface WatchPageProps {
  params: any;
  searchParams: Promise<{ season?: string; episode?: string }>;
}

export async function generateMetadata({ params, searchParams }: WatchPageProps): Promise<Metadata> {
  const p = await params; const type = p?.type; const id = p?.id;
  const tmdbId = parseInt(id, 10);
  
  try {
    const details = type === 'movie' 
      ? await getMovieDetails(tmdbId)
      : await getTVDetails(tmdbId);
    
    const title = details.title || details.name || 'Watch';
    const year = details.release_date?.slice(0, 4) || details.first_air_date?.slice(0, 4) || '';
    
    return {
      title: `${title} ${year}`.trim(),
      description: details.overview || `Watch ${title} online for free in HD.`,
      openGraph: {
        title: `${title} ${year}`.trim(),
        description: details.overview || `Watch ${title} online for free in HD.`,
        images: details.backdrop_path 
          ? [`https://image.tmdb.org/t/p/w1280${details.backdrop_path}`]
          : [],
        type: 'video.other',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} ${year}`.trim(),
        description: details.overview || `Watch ${title} online for free in HD.`,
        images: details.backdrop_path 
          ? [`https://image.tmdb.org/t/p/w1280${details.backdrop_path}`]
          : [],
      },
    };
  } catch {
    return {
      title: 'Watch',
      description: 'Watch online for free in HD.',
    };
  }
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const p = await params; const type = p?.type; const id = p?.id;
  const sp = await searchParams; const season = sp?.season; const episode = sp?.episode;
  const tmdbId = parseInt(id, 10);

  if (!['movie', 'tv'].includes(type) || isNaN(tmdbId)) {
    notFound();
  }

  try {
    const details = type === 'movie' 
      ? await getMovieDetails(tmdbId)
      : await getTVDetails(tmdbId);

    if (!details) notFound();

    return (
      <WatchPageClient
        type={type as 'movie' | 'tv'}
        tmdbId={tmdbId}
        details={details}
        initialSeason={season ? parseInt(season, 10) : 1}
        initialEpisode={episode ? parseInt(episode, 10) : 1}
      />
    );
  } catch {
    notFound();
  }
}