from django.contrib import admin
from .models import *

class adminLibraryRegistration(admin.ModelAdmin):
    fieldsets = [('LibraryRegistration', {'fields': ['library_name', 'module_path', 'class_name', 'description']})]
    list_display = ['library_name', 'module_path', 'class_name', 'description']

class adminStatus(admin.ModelAdmin):
    fieldsets = [('Status', {'fields': ['id', 'operation_branch', 'start_time', 'elapsed_time', 'status', 'directory']})]
    list_display = ['id', 'operation_branch', 'start_time', 'elapsed_time', 'status', 'directory']

admin.site.register(LibraryRegistration, adminLibraryRegistration)
admin.site.register(Status, adminStatus)
