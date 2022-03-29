# Beta Spray

## Development

Run the stack with:

```sh
docker-compose up
```

### First Time Setup

#### API

You'll need to run migrations, and load some fixture data:

```sh
api/m.sh migrate
api/m.sh loaddata basic
```

#### UI

**On Mac**, Relay currently [doesn't work inside the docker container](https://github.com/facebook/relay/issues/3799), so you'll have to run it separately outside the container:

```sh
cd ui
nvm use
npm install
npm run relay:watch
```

### Migrations

If you make model changes, you can generate/apply migrations with:

```sh
api/m.sh makemigrations
api/m.sh migrate
```

https://docs.djangoproject.com/en/4.0/topics/migrations/
