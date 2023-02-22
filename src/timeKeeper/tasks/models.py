from django.db import models

from timeKeeper.models import ModelBase
from timeKeeper.models import AppUser


# Create your models here.

#-------------------------------------- Tasks -------------------------------------- #
class TaskBase(ModelBase):
    pass

class TaskStatus(models.Model):
    class Meta:
        verbose_name_plural = "Task status"
    status = models.CharField(max_length=30)
    def __str__(self):
        return '{}'.format(self.status)

class Task(TaskBase):
    short_description = models.CharField(max_length=30)
    full_description = models.CharField(max_length=1000)
    task_status = models.ForeignKey(TaskStatus, on_delete=models.RESTRICT)
    due_date = models.DateTimeField(auto_now_add=False, blank=False)
    owner = models.ForeignKey(AppUser, on_delete=models.CASCADE)
    def __str__(self):
        return '{}'.format(self.short_description)
