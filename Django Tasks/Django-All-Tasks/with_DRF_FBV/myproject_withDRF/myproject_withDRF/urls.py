from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/blog/', include('blog.urls')),
    path('api/catalog/', include('catalog.urls')),
    path('api/school/', include('school.urls')),
    path('api/library/', include('library.urls')),
    path('api/event/', include('event.urls'))





]
