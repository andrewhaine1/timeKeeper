from django.urls import path

from . import views

app_name = 'notes'
urlpatterns = [
    
    path('', views.index, name='index'),
    path('<int:note_id>/', views.details, name='details'),
    path('create/', views.create, name='create'),
    path('edit/<int:note_id>/', views.edit, name='edit'),
    path('delete/<int:note_id>/', views.delete, name='delete')
]