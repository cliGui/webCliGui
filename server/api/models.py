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

class Status(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)  
    operation_branch = models.JSONField(default=list)
    start_time = models.DateTimeField()
    elapsed_time = models.DurationField(null=True, blank=True)  
    status = models.CharField(max_length=128)
    directory = models.CharField(max_length=512)

    def __str__(self):
      return f"{self.operation_branch} {self.start_time} {self.status}"
    