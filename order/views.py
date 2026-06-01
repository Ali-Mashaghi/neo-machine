from django.shortcuts import render, get_object_or_404, redirect
from django.views import generic
from .models import OrderModel, Service, CNCData, Anodizingdata, LaserHackData
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse


# Create your views here.
class panel(generic.ListView, LoginRequiredMixin):
    model = OrderModel
    template_name = 'panel.html'
    context_object_name = 'orders'

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(is_archived=False)

    def get_ordering(self):
        sort = self.request.GET.get('sort', '-created_date')
        allowed = {
            'created_date': 'created_date',
            '-created_date': '-created_date',
            'customer_name': 'customer_name',
            'service': 'service__service',
            'piece_count': 'piece_count',
            'phone': 'phone',
        }
        return allowed.get(sort, '-created_date')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['current_sort'] = self.request.GET.get('sort', '-created_date')
        return context

class ArchivedPanelView(generic.ListView, LoginRequiredMixin):
    model = OrderModel
    template_name = 'archive_panel.html'
    context_object_name = 'orders'

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(is_archived=True)

    def get_ordering(self):
        sort = self.request.GET.get('sort', '-created_date')
        allowed = {
            'created_date': 'created_date',
            '-created_date': '-created_date',
            'customer_name': 'customer_name',
            'service': 'service__service',
            'piece_count': 'piece_count',
            'phone': 'phone',
        }
        return allowed.get(sort, '-created_date')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['current_sort'] = self.request.GET.get('sort', '-created_date')
        return context


class OrderDetailView(LoginRequiredMixin, generic.DetailView):
    model = OrderModel
    template_name = 'order_detail.html'
    context_object_name = 'order'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        file_url = self.object.order_document.url if self.object.order_document else None
        context['file_url'] = file_url
        # simple image check based on extension for preview
        is_image = False
        if file_url:
            lower = file_url.lower()
            if lower.endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg')):
                is_image = True
        context['is_image'] = is_image
        context['file_name'] = self.object.order_document.name if self.object.order_document else ''
        return context


def update_order_status(request, pk):
    order = get_object_or_404(OrderModel, pk=pk)
    if request.method != 'POST':
        return redirect(reverse('order_detail', args=[pk]))

    status = request.POST.get('status')
    if status in ['pending', 'done']:
        order.status = status
        order.is_archived = status == 'done'
        order.save()

    return redirect(reverse('order_detail', args=[pk]))


def homepage(request):
    return render(request, template_name='home.html')


@csrf_exempt
def upload(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'روش نامعتبر'}, status=400)

    service_type = request.POST.get('service_type')
    if not service_type:
        return JsonResponse({'success': False, 'error': 'خدمت انتخاب نشده است'}, status=400)

    service_map = {
        'cnc_turning': 'CNC تراشکاری',
        'cnc_milling': 'CNC فرزکاری',
        'anodizing': 'Anodizing',
        'laser_engraving': 'Laser hack',
    }
    service_name = service_map.get(service_type, service_type)
    service_obj, _ = Service.objects.get_or_create(service=service_name)

    customer_name = request.POST.get('customer_name', '').strip()
    phone = request.POST.get('customer_phone', '').strip()
    quantity = int(request.POST.get('quantity') or 1)
    material = request.POST.get('material', '').strip()
    description = request.POST.get('description', '').strip()
    file_field = request.FILES.get('file')

    if not customer_name or not phone or not material or not file_field:
        return JsonResponse({'success': False, 'error': 'اطلاعات سفارش ناقص است'}, status=400)

    order = OrderModel.objects.create(
        customer_name=customer_name,
        phone=phone,
        service=service_obj,
        piece_count=quantity,
        additional_description=description,
        order_document=file_field,
    )

    order_data = {
        'order_number': order.id,
        'customer_name': customer_name,
        'service': service_type,
        'filename': file_field.name,
        'quantity': quantity,
        'material_text': material,
        'anodizing_color': '',
        'part_shape': '',
        'surface_finish': '',
        'laser_depth': '',
        'price_formatted': '',
        'unit_price_after_discount': 0,
        'estimated_days': 0,
        'discount_percent': 0,
    }

    if service_type == 'anodizing':
        anodizing_shape = request.POST.get('part_shape', '')
        surface_finish = request.POST.get('surface_finish', '')
        anodizing_color = request.POST.get('anodizing_color', '')
        width = int(float(request.POST.get('length') or 0))
        height = int(float(request.POST.get('height') or 0))
        width_mm = int(float(request.POST.get('width') or width or 0))
        length_mm = width
        if anodizing_shape == 'hollow_box':
            length_mm = int(float(request.POST.get('outer_length') or 0))
            width_mm = int(float(request.POST.get('outer_width') or 0))
            height = int(float(request.POST.get('outer_height') or 0))
        elif anodizing_shape == 'solid_cylinder' or anodizing_shape == 'hollow_cylinder':
            length_mm = int(float(request.POST.get('length') or 0))
            width_mm = length_mm
            height = int(float(request.POST.get('height') or 0))

        Anodizingdata.objects.create(
            order=order,
            material=material,
            anodizing_shape=anodizing_shape,
            PardakhtSath=surface_finish,
            color=anodizing_color,
            width_mm=width_mm,
            Lenght_mm=length_mm,
            height_mm=height,
        )

        unit_price = 25000
        discount_percent = 0
        if quantity >= 20:
            discount_percent = 10
        elif quantity >= 10:
            discount_percent = 5
        unit_price_after_discount = int(unit_price * (100 - discount_percent) / 100)
        total_price = quantity * unit_price_after_discount

        order_data.update({
            'anodizing_color': anodizing_color,
            'part_shape': anodizing_shape,
            'surface_finish': surface_finish,
            'price_formatted': f"{total_price:,}",
            'unit_price_after_discount': unit_price_after_discount,
            'estimated_days': 6,
            'discount_percent': discount_percent,
        })

    elif service_type in ['cnc_turning', 'cnc_milling']:
        width_mm = int(float(request.POST.get('width') or 0))
        length_mm = int(float(request.POST.get('length') or 0))
        height_mm = int(float(request.POST.get('height') or 0))
        CNCData.objects.create(
            order=order,
            material=material,
            width_mm=width_mm,
            Lenght_mm=length_mm,
            height_mm=height_mm,
        )
        order_data.update({
            'estimated_days': 3,
        })

    elif service_type == 'laser_engraving':
        width_mm = int(float(request.POST.get('width') or 0))
        length_mm = int(float(request.POST.get('length') or 0))
        engraving_depth = request.POST.get('laser_depth', '')
        depth_mapping = {
            'shallow': 'سطحی',
            'medium': 'نیمه عمیق',
            'deep': 'عمیق',
        }
        LaserHackData.objects.create(
            order=order,
            material=material,
            width_mm=width_mm,
            Lenght_mm=length_mm,
            Engraving_depth=depth_mapping.get(engraving_depth, engraving_depth),
        )

        unit_price = 22000
        discount_percent = 0
        if quantity >= 20:
            discount_percent = 10
        elif quantity >= 10:
            discount_percent = 5
        unit_price_after_discount = int(unit_price * (100 - discount_percent) / 100)
        total_price = quantity * unit_price_after_discount

        order_data.update({
            'laser_depth': engraving_depth,
            'price_formatted': f"{total_price:,}",
            'unit_price_after_discount': unit_price_after_discount,
            'estimated_days': 4,
            'discount_percent': discount_percent,
        })

    return JsonResponse({'success': True, **order_data})


    