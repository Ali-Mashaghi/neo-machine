from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from order.views import homepage, upload

urlpatterns = [
    path('admin/', admin.site.urls),
    path('panel/', include('order.urls')),
    path('upload/', upload),
    path('', view=homepage),
    path('login/', include('accounts.urls')),
    path('accounts/', include('accounts.urls')),
    path('api/', include('order.api_urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
