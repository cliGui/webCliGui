from django.contrib import admin
from .models import *

class adminLibraryRegistration(admin.ModelAdmin):
    fieldsets = [('LibraryRegistration', {'fields': ['library_name', 'module_path', 'class_name', 'description']})]
    list_display = ['library_name', 'module_path', 'class_name', 'description']

admin.site.register(LibraryRegistration, adminLibraryRegistration)
