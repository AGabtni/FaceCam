# Generated by Django 2.1.7 on 2019-04-17 02:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('userInterface', '0003_auto_20190416_2202'),
    ]

    operations = [
        migrations.AlterField(
            model_name='visitor',
            name='face',
            field=models.CharField(max_length=255),
        ),
    ]
