from django.http import HttpResponse, JsonResponse
from rest_framework.decorators import api_view

@api_view(['GET'])
def get_hello_world(request):
  return JsonResponse({"value": "Hello, world!"})
