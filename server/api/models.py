from django.db import models

class LibraryRegistration(models.Model):
    library_name = models.CharField(max_length=100)
    module_path = models.CharField(max_length=255)
    class_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    class Meta:
        unique_together = ("module_path", "class_name")

    def __str__(self):
        return f"library {self.library_name}: {self.module_path}.{self.class_name}"
