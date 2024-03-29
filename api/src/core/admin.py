from django.contrib import admin

from .models import Beta, BetaMove, Boulder, Hold, Problem


@admin.register(Boulder)
class BoulderAdmin(admin.ModelAdmin):
    exclude = ("id",)


@admin.register(Hold)
class HoldAdmin(admin.ModelAdmin):
    exclude = ("id",)


@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    exclude = ("id",)


@admin.register(BetaMove)
class BetaMoveAdmin(admin.ModelAdmin):
    exclude = ("id",)


@admin.register(Beta)
class BetaAdmin(admin.ModelAdmin):
    exclude = ("id",)
