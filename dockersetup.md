# Docker Setup Instructions

To run the Docker setup, Docker Desktop must be installed.

To create the files necessary for Docker to run, change directory to the root folder `Comp4050-Bionic-Portal/` and run the Python script `./docker-generate.py`
 
Once the files are created:

- Change line 11 in `./web/vite.config.js` to `target: "http://server:4000"`
- Add Supabase API key into `./server/.env`

To spin up the container and the images:
- docker compose up --build

Once composed, verify in Docker Desktop that the following are created:

One container:
- comp4050-bionic-portal

Two images:
- server (comp4050-bionic-portal-server:latest)
- web (comp4050-bionic-portal-web:latest)