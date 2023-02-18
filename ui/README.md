# UI

## Logo

The logo is a handwritten SVG (ecks dee) at `logo.svg`.

### Favicon

The `favicon.ico` can be generated via:

```sh
./scripts/favicon.sh src/assets/beta_spray.svg
```

### Profile Image

The profile image used for Twitter etc. can be generated via:

```sh
convert -density 2000 -resize 512x512 -background black src/assets/beta_spray.svg icon.png
```
