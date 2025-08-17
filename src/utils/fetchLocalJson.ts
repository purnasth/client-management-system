/**
 * Fetches a local JSON file from the specified path and parses its contents.
 *
 * @template T The expected type of the parsed JSON data.
 * @param {string} path - The path to the local JSON file.
 * @returns {Promise<T>} A promise that resolves to the parsed JSON data of type T.
 * @throws {Error} If the fetch request fails or the response is not OK.
 */
export async function fetchLocalJson<T = unknown>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }
  return response.json();
}
