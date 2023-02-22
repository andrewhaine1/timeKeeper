from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager

class ModelBase(models.Model):
    date_created = models.DateTimeField(auto_now_add=True, blank=False)
    date_updated = models.DateTimeField(auto_now_add=True, blank=False)

class AppUserManager(UserManager):
    def get_by_natural_key(self, username):
        case_insensitive_username_field = '{}__iexact'.format(self.model.USERNAME_FIELD)
        return self.get(**{case_insensitive_username_field: username})

class AppUser(AbstractUser):
    objects = AppUserManager()
