# Generated by Django 4.1 on 2022-10-18 07:54

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('notes', '0002_alter_note_parent'),
    ]

    operations = [
        migrations.AlterField(
            model_name='note',
            name='parent',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='notes.note'),
        ),
    ]