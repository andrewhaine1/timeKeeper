# Time Keeper

### A Django Time Management Application.

**To run**

#### Run without deleting previous container
`docker build -t timekeeper:latest . && docker run --restart=always --name timekeeper -p 8000:8000 -d timekeeper`

***This will run it on port 8000 and also setting the restart to always will make sure it always starts up with docker***

#### Run with deleting previous container
`docker container rm timekeeper;docker build -t timekeeper:latest . && docker run --name timekeeper -p 8000:8000 -d timekeeper`
