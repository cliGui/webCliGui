from django.urls import path
from . import api

urlpatterns = [
  path("hello-world", api.get_hello_world, name="hello-world"),
]
