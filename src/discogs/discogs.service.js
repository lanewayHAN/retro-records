import { searchDiscogs } from "../integrations/discogs.client.js";

export async function searchMusic(query) {
  if (!query || query.trim() === "") {
    const error = new Error("Search query is required");
    error.name = "ValidationError";
    error.status = 400;
    throw error;
  }

  return await searchDiscogs(query.trim());
}