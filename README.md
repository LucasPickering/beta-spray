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

Deployed via Kubernetes on the [Keskne](https://github.com/LucasPickering/keskne) cluster.

### Kubernetes Deploy

Deployment is managed via Terraform, which underneath uses Helm to manage the Kubernetes resources. See the README in the `terraform` sub-directory for more info. To deploy the latest version:

```sh
./deploy/deploy.sh
```

## Notes

### Generating Favicon

Favicon is defined in `ui/favicon.svg`. To generate an ICO from that, using Imagemagick:

```sh
cd ui
convert -density 256x256 -background transparent favicon.svg -define icon:auto-resize -colors 256 public/favicon.ico
```
