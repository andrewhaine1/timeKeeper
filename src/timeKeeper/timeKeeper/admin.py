from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from timeKeeper.models import AppUser

class AppUserAdmin(UserAdmin):
    pass

# Register your models here.
admin.site.register(AppUser, AppUserAdmin)