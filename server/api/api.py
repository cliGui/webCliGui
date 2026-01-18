import importlib
from django.http import JsonResponse
from rest_framework.decorators import api_view
from .models import LibraryRegistration

@api_view(['GET'])
def get_operation_hierarchy(request):
  operations = []

  for obj in LibraryRegistration.objects.all():
    module = importlib.import_module(obj.module_path)
    cls = getattr(module, obj.class_name)
    libraryAPIImpl = cls()
    hierarchy = libraryAPIImpl.getOperationHierarchy()
    dict = hierarchy.to_dict()
    operations.append(dict)

  return JsonResponse(
      operations,
      safe=False
  )
