from datetime import datetime, timedelta
from enum import Enum
from dataclasses import asdict
import importlib
import json
import os
from time import sleep
from django.conf import settings
from django.contrib.auth import authenticate
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseServerError
from django.http import HttpResponseForbidden, HttpResponseNotFound, JsonResponse
from django.utils.html import escape
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from .constants import OPERATION_ROOT_DIRECTORY
from .models import LibraryRegistration, Status
from .OperationHandling import OperationHandling

libraryApis = []
library2Idx = {}   # Mapping from library_name to libraryApiImpl in libraryApis

operationHandling = None


def get_operation_handling():
  global operationHandling
  if operationHandling is None:
    operationHandling = OperationHandling()
  return operationHandling

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
    if isinstance(obj, datetime):
       return obj.isoformat()
    if isinstance(obj, timedelta):
       return obj.total_seconds()
    if isinstance(obj, list):
        return [to_json_safe(idx) for idx in obj]
    if isinstance(obj, dict):
        return {key: to_json_safe(value) for key, value in obj.items()}
    return obj

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def login(request):
  try:
    body = json.loads(request.body)
    username = body.get('username')
    password = body.get('password')
    user = authenticate(request, username=username, password=password)
    if user is None:
      return HttpResponse('Invalid username/password', status=401)

    refresh = RefreshToken.for_user(user)
    response = JsonResponse({'access': str(refresh.access_token)})
    refresh_lifetime = settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']
    response.set_cookie(
      'refresh_token',
      str(refresh),
      max_age=int(refresh_lifetime.total_seconds()),
      httponly=True,
      secure=False,  # Set to False temporarely until we use https
      samesite='Strict',
    )
    return response

  except Exception as exc:
    print('login(), exception:', exc)
    return HttpResponseServerError(str(exc))

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def logout(request):
  try:
    raw_refresh = request.COOKIES.get('refresh_token')
    if raw_refresh:
      token = RefreshToken(raw_refresh)
      token.blacklist()
    response = JsonResponse({'detail': 'logged out'})
    response.delete_cookie('refresh_token')
    return response
  
  except TokenError:
    response = JsonResponse({'detail': 'logged out'})
    response.delete_cookie('refresh_token')
    return response
  except Exception as exc:
    print('logout(), exception:', exc)
    return HttpResponseServerError(str(exc))

@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_access_token(request):
  try:
    raw_refresh = request.COOKIES.get('refresh_token')
    if not raw_refresh:
      return HttpResponseForbidden('No refresh token cookie')
    refresh = RefreshToken(raw_refresh)
    return JsonResponse({'access': str(refresh.access_token)})

  except TokenError as exc:
    return HttpResponseForbidden(str(exc))
  except Exception as exc:
    print('get_access_token(), exception:', exc)
    return HttpResponseServerError(str(exc))

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_operation_hierarchy(request):
  try:
    load_library_apis()
    operations = []

    for libraryAPIImpl in libraryApis:
      hierarchy = libraryAPIImpl.getOperationHierarchy()
      dict = to_json_safe(asdict(hierarchy))
      operations.append(dict)

    return JsonResponse(operations, safe=False)
  
  except Exception as exc:
     print('get_operation_hierarchy(), exception:', exc)
     return HttpResponseServerError(str(exc))

def getLibraryApi(libraryName):
  global libraryApiImpl, library2Idx
  load_library_apis()
   
  if not libraryName in library2Idx:
    return None
  
  idx = library2Idx[libraryName]
  libraryApiImpl = libraryApis[idx]
  return libraryApiImpl

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_description(request):
  try:
    body = json.loads(request.body)
    libraryName = body["operationBranch"][0]
    libraryApiImpl = getLibraryApi(libraryName)
    if not libraryApiImpl:
      errMsg = f'Libraryname "{libraryName}" not known!'
      print('get_description():', errMsg)
      return HttpResponseBadRequest(errMsg)

    operationBranch = body["operationBranch"][1:]
    description = libraryApiImpl.getDescription(operationBranch)
    if not description:
       raise Exception(f'No description for {operationBranch}')

    return JsonResponse(description, safe=False)
  
  except Exception as exc:
     print('get_description(), exception:', exc)
     return HttpResponseServerError(str(exc))

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_parameters(request):
  try:
    body = json.loads(request.body)
    libraryName = body["operationBranch"][0]
    libraryApiImpl = getLibraryApi(libraryName)
    if not libraryApiImpl:
      errMsg = f'Libraryname "{libraryName}" not known!'
      print('get_parameters():', errMsg)
      return HttpResponseBadRequest(errMsg)

    operationBranch = body["operationBranch"][1:]
    parameterData = libraryApiImpl.getParameters(operationBranch) 
    paramDict = asdict(parameterData) if parameterData is not None else {}
    parameters = to_json_safe(paramDict)

    return JsonResponse(parameters, safe=False)

  except Exception as exc:
     print('get_parameters(), exception:', exc)
     return HttpResponseServerError(str(exc))

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def submit_operation(request):
  try:
    body = json.loads(request.body)
    libraryName = body["operation_branch"][0]
    libraryApiImpl = getLibraryApi(libraryName)
    if not libraryApiImpl:
      errMsg = f'Libraryname "{libraryName}" not known!'
      print('api.py--submit_operation():', errMsg)
      return HttpResponseBadRequest(errMsg)

    operationBranch = body["operation_branch"]
    command = body['command']
    servers = body["servers"]

    print(f"api.py--submit_operation(): libraryName={libraryName}, operationBranch={operationBranch}")
    print(f"command={command}, servers={servers}")

    operationStatus = get_operation_handling().submitOperation(
      libraryApiImpl, operationBranch, command, servers
    )
    print('operationStatus:', operationStatus)

    operationStatusDict = asdict(operationStatus)
    operationStatusSafe = to_json_safe(operationStatusDict)

    return JsonResponse(operationStatusSafe, safe=False)

  except Exception as exc:
     print('submit_operation(), exception:', exc)
     return HttpResponseServerError(str(exc))

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_operation_status_list(request):
  try:
    offset = int(request.query_params.get("offset", 0))
    limit = int(request.query_params.get("limit", 25))

    qs = Status.objects.order_by('-start_time')
    objects = qs[offset:offset + limit]
    num_status = qs.count()

    data = {
        "total_num_status": num_status,
        "offset": offset,
        "status_data": [
            {
                "uuid": obj.id,
                "operation_branch": obj.operation_branch,
                "start_time": obj.start_time,
                "elapsed_time": obj.elapsed_time,
                "status": obj.status,
                "folder": obj.directory,
            }
            for obj in objects
        ]
    }
    dataSafe = to_json_safe(data)
    return JsonResponse(dataSafe)

  except Exception as exc:
     print('get_operation_status_list(), exception:', exc)
     return HttpResponseServerError(str(exc))

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def folder_access(request, path):
  try:
    full_path = (OPERATION_ROOT_DIRECTORY / path).resolve()
    if not str(full_path).startswith(str(OPERATION_ROOT_DIRECTORY)):
      errMsg = f"{path} is not allowed"
      return HttpResponseForbidden(errMsg)
       
    if not os.path.exists(full_path):
      errMsg= f"{path} not found"
      return HttpResponseNotFound(errMsg)

    if os.path.isfile(full_path):
      with open(full_path, "r") as f:
        content = f.read()
      return HttpResponse(f"<pre>{escape(content)}</pre>")
    
    file_list = []
    files = os.listdir(full_path)
    for name in files:
        file_path = os.path.join(path, name)
        file_list.append(f'<li><a href="{file_path}">{name}</a></li>')

    folder_page = f'<h3 style="margin: 25px; font-weight: 500">Folder {path}</h3>\n';
    folder_page += "<ul>" + "".join(file_list) + "</ul>"
    return HttpResponse(folder_page)
  
  except Exception as exc:
     print('folder_access(), exception:', exc)
     return HttpResponseServerError(str(exc))
