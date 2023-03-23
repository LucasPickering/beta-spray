# Beta Spray

A website designed to plan and share [bouldering beta](<https://en.wikipedia.org/wiki/Beta_(climbing)>). Available at [betaspray.net](https://betaspray.net)! Try it out, let me know what you think.

![Annotated boulder](/images/boulder1.png)

## Development

Run the stack with:

```sh
docker-compose up
```

### Local Dependencies

While not necessary for development, it's helpful to install dependencies outside of Docker so your editor can access them and do typechecking/autocomplete.

### API

Requires [pyenv](https://github.com/pyenv/pyenv) and [poetry](https://python-poetry.org/docs/).

```sh
cd api
pyenv install
poetry install # Installs dependencies to api/.venv/
```

#### Auth

If you want to enable Google logins, you'll need to add Google OAuth client creds:

1. [Go here](https://console.cloud.google.com/apis/credentials)
   1. If you don't have access to the Google Project, sorry :/
1. Click Create Credentials > OAuth client ID
   1. Application type = Web application
   1. Name = Something descriptive
   1. Authorized JavaScript origins = `http://localhost:3000`
   1. Authorized redirect URIs = `http://localhost:3000/api/social/complete/google-oauth2/`
   1. Save
1. In the repo:
   1. `cp example.env .env`
   1. Copy in the client ID and secret

### UI

Requires [nvm](https://github.com/nvm-sh/nvm).

```sh
cd ui
nvm install
nvm use
npm install
```

### Debugging

The API container will automatically start `debugpy` and expose it on port 8001. There is already a VSCode debug config defined to attach to this (called `Attach to Django`). This should allow you to breakpoint and debug code from within VSCode. If you've installed dependencies locally (using steps above), VSCode should automatically load them and they should match the path layout used inside the container, meaning you can breakpoint dependency code as well.

If you want to breakpoint something that runs during startup, you can attach the debugger, then trigger a reload by saving any file. The debugger should remain attached through the reload and hit any breakpoints in startup code.

### Migrations

If you make model changes, you can generate/apply migrations with:

```sh
api/m.sh makemigrations
api/m.sh migrate
```

https://docs.djangoproject.com/en/4.0/topics/migrations/

## Production

Deployed via Kubernetes on the [Keskne](https://github.com/LucasPickering/keskne) cluster. Deployment is run automatically on merge to `master` via [this CI job](https://github.com/LucasPickering/beta-spray/actions/workflows/deploy.yml) into two environments:

| Environment | Namespace        | Domain                                         | When             |
| ----------- | ---------------- | ---------------------------------------------- | ---------------- |
| Development | `beta-spray-dev` | [dev.betaspray.net](https://dev.betaspray.net) | Manually         |
| Production  | `beta-spray`     | [betaspray.net](https://betaspray.net)         | Push to `master` |

See the [deployment-specific README](./deploy/README.md) for more info.
