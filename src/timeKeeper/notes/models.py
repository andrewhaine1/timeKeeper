from django.db import models

from timeKeeper.models import ModelBase
from timeKeeper.models import AppUser

# Create your models here.
class Note(ModelBase):
    title = models.CharField(max_length=100)
    text = models.CharField(max_length=1000)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True)
    owner = models.ForeignKey(AppUser, on_delete=models.CASCADE)
    def __str__(self):
        return '{}'.format(self.title)