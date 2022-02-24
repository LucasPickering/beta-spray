#!/bin/sh

# Run a manage.py command. If not in the api container already, this will exec into it

CMD="cd src && poetry run ./manage.py $@"

if test -f "/.dockerenv"; then
    $CMD
else
    docker exec -it beta-spray_api_1 sh -c "$CMD"
fi
