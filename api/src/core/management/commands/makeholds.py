from django.core.management.base import BaseCommand
from core.models import BoulderImage, Hold
from PIL import Image


class Command(BaseCommand):
    help = "Manually create holds for an image"

    def add_arguments(self, parser):
        parser.add_argument("image_path")

    def handle(self, *args, **options):
        image_path = options["image_path"]
        boulder_image = BoulderImage.objects.get(path=image_path)

        print(f"Loaded image with id={boulder_image.id}")
        with Image.open(image_path) as im:
            width = im.width
            height = im.height

        # Read a series of x/y positions (in *pixel* coordinates)
        print("Ctrl-d when done")
        while True:
            try:
                xy_pixels = input("x,y: ")
            except EOFError:
                break

            try:
                x_pixels, y_pixels = map(int, xy_pixels.split(","))
            except ValueError:
                print(f"Couldn't parse {xy_pixels} as x,y, try again")
                continue

            x = x_pixels / width
            y = y_pixels / height
            hold = Hold.objects.create(
                image=boulder_image, position_x=x, position_y=y
            )
            print(f"Added hold {hold.id} at {x},{y} ({x_pixels},{y_pixels})")
