# Time Keeper

### A Django Time Management Application.

**To run**

#### Run without deleting previous container
`docker build -t timekeeper:latest . && docker run --name timekeeper -p 8000:8000 -d timekeeper`

#### Run with deleting previous container
`docker container rm timekeeper;docker build -t timekeeper:latest . && docker run --name timekeeper -p 8000:8000 -d timekeeper`
