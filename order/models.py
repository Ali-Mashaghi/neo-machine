from django.db import models
from django.conf import settings
import os
import uuid




# مسیر بارگذاری فایل را با شناسه یکتا بهینه می‌کنیم

def order_file_path(instance, filename):
    name, ext = os.path.splitext(filename)
    return f'orders/{uuid.uuid4().hex}{ext}'



# Create your models here.
class Service(models.Model):
    SERVICE_CHOICES = [
        ('CNC تراشکاری', 'CNC تراشکاری'),
        ('CNC فرزکاری', 'CNC فرزکاری'),
        ('Anodizing', 'Anodizing'),
        ('Laser hack', 'Laser hack'),
    ]
    service = models.CharField(choices=SERVICE_CHOICES ,
                                blank= False ,
                                max_length=100)

    def __str__(self):
        return self.service


class OrderModel(models.Model):

    customer_name = models.CharField(max_length=250)
    phone = models.CharField(max_length=12  )
    
    service = models.ForeignKey(Service ,on_delete= models.CASCADE , related_name='orders')

    piece_count = models.PositiveIntegerField(
        default=1,
        verbose_name='تعداد قطعه'
    )

    additional_description = models.TextField(
        blank=True,
        null=True,
        verbose_name='توضیحات اضافی'
    )

    order_document = models.FileField(
        upload_to=order_file_path,
        blank=False,
        verbose_name="فایل سفارش"
    )

    ORDER_STATUS_CHOICES = [
        ('pending', 'در حال انجام'),
        ('done', 'تمام شده'),
    ]

    status = models.CharField(
        max_length=20,
        choices=ORDER_STATUS_CHOICES,
        default='pending',
        verbose_name='وضعیت سفارش'
    )

    is_archived = models.BooleanField(
        default=False,
        verbose_name='آرشیو شده'
    )

    created_date = models.DateField(auto_now_add=True, verbose_name="تاریخ ثبت")
    update_date = models.DateField(auto_now=True, verbose_name="تاریخ ویرایش")

    class Meta:
        verbose_name = 'سفارش'
        verbose_name_plural = 'سفارش‌ها'

    def __str__(self):
        return f"سفارش {self.customer_name}"

    def save(self, *args, **kwargs):
        self.is_archived = self.status == 'done'
        super().save(*args, **kwargs)

    @property
    def material(self):
        if hasattr(self, 'Anodizing_data'):
            return self.Anodizing_data.material
        if hasattr(self, 'CNC_data'):
            return self.CNC_data.material
        if hasattr(self, 'LaserHack_data'):
            return self.LaserHack_data.material
        return ''

    @property
    def detail_summary(self):
        if hasattr(self, 'Anodizing_data'):
            anod = self.Anodizing_data
            details = [
                f"متریال: {anod.material}",
                f"رنگ: {anod.color}",
                f"شکل: {anod.anodizing_shape}",
                f"پرداخت: {anod.PardakhtSath}",
                f"ابعاد: {anod.width_mm}×{anod.Lenght_mm}×{anod.height_mm} mm",
            ]
            return ' - '.join([item for item in details if item])
        if hasattr(self, 'CNC_data'):
            cnc = self.CNC_data
            return f"متریال: {cnc.material} - ابعاد: {cnc.width_mm}×{cnc.Lenght_mm}×{cnc.height_mm} mm"
        if hasattr(self, 'LaserHack_data'):
            laser = self.LaserHack_data
            return f"متریال: {laser.material} - عمق حکاکی: {laser.Engraving_depth} - ابعاد: {laser.width_mm}×{laser.Lenght_mm} mm"
        return ''


###########
# Anodizing
###########

class Anodizingdata(models.Model):

    ANODIZING_SHAPE = [

    ('', 'انتخاب کنید'),
    ('مکعب توپر', 'مکعب توپر'),
    ('باکس توخالی(بدون یک وجه)', 'باکس توخالی(بدون یک وجه)'),
    ('استوانه توپر', 'استوانه توپر'),
    ('استوانه توخالی', 'استوانه توخالی'),
    ]
    anodizing_shape = models.CharField(
        max_length=80,
        choices=ANODIZING_SHAPE,
        default='', 
        verbose_name=' شکل آنودایزینگ'
    )

    MATERIAL_CHOICES = [
    ('', 'انتخاب کنید'),
    ('aluminium 1050', '1050 آلومینیوم'),
    ('aluminium 2024', '1050 آلومینیوم'),
    ('aluminium 3105', '1050 آلومینیوم'),
    ('aluminium 5052', '1050 آلومینیوم'),
    ('aluminium 6061', '1050 آلومینیوم'),
    ('aluminium 6063', '1050 آلومینیوم'),
    ('aluminium 7075', '1050 آلومینیوم'),
    ('titanium Grade 2', 'Grade 2 تیتانیوم '),
    ('titanium Grade 5 (Ti-6Al-4v)', 'Grade 5 (Ti-6Al-4v) تیتانیوم '),
    ('titanium Grade 23 (Ti-6Al-4v-ELI)', 'Grade 23 (Ti-6Al-4v-ELI) تیتانیوم '),

    ]
    material = models.CharField(
        max_length=50,
        choices=MATERIAL_CHOICES,
        default='', 
        verbose_name='نوع متریال'
    )

    PARDAKHT_SATH = [
    ('', 'انتخاب کنید'),
    ('(Glossy) براق', '(Glossy) براق'),
    ('(Matte) مات', '(Matte) مات'),

    ]

    PardakhtSath = models.CharField(
        max_length=80,
        choices=PARDAKHT_SATH,
        default='', 
        verbose_name=' شکل آنودایزینگ'
    )
    COLOR_CHOICES = [
        ('green', 'سبز'),
        ('blue', 'آبی'),
        ('red', 'قرمز'),
        ('silver', 'سیلور'),
        ('purple_blue', 'بنفش آبی'),
        ('purple_red', 'بنفش قرمز'),
        ('gold', 'طلایی'),
        ('black', 'مشکی'),
        ('black_hard', 'مشکی هارد'),
        ('olive_hard', 'زیتونی هارد'),
    ]

    color = models.CharField(
    max_length=20,
    choices=COLOR_CHOICES,
    verbose_name='رنگ')


    width_mm = models.PositiveIntegerField(
        verbose_name='عرض (mm)'
    )
    Lenght_mm = models.PositiveIntegerField(
        verbose_name='طول (mm)'
    )

    height_mm = models.PositiveIntegerField(
        verbose_name='ارتفاع (mm)'
    )   




    order = models.OneToOneField(OrderModel, related_name='Anodizing_data', on_delete=models.CASCADE)

    def __str__(self):
        return F"Anadizing {self.order.id} "



###########
# CNC
###########

class CNCData(models.Model):

    order = models.OneToOneField(OrderModel, related_name='CNC_data', on_delete=models.CASCADE)


    #material
    MATERIAL_CHOICES = [
    ('', 'انتخاب کنید'),
    ('aluminium', 'آلومینیوم'),
    ('plain_steel', 'فولاد ساده'),
    ('stainless_steel', 'استنلس استیل'),
    ('brass', 'برنج'),
    ('copper', 'مس'),
    ('titanium', 'تیتانیوم'),
    ('plastic', 'پلاستیک'),
    ('wood', 'چوب'),
    ('other', 'سایر مواد'),
    ]
    material = models.CharField(
        max_length=50,
        choices=MATERIAL_CHOICES,
        default='', 
        verbose_name='نوع متریال'
    )

    #dimensions
    width_mm = models.PositiveIntegerField(
        verbose_name='عرض (mm)'
    )
    Lenght_mm = models.PositiveIntegerField(
        verbose_name='طول (mm)'
    )

    height_mm = models.PositiveIntegerField(
        verbose_name='ارتفاع (mm)'
    )   

    def __str__(self):
        return F"CNC {self.order.id} "
    
###########
# LaserHack
###########
class LaserHackData(models.Model):
    order = models.OneToOneField(OrderModel, related_name='LaserHack_data', on_delete=models.CASCADE)

    #material
    MATERIAL_CHOICES = [
    ('', 'انتخاب کنید'),
    ('aluminium', 'آلومینیوم'),
    ('plain_steel', 'فولاد ساده'),
    ('stainless_steel', 'استنلس استیل'),
    ('brass', 'برنج'),
    ('copper', 'مس'),
    ('titanium', 'تیتانیوم'),
    ('plastic', 'پلاستیک'),
    ('wood', 'چوب'),
    ('other', 'سایر مواد'),
    ]
    material = models.CharField(
        max_length=50,
        choices=MATERIAL_CHOICES,
        default='', 
        verbose_name='نوع متریال'
    )


    #dimensions
    width_mm = models.PositiveIntegerField(
        verbose_name='عرض (mm)'
    )
    Lenght_mm = models.PositiveIntegerField(
        verbose_name='طول (mm)'
    )

    ENGRAVING_DEPTH =[('سطحی', 'سطحی'), 
                      ('نیمه عمیق', 'نیمه عمیق'),
                        ('عمیق', 'عمیق')]
    
    Engraving_depth = models.CharField(
        choices= ENGRAVING_DEPTH , 
        max_length= 40,
        default= ''
    )
    def __str__(self):
        return F"LaserHack {self.order.id} "
    

