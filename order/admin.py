from django.contrib import admin
from .models import OrderModel , Anodizingdata,CNCData,LaserHackData,Service
# Register your models here.

@admin.register(OrderModel)
class OrderAdmin(admin.ModelAdmin):
        
    list_filter = (
        'created_date',
    )

    search_fields = (
        'customer_name',
    )

    ordering = (
        'created_date',
    )

    list_per_page = 25


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('service',)
    list_filter = ('service',)
    search_fields = ('service',)

@admin.register(Anodizingdata)
class AnodizingdataAdmin(admin.ModelAdmin):
    pass

@admin.register(CNCData)
class CNCDataAdmin(admin.ModelAdmin):
    pass

@admin.register(LaserHackData)
class LaserHackDataAdmin(admin.ModelAdmin):
    pass