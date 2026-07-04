import { useSearchParams } from "react-router-dom";

/**
 * Syncs a single "selected resource" id to a URL query param, so opening a
 * detail view pushes a real navigation entry — browser back steps out one
 * level at a time instead of leaving the page entirely (see S3Page/SQSPage
 * for the original pattern this generalizes).
 *
 * Setting a value replaces the query string with just that one param. For
 * pages with more than one drill-down level in the URL at once (e.g. a
 * bucket + prefix + object), build the params object by hand instead — see
 * S3Page's `selectObject`/`selectPrefix` for an example.
 */
export function useUrlSelection(key: string): [string | null, (value: string | null) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(key);
  const setValue = (next: string | null) => setSearchParams(next ? { [key]: next } : {});
  return [value, setValue];
}
