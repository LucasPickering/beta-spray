from django.contrib import admin

from .models import Beta, BetaHold, Hold, BoulderImage, Problem


@admin.register(BoulderImage)
class BoulderImageAdmin(admin.ModelAdmin):
    pass


@admin.register(Hold)
class HoldAdmin(admin.ModelAdmin):
    pass


@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    pass


@admin.register(BetaHold)
class BetaHoldAdmin(admin.ModelAdmin):
    pass


@admin.register(Beta)
class BetaAdmin(admin.ModelAdmin):
    pass
