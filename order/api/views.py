from rest_framework.viewsets import ModelViewSet
from ..models import OrderModel
from ..serializer import OrderSerializer


class OrderViewSet(ModelViewSet):
    queryset = OrderModel.objects.all()
    serializer_class = OrderSerializer