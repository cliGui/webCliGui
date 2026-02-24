"""
URL configuration for webCliGui project.
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include("api.urls")),

    # OpenAPI 3 Schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),

    # Optional: Swagger UI web interface
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Optional: ReDoc web interface
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

]
