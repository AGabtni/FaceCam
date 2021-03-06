# Generated by Django 2.1.7 on 2019-04-17 02:02

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('userInterface', '0002_auto_20190331_1433'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='visitor',
            options={'ordering': ['visit_date']},
        ),
        migrations.AddField(
            model_name='visitor',
            name='author',
            field=models.ForeignKey(default=0, on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]
