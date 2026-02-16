from enum import Enum
from dataclasses import asdict
import importlib
import json
import subprocess
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest, HttpResponseServerError
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import LibraryRegistration
from webcligui_api import ParameterList, ParameterOptionsToList, ParameterPreference, ParameterStringValue

libraryApis = []
library2Idx = {}

def instantiateLibraryModule(obj):
    module = importlib.import_module(obj.module_path)
    cls = getattr(module, obj.class_name)
    libraryAPIImpl = cls()
    return libraryAPIImpl

def load_library_apis():
  global libraryApis, library2Idx
  if len(libraryApis) > 0:
      return

  for idx, obj in enumerate(LibraryRegistration.objects.all()):
    libraryAPIImpl = instantiateLibraryModule(obj)
    libraryApis.append(libraryAPIImpl)  
    library2Idx[obj.library_name] = idx

def to_json_safe(obj):
    if isinstance(obj, Enum):
        return obj.value
    if isinstance(obj, list):
        return [to_json_safe(idx) for idx in obj]
    if isinstance(obj, dict):
        return {key: to_json_safe(value) for key, value in obj.items()}
    return obj

@api_view(['GET'])
def get_operation_hierarchy(request):
  load_library_apis()
  operations = []

  for libraryAPIImpl in libraryApis:
    hierarchy = libraryAPIImpl.getOperationHierarchy()
    dict = to_json_safe(asdict(hierarchy))
    operations.append(dict)

  return JsonResponse(operations, safe=False)

def getLibraryApi(libraryName):
  global libraryApiImpl, library2Idx
  load_library_apis()
   
  if not libraryName in library2Idx:
    return None
  
  idx = library2Idx[libraryName]
  libraryApiImpl = libraryApis[idx]
  return libraryApiImpl

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_description(request):
  body = json.loads(request.body)
  libraryName = body["operationBranch"][0]
  libraryApiImpl = getLibraryApi(libraryName)
  if not libraryApiImpl:
    errMsg = f'Libraryname "{libraryName}" not known!'
    print('get_description():', errMsg)
    return HttpResponseBadRequest(errMsg)

  operationBranch = body["operationBranch"][1:]
  description = libraryApiImpl.getDescription(operationBranch)

  return JsonResponse(description, safe=False)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_parameters(request):
  body = json.loads(request.body)
  libraryName = body["operationBranch"][0]
  libraryApiImpl = getLibraryApi(libraryName)
  if not libraryApiImpl:
    errMsg = f'Libraryname "{libraryName}" not known!'
    print('get_parameters():', errMsg)
    return HttpResponseBadRequest(errMsg)

  operationBranch = body["operationBranch"][1:]
  parameterData = libraryApiImpl.getParameters(operationBranch)
  parameters = to_json_safe(asdict(parameterData))

  return JsonResponse(parameters, safe=False)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def submit_operation(request):
  body = json.loads(request.body)
  command = body['command']
  servers = body["servers"]

  print('command:', command, 'servers:', servers)
  fullCommand = command + ['localhost']
  print('fullCommand:', fullCommand)
  try:
     subprocess.run(fullCommand, check=True)
  except Exception as exc:
     print('Exception:', exc)
     return HttpResponseServerError(str(exc));

  return HttpResponse('OK')
