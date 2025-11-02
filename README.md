# Playlist API (SE4458 Assignment 2)

A simple REST API built with Express and documented using Swagger. The API provides **full CRUD for playlists** and **full CRUD for tracks within playlists**, with in-memory storage for simplicity.

## Run Locally

```bash
npm install
npm start
# Open http://localhost:3000/swagger
```
## Live Site

* https://se4458-playlist-api2.azurewebsites.net/swagger/


## Endpoints

### Playlist CRUD

* `GET /api/playlists?q=term` – List all playlists, optionally filter by name/description/tag.
* `GET /api/playlists/:id` – Retrieve a specific playlist.
* `POST /api/playlists` – Create a new playlist.
* `PUT /api/playlists/:id` – Replace an existing playlist.
* `PATCH /api/playlists/:id` – Update selected fields of a playlist.
* `DELETE /api/playlists/:id` – Delete a playlist.

### Track CRUD (within a Playlist)

* `GET /api/playlists/:id/tracks?q=term` – List or search tracks in a playlist.
* `GET /api/playlists/:id/tracks/:trackId` – Retrieve a single track.
* `POST /api/playlists/:id/tracks` – Add one or multiple tracks.
* `PUT /api/playlists/:id/tracks/:trackId` – Replace a track.
* `PATCH /api/playlists/:id/tracks/:trackId` – Update selected fields of a track.
* `DELETE /api/playlists/:id/tracks/:trackId` – Delete a track.

### Data Schemas

**Playlist**

```json
{
  "id": 1,
  "name": "Daylist",
  "description": "Energetic songs",
  "tags": ["hip-hop", "pop"],
  "tracks": [Track]
}
```

**Track**

```json
{
  "id": 1,
  "title": "Blinding Lights",
  "artist": "The Weeknd",
  "url": "https://example.com/a.mp3",
  "durationSec": 180
}
```

## Design Notes

* **Architecture:** Express server with modular routing; in-memory data.
* **Swagger:** Auto-generated docs via swagger-jsdoc + swagger-ui-express.
* **Validation:** Playlist name and track title required; durationSec must be ≥ 0.
* **CORS:** Enabled for all origins.
* **Health Check:** `/api/health` endpoint reports uptime.
* **Deployment:** Works on Azure App Service (Linux Free F1) with zip deploy.
