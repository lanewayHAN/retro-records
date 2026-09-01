import express from "express";
import { searchDiscogsMusic } from "./discogs.controller.js";

const router = express.Router();

router.get("/search", searchDiscogsMusic);

export default router;