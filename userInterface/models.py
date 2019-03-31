from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse


class Visitor (models.Model) :

    name = models.CharField(max_length=255)
    face = models.ImageField(upload_to='faces')
    visit_date = models.DateTimeField(blank=True, null=True)
    # Metadata
    class Meta:
        ordering = ['-name']

    # Methods :
    def get_absolute_url(self):
        """Returns the url to access a particular instance of MyModelName."""
        return reverse('model-detail-view', args=[str(self.id)])

    def __str__(self):
        """String for representing the MyModelName object (in Admin site etc.)."""
        return self.name

