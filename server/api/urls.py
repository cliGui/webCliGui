from django.urls import path
from . import api

urlpatterns = [
  path("login", api.login, name="login"),
  path("logout", api.logout, name="logout"),
  path("get-access-token", api.get_access_token, name="get-access-token"),
  path("get-operation-hierarchy", api.get_operation_hierarchy, name="get-operation-hierarchy"),
  path("get-description", api.get_description, name="get-description"),
  path("get-parameters", api.get_parameters, name="get-parameters"),
  path("submit-operation", api.submit_operation, name="submit-operation"),
  path("get-operation-status-list", api.get_operation_status_list, name="get-operation-status-list"),
  path("folder-access/<path:path>", api.folder_access, name="folder-access"),
]
