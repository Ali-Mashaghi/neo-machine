from django.urls import path
from order.views import panel, ArchivedPanelView, OrderDetailView, update_order_status

urlpatterns = [
    path('', panel.as_view(), name='panel'),
    path('archived/', ArchivedPanelView.as_view(), name='archive_panel'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order_detail'),
    path('<int:pk>/status/', update_order_status, name='order_update_status'),
]