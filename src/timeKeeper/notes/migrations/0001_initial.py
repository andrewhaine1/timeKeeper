# Generated by Django 4.1 on 2022-10-18 07:41

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('timeKeeper', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Note',
            fields=[
                ('modelbase_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='timeKeeper.modelbase')),
                ('title', models.CharField(max_length=100)),
                ('text', models.CharField(max_length=1000)),
                ('parent', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='notes.note')),
            ],
            bases=('timeKeeper.modelbase',),
        ),
    ]