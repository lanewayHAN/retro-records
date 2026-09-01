import { searchMusic } from "./discogs.service.js";

export async function searchDiscogsMusic(req, res, next) {
  try {
    const { q } = req.query;

    const result = await searchMusic(q);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}