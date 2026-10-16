export const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
export const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
  media_type?: 'movie';
}

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_name: string;
  popularity: number;
  origin_country: string[];
  media_type?: 'tv';
}

export interface TMDBDetails {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: TMDBSeason[];
  credits?: TMDBCredits;
  videos?: { results: TMDBVideo[] };
  external_ids?: { imdb_id: string | null };
  recommendations?: { results: (TMDBMovie | TMDBTVShow)[] };
  similar?: { results: (TMDBMovie | TMDBTVShow)[] };
}

export interface TMDBSeason {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface TMDBCredits {
  cast: TMDBCast[];
  crew: TMDBCrew[];
}

export interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

export interface TMDBSearchResult {
  page: number;
  results: (TMDBMovie | TMDBTVShow)[];
  total_pages: number;
  total_results: number;
}

async function fetchTMDB<T>(endpoint: string): Promise<T> {
  const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}&language=en-US`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    // Return empty data structure for build-time when API key is missing
    if (!TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_api_key') {
      return { page: 1, results: [], total_pages: 0, total_results: 0 } as unknown as T;
    }
    throw new Error(`TMDB API error: ${res.status}`);
  }
  return res.json();
}

export async function getTrendingMovies(): Promise<TMDBMovie[]> {
  const data = await fetchTMDB<TMDBSearchResult>('/trending/movie/day');
  return data.results as TMDBMovie[];
}

export async function getTrendingTVShows(): Promise<TMDBTVShow[]> {
  const data = await fetchTMDB<TMDBSearchResult>('/trending/tv/day');
  return data.results as TMDBTVShow[];
}

export async function getTrendingAll(): Promise<(TMDBMovie | TMDBTVShow)[]> {
  const data = await fetchTMDB<TMDBSearchResult>('/trending/all/day');
  return data.results.filter(
    (item): item is TMDBMovie | TMDBTVShow =>
      (item as TMDBMovie).media_type === 'movie' || (item as TMDBTVShow).media_type === 'tv'
  );
}

export async function getPopularMovies(): Promise<TMDBMovie[]> {
  const data = await fetchTMDB<TMDBSearchResult>('/movie/popular');
  return data.results as TMDBMovie[];
}

export async function getTopRatedMovies(): Promise<TMDBMovie[]> {
  const data = await fetchTMDB<TMDBSearchResult>('/movie/top_rated');
  return data.results as TMDBMovie[];
}

export async function getUpcomingMovies(): Promise<TMDBMovie[]> {
  const data = await fetchTMDB<TMDBSearchResult>('/movie/upcoming');
  return data.results as TMDBMovie[];
}

export async function getNowPlayingMovies(): Promise<TMDBMovie[]> {
  const data = await fetchTMDB<TMDBSearchResult>('/movie/now_playing');
  return data.results as TMDBMovie[];
}

export async function getPopularTVShows(): Promise<TMDBTVShow[]> {
  const data = await fetchTMDB<TMDBSearchResult>('/tv/popular');
  return data.results as TMDBTVShow[];
}

export async function getTopRatedTVShows(): Promise<TMDBTVShow[]> {
  const data = await fetchTMDB<TMDBSearchResult>('/tv/top_rated');
  return data.results as TMDBTVShow[];
}

export async function getAiringTodayTVShows(): Promise<TMDBTVShow[]> {
  const data = await fetchTMDB<TMDBSearchResult>('/tv/airing_today');
  return data.results as TMDBTVShow[];
}

export interface TMDBPaginatedResult {
  page: number;
  results: (TMDBMovie | TMDBTVShow)[];
  total_pages: number;
  total_results: number;
}

export interface DiscoverOptions {
  page?: number;
  genre?: number | null;
  sort?: string;
  year?: number | null;
  query?: string;
}

export async function discoverMovies({
  page = 1,
  genre = null,
  sort = 'popularity.desc',
  year = null,
}: DiscoverOptions = {}): Promise<TMDBPaginatedResult> {
  const params = new URLSearchParams({
    page: String(page),
    sort_by: sort,
    include_adult: 'false',
  });
  if (genre) params.set('with_genres', String(genre));
  if (year) params.set('primary_release_year', String(year));
  const data = await fetchTMDB<TMDBPaginatedResult>(`/discover/movie?${params.toString()}`);
  return normalizePage(data, 'movie');
}

export async function discoverTV({
  page = 1,
  genre = null,
  sort = 'popularity.desc',
  year = null,
}: DiscoverOptions = {}): Promise<TMDBPaginatedResult> {
  const params = new URLSearchParams({
    page: String(page),
    sort_by: sort,
    include_adult: 'false',
  });
  if (genre) params.set('with_genres', String(genre));
  if (year) params.set('first_air_date_year', String(year));
  const data = await fetchTMDB<TMDBPaginatedResult>(`/discover/tv?${params.toString()}`);
  return normalizePage(data, 'tv');
}

export async function fetchTrendingPage(media: 'all' | 'movie' | 'tv', page = 1): Promise<TMDBPaginatedResult> {
  const data = await fetchTMDB<TMDBPaginatedResult>(`/trending/${media}/day?page=${page}`);
  return normalizePage(data, media);
}

export async function fetchTopRatedPage(media: 'movie' | 'tv', page = 1): Promise<TMDBPaginatedResult> {
  const data = await fetchTMDB<TMDBPaginatedResult>(`/${media}/top_rated?page=${page}`);
  return normalizePage(data, media);
}

function normalizePage(data: TMDBPaginatedResult, media: 'movie' | 'tv' | 'all'): TMDBPaginatedResult {
  const results = (data?.results || []).filter((item) => {
    const type = ((item as TMDBMovie).media_type ?? media) as string;
    if (type === 'person') return false;
    if (media !== 'all' && type !== media) return false;
    return true;
  }) as (TMDBMovie | TMDBTVShow)[];

  return {
    page: data?.page || 1,
    results: results.map((item) =>
      media === 'all' ? item : { ...item, media_type: media } as TMDBMovie | TMDBTVShow
    ),
    total_pages: Math.min(data?.total_pages || 0, 500),
    total_results: data?.total_results || 0,
  };
}

export function isTMDBConfigured(): boolean {
  return Boolean(TMDB_API_KEY) && TMDB_API_KEY !== 'your_tmdb_api_key';
}

export interface GenreOption {
  id: number;
  name: string;
  slug: string;
}

export const MOVIE_GENRES: GenreOption[] = [
  { id: 28, name: 'Action', slug: 'action' },
  { id: 12, name: 'Adventure', slug: 'adventure' },
  { id: 16, name: 'Animation', slug: 'animation' },
  { id: 35, name: 'Comedy', slug: 'comedy' },
  { id: 80, name: 'Crime', slug: 'crime' },
  { id: 99, name: 'Documentary', slug: 'documentary' },
  { id: 18, name: 'Drama', slug: 'drama' },
  { id: 10751, name: 'Family', slug: 'family' },
  { id: 14, name: 'Fantasy', slug: 'fantasy' },
  { id: 36, name: 'History', slug: 'history' },
  { id: 27, name: 'Horror', slug: 'horror' },
  { id: 10402, name: 'Music', slug: 'music' },
  { id: 9648, name: 'Mystery', slug: 'mystery' },
  { id: 10749, name: 'Romance', slug: 'romance' },
  { id: 878, name: 'Sci-Fi', slug: 'scifi' },
  { id: 53, name: 'Thriller', slug: 'thriller' },
  { id: 10752, name: 'War', slug: 'war' },
  { id: 37, name: 'Western', slug: 'western' },
];

export const TV_GENRES: GenreOption[] = [
  { id: 10759, name: 'Action & Adventure', slug: 'action' },
  { id: 16, name: 'Animation', slug: 'animation' },
  { id: 35, name: 'Comedy', slug: 'comedy' },
  { id: 80, name: 'Crime', slug: 'crime' },
  { id: 99, name: 'Documentary', slug: 'documentary' },
  { id: 18, name: 'Drama', slug: 'drama' },
  { id: 10751, name: 'Family', slug: 'family' },
  { id: 10762, name: 'Kids', slug: 'family' },
  { id: 9648, name: 'Mystery', slug: 'mystery' },
  { id: 10765, name: 'Sci-Fi & Fantasy', slug: 'scifi' },
  { id: 10768, name: 'War & Politics', slug: 'war' },
  { id: 37, name: 'Western', slug: 'western' },
];

export interface SortOption {
  value: string;
  label: string;
}

export const MOVIE_SORTS: SortOption[] = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'primary_release_date.desc', label: 'Newest First' },
  { value: 'primary_release_date.asc', label: 'Oldest First' },
  { value: 'revenue.desc', label: 'Box Office' },
  { value: 'title.asc', label: 'A → Z' },
];

export const TV_SORTS: SortOption[] = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'first_air_date.desc', label: 'Newest First' },
  { value: 'first_air_date.asc', label: 'Oldest First' },
  { value: 'name.asc', label: 'A → Z' },
];

export const YEAR_OPTIONS: number[] = Array.from(
  { length: new Date().getFullYear() - 1949 },
  (_, i) => new Date().getFullYear() - i
);

/** Normalized shape consumed by MediaCard / MediaRow / MediaGrid */
export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
}

export function toMediaItems(
  results: (TMDBMovie | TMDBTVShow)[] | null | undefined,
  fallback: 'movie' | 'tv'
): MediaItem[] {
  if (!results) return [];
  return results
    .filter((item) => item && typeof item.id === 'number')
    .map((item) => ({
      id: item.id,
      title: 'title' in item ? item.title : undefined,
      name: 'name' in item ? item.name : undefined,
      poster_path: item.poster_path,
      vote_average: item.vote_average,
      release_date: 'release_date' in item ? item.release_date : undefined,
      first_air_date: 'first_air_date' in item ? item.first_air_date : undefined,
      media_type: (item.media_type === 'tv' ? 'tv' : item.media_type === 'movie' ? 'movie' : fallback) as
        | 'movie'
        | 'tv',
    }));
}

export async function searchMulti(query: string): Promise<(TMDBMovie | TMDBTVShow)[]> {
  if (!query.trim()) return [];
  const data = await fetchTMDB<TMDBSearchResult>(`/search/multi?query=${encodeURIComponent(query)}`);
  return data.results.filter(
    (item): item is TMDBMovie | TMDBTVShow => 
      (item as TMDBMovie).media_type === 'movie' || (item as TMDBTVShow).media_type === 'tv'
  );
}

export async function getMovieDetails(id: number): Promise<TMDBDetails> {
  return fetchTMDB<TMDBDetails>(`/movie/${id}?append_to_response=credits,videos,recommendations,similar,external_ids`);
}

export async function getTVDetails(id: number): Promise<TMDBDetails> {
  return fetchTMDB<TMDBDetails>(`/tv/${id}?append_to_response=credits,videos,aggregate_credits,recommendations,similar,external_ids`);
}

export async function getSeasonDetails(tvId: number, seasonNumber: number): Promise<{ episodes: TMDBEpisode[] }> {
  return fetchTMDB(`/tv/${tvId}/season/${seasonNumber}`);
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  air_date: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  runtime: number;
}

export function getImageUrl(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500'): string {
  if (!path) return '/placeholder.png';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

export function getPosterUrl(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' = 'w342'): string {
  return getImageUrl(path, size);
}

export function getBackdropUrl(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original' = 'w1280'): string {
  return getImageUrl(path, size);
}

export interface RankedMediaItem extends MediaItem {
  rank: number;
  popularity: number;
  backdrop_path?: string | null;
  overview?: string;
  genre_ids?: number[];
}

export type RankingPeriod = 'today' | 'week' | 'month';
export type RankingMedia = 'all' | 'movie' | 'tv';

export async function getTop10Rankings(
  period: RankingPeriod = 'today',
  media: RankingMedia = 'all'
): Promise<RankedMediaItem[]> {
  try {
    let rawResults: (TMDBMovie | TMDBTVShow)[] = [];

    if (period === 'today') {
      const endpoint = media === 'all' ? '/trending/all/day' : `/trending/${media}/day`;
      const data = await fetchTMDB<TMDBSearchResult>(endpoint);
      rawResults = (data?.results || []) as Array<TMDBMovie | TMDBTVShow>;
    } else if (period === 'week') {
      const endpoint = media === 'all' ? '/trending/all/week' : `/trending/${media}/week`;
      const data = await fetchTMDB<TMDBSearchResult>(endpoint);
      rawResults = (data?.results || []) as Array<TMDBMovie | TMDBTVShow>;
    } else {
      if (media === 'movie') {
        const data = await fetchTMDB<TMDBSearchResult>('/movie/popular?page=1');
        rawResults = ((data?.results || []) as TMDBMovie[]).map((m) => ({
          ...m,
          media_type: 'movie' as const,
        }));
      } else if (media === 'tv') {
        const data = await fetchTMDB<TMDBSearchResult>('/tv/popular?page=1');
        rawResults = ((data?.results || []) as TMDBTVShow[]).map((t) => ({
          ...t,
          media_type: 'tv' as const,
        }));
      } else {
        const [movies, tv] = await Promise.all([
          fetchTMDB<TMDBSearchResult>('/movie/popular?page=1').catch(() => ({ results: [] as TMDBMovie[] })),
          fetchTMDB<TMDBSearchResult>('/tv/popular?page=1').catch(() => ({ results: [] as TMDBTVShow[] })),
        ]);

        const movieResults: TMDBMovie[] = ((movies.results || []) as TMDBMovie[]).map((m) => ({
          ...m,
          media_type: 'movie',
        }));

        const tvResults: TMDBTVShow[] = ((tv.results || []) as TMDBTVShow[]).map((t) => ({
          ...t,
          media_type: 'tv',
        }));

        const combined: Array<TMDBMovie | TMDBTVShow> = [...movieResults, ...tvResults];
        combined.sort((a, b) => ((b as TMDBMovie).popularity || 0) - ((a as TMDBMovie).popularity || 0));
        rawResults = combined;
      }
    }

    const filtered = (rawResults || [])
      .filter((item): item is TMDBMovie | TMDBTVShow => {
        if (!item || typeof item.id !== 'number') return false;
        const itemType = (item as { media_type?: string }).media_type;
        if (itemType === 'person') return false;
        if (media !== 'all' && itemType && itemType !== media) return false;
        return true;
      })
      .slice(0, 10);

    return filtered.map((item, index) => ({
      id: item.id,
      rank: index + 1,
      title: 'title' in item ? item.title : undefined,
      name: 'name' in item ? item.name : undefined,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      overview: item.overview,
      vote_average: item.vote_average || 0,
      popularity: Math.round(((item as TMDBMovie).popularity || 0) * 10) / 10,
      release_date: 'release_date' in item ? item.release_date : undefined,
      first_air_date: 'first_air_date' in item ? item.first_air_date : undefined,
      media_type: (item.media_type === 'tv'
        ? 'tv'
        : item.media_type === 'movie'
        ? 'movie'
        : media === 'tv'
        ? 'tv'
        : 'movie') as 'movie' | 'tv',
      genre_ids: item.genre_ids || [],
    }));
  } catch (err) {
    console.error('getTop10Rankings error:', err);
    return [];
  }
}