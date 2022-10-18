from django.db import models

from timeKeeper.models import ModelBase

# Create your models here.
class Note(ModelBase):
    title = models.CharField(max_length=100)
    text = models.CharField(max_length=1000)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True)
    def __str__(self):
        return '{}'.format(self.title)