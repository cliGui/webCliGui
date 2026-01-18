from django.urls import path
from . import api

urlpatterns = [
  path("get-operation-hierarchy", api.get_operation_hierarchy, name="get-operation-hierarchy"),
]
