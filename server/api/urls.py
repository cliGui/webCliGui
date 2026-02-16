from django.urls import path
from . import api

urlpatterns = [
  path("get-operation-hierarchy", api.get_operation_hierarchy, name="get-operation-hierarchy"),
  path("get-description", api.get_description, name="get-description"),
  path("get-parameters", api.get_parameters, name="get-parameters"),
  path("submit-operation", api.submit_operation, name="submit-operation"),
]
