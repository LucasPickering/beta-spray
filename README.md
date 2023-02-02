# Beta Spray

A website designed to plan and share [bouldering beta](<https://en.wikipedia.org/wiki/Beta_(climbing)>). Available at [betaspray.net](https://betaspray.net)! Try it out, let me know what you think.

![Annotated boulder](/images/boulder1.png)

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
| Development | `beta-spray-dev` | [dev.betaspray.net](https://dev.betaspray.net) | Pull Request     |
| Production  | `beta-spray`     | [betaspray.net](https://betaspray.net)         | Push to `master` |

See the [deployment-specific README](./deploy/README.md) for more info.
