# Generated by Django 2.1.7 on 2019-03-31 17:39

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Visitor',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('hour_visit', models.CharField(max_length=10)),
                ('face', models.ImageField(upload_to='faces')),
            ],
            options={
                'ordering': ['-name'],
            },
        ),
    ]
