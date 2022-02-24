from django.contrib import admin

from .models import Beta, BetaHold, Hold, BoulderImage, Problem


@admin.register(BoulderImage)
class BoulderImageAdmin(admin.ModelAdmin):
    exclude = ("id",)


@admin.register(Hold)
class HoldAdmin(admin.ModelAdmin):
    exclude = ("id",)


@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    exclude = ("id",)


@admin.register(BetaHold)
class BetaHoldAdmin(admin.ModelAdmin):
    exclude = ("id",)


@admin.register(Beta)
class BetaAdmin(admin.ModelAdmin):
    exclude = ("id",)
