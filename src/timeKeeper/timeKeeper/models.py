from django.db import models

class ModelBase(models.Model):
    date_created = models.DateTimeField(auto_now_add=True, blank=False)
    date_updated = models.DateTimeField(auto_now_add=True, blank=False)