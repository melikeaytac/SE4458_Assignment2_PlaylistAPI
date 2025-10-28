import { Router } from 'express';

const router = Router();

// In-memory store
const db = {
  playlists: [
    {
      id: 1,
      name: 'Default Playlist',
      description: 'demo playlist',
      tags: ['demo', 'default'],
      tracks: [
        {
          id: 1,
          title: 'Blinding Lights',
          artist: 'The Weeknd',
          url: '',
          durationSec: 200
        },
        {
          id: 2,
          title: 'Levitating',
          artist: 'Dua Lipa',
          url: '',
          durationSec: 203
        },
        {
          id: 3,
          title: 'Watermelon Sugar',
          artist: 'Harry Styles',
          url: '',
          durationSec: 174
        },
        {
          id: 4,
          title: 'Save Your Tears',
          artist: 'The Weeknd',
          url: '',
          durationSec: 195
        },
        {
          id: 5,
          title: 'Peaches',
          artist: 'Justin Bieber',
          url: '',
          durationSec: 198
        }
      ]
    }
  ],
  nextPlaylistId: 2,
  nextTrackId: 6
};


// Helpers
function getPlaylist(id) {
  return db.playlists.find(p => p.id === Number(id));
}
function getTrack(p, trackId) {
  return (p?.tracks || []).find(t => t.id === Number(trackId));
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Track:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         title: { type: string, example: "Blinding Lights" }
 *         artist: { type: string, example: "The Weeknd" }
 *         url: { type: string, example: "https://example.com/track.mp3" }
 *         durationSec: { type: integer, example: 387, minimum: 0 }
 *     Playlist:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         name: { type: string, example: "My Playlist" }
 *         description: { type: string, example: "Notes" }
 *         tags:
 *           type: array
 *           items: { type: string }
 *         tracks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Track'
 */

// PLAYLIST CRUD

/**
 * @swagger
 * /api/playlists:
 *   get:
 *     summary: List playlists
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search by name/description/tag
 *     responses:
 *       200: { description: OK }
 */
router.get('/', (req, res) => {
  const q = (req.query.q || '').toString().toLowerCase().trim();
  let result = db.playlists;
  if (q) {
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }
  res.json(result.map(p => ({ ...p, trackCount: p.tracks.length })));
});

/**
 * @swagger
 * /api/playlists/{id}:
 *   get:
 *     summary: Get playlist by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
router.get('/:id', (req, res) => {
  const p = getPlaylist(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

/**
 * @swagger
 * /api/playlists:
 *   post:
 *     summary: Create a playlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Bad request }
 */
router.post('/', (req, res) => {
  const { name, description = '', tags = [] } = req.body || {};
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'name is required (string)' });
  }
  const playlist = { id: db.nextPlaylistId++, name, description, tags, tracks: [] };
  db.playlists.push(playlist);
  res.status(201).json(playlist);
});

/**
 * @swagger
 * /api/playlists/{id}:
 *   put:
 *     summary: Replace playlist
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Playlist'
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad request }
 *       404: { description: Not found }
 */
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = db.playlists.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const { name, description = '', tags = [], tracks = [] } = req.body || {};
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'name is required (string)' });
  }

  const normTracks = Array.isArray(tracks) ? tracks.map(t => ({
    id: Number.isInteger(t.id) ? t.id : db.nextTrackId++,
    title: typeof t.title === 'string' ? t.title : '',
    artist: typeof t.artist === 'string' ? t.artist : '',
    url: typeof t.url === 'string' ? t.url : '',
    durationSec: Number.isInteger(t.durationSec) && t.durationSec >= 0 ? t.durationSec : 0
  })) : [];
  const updated = { id, name, description, tags, tracks: normTracks };
  db.playlists[idx] = updated;
  res.json(updated);
});

/**
 * @swagger
 * /api/playlists/{id}:
 *   patch:
 *     summary: Update playlist (partial)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
router.patch('/:id', (req, res) => {
  const p = getPlaylist(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const allowed = ['name', 'description', 'tags'];
  for (const k of Object.keys(req.body || {})) {
    if (allowed.includes(k)) p[k] = req.body[k];
  }
  res.json(p);
});

/**
 * @swagger
 * /api/playlists/{id}:
 *   delete:
 *     summary: Delete playlist
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: No Content }
 *       404: { description: Not found }
 */
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = db.playlists.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.playlists.splice(idx, 1);
  res.status(204).send();
});

// TRACKS CRUD

/**
 * @swagger
 * /api/playlists/{id}/tracks:
 *   get:
 *     summary: List/search tracks within a playlist
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search by title or artist
 *     responses:
 *       200: { description: OK }
 *       404: { description: Playlist not found }
 */
router.get('/:id/tracks', (req, res) => {
  const p = getPlaylist(req.params.id);
  if (!p) return res.status(404).json({ error: 'Playlist not found' });
  const q = (req.query.q || '').toString().toLowerCase().trim();
  let result = p.tracks;
  if (q) {
    result = result.filter(t =>
      (t.title || '').toLowerCase().includes(q) ||
      (t.artist || '').toLowerCase().includes(q)
    );
  }
  res.json(result);
});

/**
 * @swagger
 * /api/playlists/{id}/tracks/{trackId}:
 *   get:
 *     summary: Get a single track in the playlist
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: trackId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Playlist or track not found }
 */
router.get('/:id/tracks/:trackId', (req, res) => {
  const p = getPlaylist(req.params.id);
  if (!p) return res.status(404).json({ error: 'Playlist not found' });
  const t = getTrack(p, req.params.trackId);
  if (!t) return res.status(404).json({ error: 'Track not found' });
  res.json(t);
});

/**
 * @swagger
 * /api/playlists/{id}/tracks:
 *   post:
 *     summary: Add a track (or multiple tracks) to the playlist
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/Track'
 *               - type: array
 *                 items: { $ref: '#/components/schemas/Track' }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Bad request }
 *       404: { description: Playlist not found }
 */
router.post('/:id/tracks', (req, res) => {
  const p = getPlaylist(req.params.id);
  if (!p) return res.status(404).json({ error: 'Playlist not found' });

  const body = req.body;
  const items = Array.isArray(body) ? body : [body];
  if (!items.length) return res.status(400).json({ error: 'Track payload required' });

  const created = [];
  for (const t of items) {
    if (!t || typeof t.title !== 'string' || !t.title.trim()) {
      return res.status(400).json({ error: 'Each track requires a non-empty string "title"' });
    }
    const track = {
      id: db.nextTrackId++,
      title: t.title,
      artist: t.artist || '',
      url: t.url || '',
      durationSec: Number.isInteger(t.durationSec) && t.durationSec >= 0 ? t.durationSec : 0
    };
    p.tracks.push(track);
    created.push(track);
  }
  res.status(201).json(Array.isArray(body) ? created : created[0]);
});

/**
 * @swagger
 * /api/playlists/{id}/tracks/{trackId}:
 *   put:
 *     summary: Replace a track in the playlist
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: trackId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Track'
 *     responses:
 *       200: { description: OK }
 *       404: { description: Playlist or track not found }
 */
router.put('/:id/tracks/:trackId', (req, res) => {
  const p = getPlaylist(req.params.id);
  if (!p) return res.status(404).json({ error: 'Playlist not found' });
  const tid = Number(req.params.trackId);
  const idx = p.tracks.findIndex(t => t.id === tid);
  if (idx === -1) return res.status(404).json({ error: 'Track not found' });
  const { title, artist = '', url = '', durationSec = 0 } = req.body || {};
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title is required (string)' });
  }
  const updated = {
    id: tid,
    title,
    artist,
    url,
    durationSec: Number.isInteger(durationSec) && durationSec >= 0 ? durationSec : 0
  };
  p.tracks[idx] = updated;
  res.json(updated);
});

/**
 * @swagger
 * /api/playlists/{id}/tracks/{trackId}:
 *   patch:
 *     summary: Update a track (partial) in the playlist
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: trackId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200: { description: OK }
 *       404: { description: Playlist or track not found }
 */
router.patch('/:id/tracks/:trackId', (req, res) => {
  const p = getPlaylist(req.params.id);
  if (!p) return res.status(404).json({ error: 'Playlist not found' });
  const t = getTrack(p, req.params.trackId);
  if (!t) return res.status(404).json({ error: 'Track not found' });
  const allowed = ['title', 'artist', 'url', 'durationSec'];
  for (const k of Object.keys(req.body || {})) {
    if (allowed.includes(k)) {
      if (k === 'durationSec') {
        const v = req.body[k];
        t[k] = Number.isInteger(v) && v >= 0 ? v : t[k];
      } else {
        t[k] = req.body[k];
      }
    }
  }
  res.json(t);
});

/**
 * @swagger
 * /api/playlists/{id}/tracks/{trackId}:
 *   delete:
 *     summary: Remove a track from the playlist
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: trackId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: No Content }
 *       404: { description: Playlist or track not found }
 */
router.delete('/:id/tracks/:trackId', (req, res) => {
  const p = getPlaylist(req.params.id);
  if (!p) return res.status(404).json({ error: 'Playlist not found' });
  const tid = Number(req.params.trackId);
  const idx = p.tracks.findIndex(t => t.id === tid);
  if (idx === -1) return res.status(404).json({ error: 'Track not found' });
  p.tracks.splice(idx, 1);
  res.status(204).send();
});

export default router;
