#!/bin/sh

# Run a manage.py command. If not in the api container already, this will exec into it

if test -f "/.dockerenv"; then
    cd src && poetry run ./manage.py $@
else
    # Not in docker yet, re-run the command within the container
    docker exec -it $(docker-compose ps -q api) ./m.sh $@
fi
