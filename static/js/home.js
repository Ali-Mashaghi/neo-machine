const clients = [
    { name: "سایپا", logo: "/static/images/saipa.png" },
    { name: "ایران خودرو", logo: "/static/images/ikco.png" },
    { name: "گلرنگ", logo: "/static/images/golrang.png" },
    { name: "فولاد مبارکه", logo: "/static/images/mobarakeh.png" },
    { name: "توسعه صنایع", logo: "/static/images/tosehe.png" },
    { name: "الکترو صنعت", logo: "/static/images/electro.png" },
    { name: "پارس خودرو", logo: "/static/images/pars.png" },
    { name: "مگا موتور", logo: "/static/images/mega.png" }
];

const clientsGrid = document.getElementById('clientsGrid');
if (clientsGrid) {
    clients.forEach(client => {
        const clientDiv = document.createElement('div');
        clientDiv.className = 'client-item';
        clientDiv.innerHTML = `
            <img src="${client.logo}" alt="${client.name}" class="client-logo" onerror="this.src='https://via.placeholder.com/70'">
        `;
        clientsGrid.appendChild(clientDiv);
    });
}

let selectedService = null;
let selectedFile = null;
let selectedColor = '';
let currentShape = '';
let currentOrderNumber = '';
let isUploading = false;

function downloadReceipt() {
    if (currentOrderNumber) {
        window.location.href = `/download-receipt/${currentOrderNumber}`;
    }
}

function toggleLaserFields() {
    const laserParamsGroup = document.getElementById('laserParamsGroup');
    if (laserParamsGroup) {
        if (selectedService === 'laser_engraving') {
            laserParamsGroup.style.display = 'block';
        } else {
            laserParamsGroup.style.display = 'none';
        }
    }
}

function toggleAnodizingFields() {
    const anodizingColorGroup = document.getElementById('anodizingColorGroup');
    const anodizingParamsGroup = document.getElementById('anodizingParamsGroup');
    const materialSelect = document.getElementById('material');
    const anodizingRequiredStar = document.getElementById('anodizingRequiredStar');
    
    if (selectedService === 'anodizing') {
        anodizingColorGroup.style.display = 'block';
        anodizingParamsGroup.style.display = 'block';
        if (anodizingRequiredStar) anodizingRequiredStar.style.display = 'inline';
        selectedColor = '';
        document.getElementById('anodizingColor').value = '';
        document.getElementById('partShape').value = '';
        document.getElementById('surfaceFinish').value = '';
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        
        const anodizingMaterials = [
            {value: "aluminum_1050", text: "آلومینیوم 1050"},
            {value: "aluminum_2024", text: "آلومینیوم 2024"},
            {value: "aluminum_3105", text: "آلومینیوم 3105"},
            {value: "aluminum_5052", text: "آلومینیوم 5052"},
            {value: "aluminum_6061", text: "آلومینیوم 6061"},
            {value: "aluminum_6063", text: "آلومینیوم 6063"},
            {value: "aluminum_7075", text: "آلومینیوم 7075"},
            {value: "titanium_grade2", text: "تیتانیوم Grade 2"},
            {value: "titanium_grade5", text: "تیتانیوم Grade 5 (Ti-6Al-4V)"},
            {value: "titanium_grade23", text: "تیتانیوم Grade 23 (Ti-6Al-4V ELI)"}
        ];
        const currentValue = materialSelect.value;
        materialSelect.innerHTML = '<option value="">انتخاب کنید</option>';
        anodizingMaterials.forEach(mat => {
            const option = document.createElement('option');
            option.value = mat.value;
            option.textContent = mat.text;
            materialSelect.appendChild(option);
        });
        if (currentValue && anodizingMaterials.some(m => m.value === currentValue)) {
            materialSelect.value = currentValue;
        }
        
        const partShapeSelect = document.getElementById('partShape');
        partShapeSelect.removeEventListener('change', updateDimensionsFields);
        partShapeSelect.addEventListener('change', function() {
            updateDimensionsFields();
            validateForm();
        });
        
        updateDimensionsFields();
        initColorSelection();
    } else {
        anodizingColorGroup.style.display = 'none';
        anodizingParamsGroup.style.display = 'none';
        
        const normalMaterials = [
            {value: "aluminum", text: "آلومینیوم"},
            {value: "steel", text: "فولاد ساده"},
            {value: "stainless", text: "استنلس استیل"},
            {value: "brass", text: "برنج"},
            {value: "copper", text: "مس"},
            {value: "titanium", text: "تیتانیوم"},
            {value: "plastic", text: "پلاستیک"},
            {value: "wood", text: "چوب"},
            {value: "other", text: "سایر مواد"}
        ];
        const currentValue = materialSelect.value;
        materialSelect.innerHTML = '<option value="">انتخاب کنید</option>';
        normalMaterials.forEach(mat => {
            const option = document.createElement('option');
            option.value = mat.value;
            option.textContent = mat.text;
            materialSelect.appendChild(option);
        });
        if (currentValue && normalMaterials.some(m => m.value === currentValue)) {
            materialSelect.value = currentValue;
        }
        
        updateDimensionsFields();
    }
}

function updateDimensionsFields() {
    const container = document.getElementById('dimensionsFields');
    
    if (selectedService === 'anodizing') {
        const shape = document.getElementById('partShape')?.value;
        if (shape === 'solid_cube') {
            container.innerHTML = `
                <div class="dimensions">
                    <input type="number" id="length" placeholder="طول (mm)" step="any">
                    <input type="number" id="width" placeholder="عرض (mm)" step="any">
                    <input type="number" id="height" placeholder="ارتفاع (mm)" step="any">
                </div>
                <small style="color: #64748b; margin-top: 5px; display: block;">
                    📦 مکعب توپر: تمام وجوه بسته است
                </small>
            `;
            const length = document.getElementById('length');
            const width = document.getElementById('width');
            const height = document.getElementById('height');
            if (length) length.addEventListener('input', validateForm);
            if (width) width.addEventListener('input', validateForm);
            if (height) height.addEventListener('input', validateForm);
        } else if (shape === 'hollow_box') {
            container.innerHTML = `
                <div class="dimensions" style="display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <label style="font-size: 12px; color: #1e293b; margin-bottom: 5px; display: block;">ابعاد خارجی:</label>
                        <div class="dimensions" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                            <input type="number" id="outer_length" placeholder="طول خارجی (mm)" step="any">
                            <input type="number" id="outer_width" placeholder="عرض خارجی (mm)" step="any">
                            <input type="number" id="outer_height" placeholder="ارتفاع خارجی (mm)" step="any">
                        </div>
                    </div>
                    <div>
                        <label style="font-size: 12px; color: #1e293b; margin-bottom: 5px; display: block;">ضخامت جداره (mm):</label>
                        <input type="number" id="thickness" placeholder="ضخامت جداره" step="any" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 12px;">
                    </div>
                </div>
                <small style="color: #64748b; margin-top: 10px; display: block;">
                    📦 باکس توخالی: یک وجه باز دارد (مانند جعبه بدون درب)
                </small>
            `;
            const outerLength = document.getElementById('outer_length');
            const outerWidth = document.getElementById('outer_width');
            const outerHeight = document.getElementById('outer_height');
            const thickness = document.getElementById('thickness');
            if (outerLength) outerLength.addEventListener('input', validateForm);
            if (outerWidth) outerWidth.addEventListener('input', validateForm);
            if (outerHeight) outerHeight.addEventListener('input', validateForm);
            if (thickness) thickness.addEventListener('input', validateForm);
        } else if (shape === 'solid_cylinder') {
            container.innerHTML = `
                <div class="dimensions">
                    <input type="number" id="outer_diameter" placeholder="قطر خارجی (mm)" step="any">
                    <input type="number" id="height" placeholder="ارتفاع (mm)" step="any">
                </div>
                <small style="color: #64748b; margin-top: 5px; display: block;">
                    🧴 استوانه توپر: فقط سطح خارجی آنادایز می‌شود
                </small>
            `;
            const outerDiameter = document.getElementById('outer_diameter');
            const height = document.getElementById('height');
            if (outerDiameter) outerDiameter.addEventListener('input', validateForm);
            if (height) height.addEventListener('input', validateForm);
        } else if (shape === 'hollow_cylinder') {
            container.innerHTML = `
                <div class="dimensions">
                    <input type="number" id="outer_diameter" placeholder="قطر خارجی (mm)" step="any">
                    <input type="number" id="inner_diameter" placeholder="قطر داخلی (mm)" step="any">
                    <input type="number" id="height" placeholder="ارتفاع (mm)" step="any">
                </div>
                <small style="color: #64748b; margin-top: 5px; display: block;">
                    🧴 استوانه توخالی: سطح خارجی + سطح داخلی آنادایز می‌شود
                </small>
            `;
            const outerDiameter = document.getElementById('outer_diameter');
            const innerDiameter = document.getElementById('inner_diameter');
            const height = document.getElementById('height');
            if (outerDiameter) outerDiameter.addEventListener('input', validateForm);
            if (innerDiameter) innerDiameter.addEventListener('input', validateForm);
            if (height) height.addEventListener('input', validateForm);
        } else {
            container.innerHTML = '<div class="dimensions"><input type="number" id="length" placeholder="طول (mm)" step="any"><input type="number" id="width" placeholder="عرض (mm)" step="any"><input type="number" id="height" placeholder="ارتفاع (mm)" step="any"></div>';
        }
    } else if (selectedService === 'laser_engraving') {
        container.innerHTML = `
            <div class="dimensions">
                <input type="number" id="length" placeholder="طول (mm)" step="any">
                <input type="number" id="width" placeholder="عرض (mm)" step="any">
            </div>
            <small style="color: #64748b; margin-top: 5px; display: block;">
                🔲 ابعاد مستطیل برای حکاکی لیزر
            </small>
        `;
        const length = document.getElementById('length');
        const width = document.getElementById('width');
        if (length) length.addEventListener('input', validateForm);
        if (width) width.addEventListener('input', validateForm);
    } else {
        container.innerHTML = `
            <div class="dimensions">
                <input type="number" id="length" placeholder="طول (mm)" step="any">
                <input type="number" id="width" placeholder="عرض (mm)" step="any">
                <input type="number" id="height" placeholder="ارتفاع (mm)" step="any">
            </div>
        `;
        const length = document.getElementById('length');
        const width = document.getElementById('width');
        const height = document.getElementById('height');
        if (length) length.addEventListener('input', validateForm);
        if (width) width.addEventListener('input', validateForm);
        if (height) height.addEventListener('input', validateForm);
    }
}

function getDimensionValues() {
    if (selectedService === 'anodizing') {
        const shape = document.getElementById('partShape')?.value;
        if (shape === 'solid_cylinder') {
            const outerDiameter = document.getElementById('outer_diameter')?.value || 0;
            return {
                outer_diameter: parseFloat(outerDiameter),
                inner_diameter: 0,
                height: document.getElementById('height')?.value || 0,
                shape: shape
            };
        } else if (shape === 'hollow_cylinder') {
            const outerDiameter = document.getElementById('outer_diameter')?.value || 0;
            const innerDiameter = document.getElementById('inner_diameter')?.value || 0;
            return {
                outer_diameter: parseFloat(outerDiameter),
                inner_diameter: parseFloat(innerDiameter),
                height: document.getElementById('height')?.value || 0,
                shape: shape
            };
        } else if (shape === 'hollow_box') {
            return {
                outer_length: parseFloat(document.getElementById('outer_length')?.value || 0),
                outer_width: parseFloat(document.getElementById('outer_width')?.value || 0),
                outer_height: parseFloat(document.getElementById('outer_height')?.value || 0),
                thickness: parseFloat(document.getElementById('thickness')?.value || 0),
                shape: shape
            };
        } else {
            return {
                length: document.getElementById('length')?.value || 0,
                width: document.getElementById('width')?.value || 0,
                height: document.getElementById('height')?.value || 0,
                shape: shape
            };
        }
    } else if (selectedService === 'laser_engraving') {
        return {
            length: document.getElementById('length')?.value || 0,
            width: document.getElementById('width')?.value || 0,
            height: 0,
            shape: 'rectangle'
        };
    }
    return {
        length: document.getElementById('length')?.value || 0,
        width: document.getElementById('width')?.value || 0,
        height: document.getElementById('height')?.value || 0,
        shape: 'solid_cube'
    };
}

function initColorSelection() {
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedColor = this.dataset.color;
            document.getElementById('anodizingColor').value = selectedColor;
            const colorError = document.getElementById('errorColor');
            if (colorError) colorError.classList.remove('show');
            validateForm();
        });
    });
}

document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedService = card.dataset.service;
        document.getElementById('customerForm').classList.add('show');
        document.getElementById('uploadArea').classList.add('show');
        toggleAnodizingFields();
        toggleLaserFields();
        updateDimensionsFields();
        document.getElementById('customerForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
        validateForm();
    });
});

function validateForm() {
    let isValid = true;
    
    const name = document.getElementById('customerName').value.trim();
    const nameField = document.getElementById('customerName');
    const nameError = document.getElementById('errorName');
    if (!name) { nameField.classList.add('error'); nameError.classList.add('show'); isValid = false; } 
    else { nameField.classList.remove('error'); nameError.classList.remove('show'); }
    
    const phone = document.getElementById('customerPhone').value.trim();
    const phoneField = document.getElementById('customerPhone');
    const phoneError = document.getElementById('errorPhone');
    if (!phone) { phoneField.classList.add('error'); phoneError.classList.add('show'); isValid = false; } 
    else { phoneField.classList.remove('error'); phoneError.classList.remove('show'); }
    
    const quantity = document.getElementById('quantity').value;
    const quantityField = document.getElementById('quantity');
    const quantityError = document.getElementById('errorQuantity');
    if (!quantity || quantity < 1) { quantityField.classList.add('error'); quantityError.classList.add('show'); isValid = false; } 
    else { quantityField.classList.remove('error'); quantityError.classList.remove('show'); }
    
    const material = document.getElementById('material').value;
    const materialField = document.getElementById('material');
    const materialError = document.getElementById('errorMaterial');
    if (!material) { materialField.classList.add('error'); materialError.classList.add('show'); isValid = false; } 
    else { materialField.classList.remove('error'); materialError.classList.remove('show'); }
    
    if (selectedService === 'anodizing') {
        const colorValue = document.getElementById('anodizingColor').value;
        const colorError = document.getElementById('errorColor');
        if (!colorValue) {
            colorError.classList.add('show');
            isValid = false;
        } else {
            colorError.classList.remove('show');
        }
        
        const partShape = document.getElementById('partShape').value;
        const shapeError = document.getElementById('errorPartShape');
        if (!partShape) {
            shapeError.classList.add('show');
            isValid = false;
        } else {
            shapeError.classList.remove('show');
        }
        
        const surfaceFinish = document.getElementById('surfaceFinish').value;
        const finishError = document.getElementById('errorSurfaceFinish');
        if (!surfaceFinish) {
            finishError.classList.add('show');
            isValid = false;
        } else {
            finishError.classList.remove('show');
        }
    }
    
    if (selectedService === 'laser_engraving') {
        const laserDepth = document.getElementById('laserDepth').value;
        const depthError = document.getElementById('errorLaserDepth');
        if (!laserDepth) {
            depthError.classList.add('show');
            isValid = false;
        } else {
            depthError.classList.remove('show');
        }
    }
    
    const dims = getDimensionValues();
    const dimensionsError = document.getElementById('errorDimensions');
    
    if (selectedService === 'anodizing') {
        const shape = document.getElementById('partShape')?.value;
        if (shape === 'solid_cylinder') {
            if (!dims.outer_diameter || dims.outer_diameter <= 0 || !dims.height || dims.height <= 0) {
                dimensionsError.classList.add('show');
                isValid = false;
            } else {
                dimensionsError.classList.remove('show');
            }
        } else if (shape === 'hollow_cylinder') {
            if (!dims.outer_diameter || dims.outer_diameter <= 0 || !dims.inner_diameter || dims.inner_diameter <= 0 || !dims.height || dims.height <= 0) {
                dimensionsError.classList.add('show');
                isValid = false;
            } else if (dims.inner_diameter >= dims.outer_diameter) {
                dimensionsError.innerHTML = '⚠️ قطر داخلی باید کوچکتر از قطر خارجی باشد';
                dimensionsError.classList.add('show');
                isValid = false;
            } else {
                dimensionsError.classList.remove('show');
                dimensionsError.innerHTML = 'لطفاً تمام ابعاد را وارد کنید';
            }
        } else if (shape === 'hollow_box') {
            if (!dims.outer_length || dims.outer_length <= 0 || !dims.outer_width || dims.outer_width <= 0 || !dims.outer_height || dims.outer_height <= 0 || !dims.thickness || dims.thickness <= 0) {
                dimensionsError.classList.add('show');
                isValid = false;
            } else if (dims.thickness * 2 >= dims.outer_length || dims.thickness * 2 >= dims.outer_width || dims.thickness >= dims.outer_height) {
                dimensionsError.innerHTML = '⚠️ ضخامت جداره نباید بیشتر از نصف ابعاد باشد';
                dimensionsError.classList.add('show');
                isValid = false;
            } else {
                dimensionsError.classList.remove('show');
                dimensionsError.innerHTML = 'لطفاً تمام ابعاد را وارد کنید';
            }
        } else {
            if (!dims.length || dims.length <= 0 || !dims.width || dims.width <= 0 || !dims.height || dims.height <= 0) {
                dimensionsError.classList.add('show');
                isValid = false;
            } else {
                dimensionsError.classList.remove('show');
            }
        }
    } else if (selectedService === 'laser_engraving') {
        if (!dims.length || dims.length <= 0 || !dims.width || dims.width <= 0) {
            dimensionsError.classList.add('show');
            isValid = false;
        } else {
            dimensionsError.classList.remove('show');
        }
    } else {
        if (!dims.length || dims.length <= 0 || !dims.width || dims.width <= 0 || !dims.height || dims.height <= 0) {
            dimensionsError.classList.add('show');
            isValid = false;
        } else {
            dimensionsError.classList.remove('show');
        }
    }
    
    const fileError = document.getElementById('errorFile');
    if (!selectedFile || isUploading) { 
        fileError.classList.add('show'); 
        if (isUploading) {
            fileError.innerHTML = '⚠️ در حال آپلود فایل، لطفاً صبر کنید...';
        } else {
            fileError.innerHTML = 'لطفاً فایل خود را آپلود کنید';
        }
        isValid = false; 
    } else { 
        fileError.classList.remove('show'); 
        fileError.innerHTML = 'لطفاً فایل خود را آپلود کنید';
    }
    
    const submitBtn = document.getElementById('submitBtn');
    if (isValid && selectedService && !isUploading) {
        submitBtn.classList.add('show');
        submitBtn.disabled = false;
    } else {
        submitBtn.classList.remove('show');
        submitBtn.disabled = true;
    }
}

document.getElementById('customerName').addEventListener('input', validateForm);
document.getElementById('customerPhone').addEventListener('input', validateForm);
document.getElementById('quantity').addEventListener('input', validateForm);
document.getElementById('material').addEventListener('change', validateForm);

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileNameSpan = document.getElementById('fileName');
const uploadProgress = document.getElementById('uploadProgress');
const progressBarFill = document.getElementById('progressBarFill');
const progressText = document.getElementById('progressText');

uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
uploadArea.addEventListener('drop', (e) => { e.preventDefault(); uploadArea.classList.remove('drag-over'); if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]); });
fileInput.addEventListener('change', (e) => { if (e.target.files.length > 0) handleFile(e.target.files[0]); });

function handleFile(file) {
    const validExts = ['.stl', '.step', '.stp', '.iges', '.igs', '.3mf', '.dxf', '.ai', '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.rar', '.zip'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!validExts.includes(ext)) { alert('فرمت فایل پشتیبانی نمی‌شود'); return; }
    if (file.size > 100 * 1024 * 1024) { alert('حجم فایل باید کمتر از 100MB باشد'); return; }
    
    selectedFile = file;
    fileNameSpan.textContent = file.name;
    fileInfo.classList.add('show');
    
    isUploading = true;
    validateForm();
    
    uploadProgress.classList.add('show');
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        progressBarFill.style.width = progress + '%';
        progressText.textContent = `در حال آپلود... ${progress}%`;
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                uploadProgress.classList.remove('show');
                progressBarFill.style.width = '0%';
                isUploading = false;
                validateForm();
            }, 500);
        }
    }, 200);
    
    validateForm();
}

window.clearFile = function() {
    selectedFile = null;
    fileInput.value = '';
    fileInfo.classList.remove('show');
    uploadProgress.classList.remove('show');
    progressBarFill.style.width = '0%';
    isUploading = false;
    validateForm();
}

function resetForm() {
    window.location.reload();
}

document.getElementById('submitBtn').addEventListener('click', async () => {
    if (!selectedService || !selectedFile || isUploading) return;
    
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const quantity = document.getElementById('quantity').value;
    const material = document.getElementById('material').value;
    const description = document.getElementById('description').value.trim();
    const anodizingColor = document.getElementById('anodizingColor').value;
    const partShape = selectedService === 'anodizing' ? document.getElementById('partShape').value : '';
    const surfaceFinish = selectedService === 'anodizing' ? document.getElementById('surfaceFinish').value : '';
    const laserDepth = selectedService === 'laser_engraving' ? document.getElementById('laserDepth').value : '';
    const dims = getDimensionValues();
    
    let length = 0, width = 0, height = 0, inner_diameter = 0;
    let outer_length = 0, outer_width = 0, outer_height = 0, thickness = 0;
    
    if (selectedService === 'anodizing') {
        const shape = document.getElementById('partShape').value;
        if (shape === 'solid_cylinder') {
            length = dims.outer_diameter;
            width = dims.outer_diameter;
            height = dims.height;
            inner_diameter = 0;
        } else if (shape === 'hollow_cylinder') {
            length = dims.outer_diameter;
            width = dims.outer_diameter;
            height = dims.height;
            inner_diameter = dims.inner_diameter;
        } else if (shape === 'hollow_box') {
            outer_length = dims.outer_length;
            outer_width = dims.outer_width;
            outer_height = dims.outer_height;
            thickness = dims.thickness;
        } else {
            length = dims.length;
            width = dims.width;
            height = dims.height;
            inner_diameter = 0;
        }
    } else if (selectedService === 'laser_engraving') {
        length = dims.length;
        width = dims.width;
        height = 0;
    } else {
        length = dims.length;
        width = dims.width;
        height = dims.height;
    }
    
    if (!name || !phone || !quantity || quantity < 1 || !material) {
        validateForm();
        alert('لطفاً تمام فیلدهای الزامی را پر کنید');
        return;
    }
    
    if (selectedService === 'anodizing') {
        const shape = document.getElementById('partShape').value;
        if (shape === 'solid_cylinder') {
            if (!length || length <= 0 || !height || height <= 0) {
                validateForm();
                alert('لطفاً قطر خارجی و ارتفاع را به درستی وارد کنید');
                return;
            }
        } else if (shape === 'hollow_cylinder') {
            if (!length || length <= 0 || !inner_diameter || inner_diameter <= 0 || !height || height <= 0) {
                validateForm();
                alert('لطفاً قطر خارجی، قطر داخلی و ارتفاع را به درستی وارد کنید');
                return;
            }
            if (inner_diameter >= length) {
                alert('قطر داخلی باید کوچکتر از قطر خارجی باشد');
                return;
            }
        } else if (shape === 'hollow_box') {
            if (!outer_length || outer_length <= 0 || !outer_width || outer_width <= 0 || !outer_height || outer_height <= 0 || !thickness || thickness <= 0) {
                validateForm();
                alert('لطفاً ابعاد خارجی و ضخامت جداره را به درستی وارد کنید');
                return;
            }
            if (thickness * 2 >= outer_length || thickness * 2 >= outer_width || thickness >= outer_height) {
                alert('ضخامت جداره نباید بیشتر از نصف ابعاد باشد');
                return;
            }
        } else {
            if (!length || length <= 0 || !width || width <= 0 || !height || height <= 0) {
                validateForm();
                alert('لطفاً طول، عرض و ارتفاع را به درستی وارد کنید');
                return;
            }
        }
    } else if (selectedService === 'laser_engraving') {
        if (!length || length <= 0 || !width || width <= 0) {
            validateForm();
            alert('لطفاً طول و عرض را به درستی وارد کنید');
            return;
        }
    } else {
        if (!length || length <= 0 || !width || width <= 0 || !height || height <= 0) {
            validateForm();
            alert('لطفاً طول، عرض و ارتفاع را به درستی وارد کنید');
            return;
        }
    }
    
    if (selectedService === 'anodizing') {
        if (!anodizingColor) {
            alert('لطفاً رنگ آنادایز را انتخاب کنید');
            return;
        }
        if (!partShape) {
            alert('لطفاً شکل قطعه را انتخاب کنید');
            return;
        }
        if (!surfaceFinish) {
            alert('لطفاً نوع پرداخت سطح را انتخاب کنید');
            return;
        }
    }
    
    if (selectedService === 'laser_engraving') {
        if (!laserDepth) {
            alert('لطفاً عمق حکاکی را انتخاب کنید');
            return;
        }
    }
    
    isUploading = true;
    uploadProgress.classList.add('show');
    progressBarFill.style.width = '0%';
    
    const formData = new FormData();
    formData.append('service_type', selectedService);
    formData.append('file', selectedFile);
    formData.append('customer_name', name);
    formData.append('customer_phone', phone);
    formData.append('quantity', quantity);
    formData.append('material', material);
    formData.append('length', length);
    formData.append('width', width);
    formData.append('height', height);
    formData.append('description', description);
    if (anodizingColor) formData.append('anodizing_color', anodizingColor);
    if (partShape) formData.append('part_shape', partShape);
    if (surfaceFinish) formData.append('surface_finish', surfaceFinish);
    if (inner_diameter > 0) formData.append('inner_diameter', inner_diameter);
    if (laserDepth) formData.append('laser_depth', laserDepth);
    if (outer_length > 0) formData.append('outer_length', outer_length);
    if (outer_width > 0) formData.append('outer_width', outer_width);
    if (outer_height > 0) formData.append('outer_height', outer_height);
    if (thickness > 0) formData.append('thickness', thickness);
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 10;
        progressBarFill.style.width = progress + '%';
        progressText.textContent = `در حال ارسال اطلاعات... ${progress}%`;
        if (progress >= 90) clearInterval(progressInterval);
    }, 150);
    
    try {
        const response = await fetch('/upload/', { method: 'POST', body: formData });
        const data = await response.json();
        
        clearInterval(progressInterval);
        progressBarFill.style.width = '100%';
        progressText.textContent = 'تکمیل شد!';
        
        setTimeout(() => {
            uploadProgress.classList.remove('show');
            progressBarFill.style.width = '0%';
        }, 1000);
        
        if (response.ok && data.success) {
            const serviceNames = {
                'cnc_turning': '🔩 CNC تراشکاری',
                'cnc_milling': '⚙️ CNC فرزکاری',
                'anodizing': '🎨 آنادایزینگ',
                'laser_engraving': '🔫 لیزر هک'
            };
            
            currentOrderNumber = data.order_number;
            
            document.getElementById('resultOrderNumber').innerHTML = data.order_number;
            document.getElementById('resultCustomer').innerHTML = data.customer_name;
            document.getElementById('resultService').innerHTML = serviceNames[data.service];
            document.getElementById('resultFile').innerHTML = data.filename;
            document.getElementById('resultQuantity').innerHTML = data.quantity + ' عدد';
            document.getElementById('resultMaterial').innerHTML = data.material_text;
            
            if (selectedService === 'anodizing') {
                const shape = document.getElementById('partShape').value;
                if (shape === 'solid_cylinder') {
                    document.getElementById('resultDimensions').innerHTML = `قطر: ${length} × ارتفاع: ${height} mm`;
                } else if (shape === 'hollow_cylinder') {
                    document.getElementById('resultDimensions').innerHTML = `قطر خارجی: ${length} × قطر داخلی: ${inner_diameter} × ارتفاع: ${height} mm`;
                } else if (shape === 'hollow_box') {
                    document.getElementById('resultDimensions').innerHTML = `خارجی: ${outer_length}×${outer_width}×${outer_height} - ضخامت: ${thickness} mm`;
                } else {
                    document.getElementById('resultDimensions').innerHTML = `${length} × ${width} × ${height} mm`;
                }
            } else if (selectedService === 'laser_engraving') {
                document.getElementById('resultDimensions').innerHTML = `${length} × ${width} mm`;
            } else {
                document.getElementById('resultDimensions').innerHTML = `${length} × ${width} × ${height} mm`;
            }
            
            if (data.anodizing_color) {
                document.getElementById('resultColorRow').style.display = 'flex';
                document.getElementById('resultColor').innerHTML = data.anodizing_color;
            } else {
                document.getElementById('resultColorRow').style.display = 'none';
            }
            
            if (data.part_shape) {
                const shapeNames = {
                    'solid_cube': 'مکعب توپر',
                    'hollow_box': 'باکس توخالی (بدون یک وجه)',
                    'solid_cylinder': 'استوانه توپر',
                    'hollow_cylinder': 'استوانه توخالی (داخل و خارج)'
                };
                document.getElementById('resultShapeRow').style.display = 'flex';
                document.getElementById('resultShape').innerHTML = shapeNames[data.part_shape] || data.part_shape;
            } else {
                document.getElementById('resultShapeRow').style.display = 'none';
            }
            
            if (data.surface_finish) {
                const finishNames = {
                    'glossy': 'براق (Glossy)',
                    'matte': 'مات (Matte)'
                };
                document.getElementById('resultFinishRow').style.display = 'flex';
                document.getElementById('resultFinish').innerHTML = finishNames[data.surface_finish] || data.surface_finish;
            } else {
                document.getElementById('resultFinishRow').style.display = 'none';
            }
            
            if (data.laser_depth) {
                const depthNames = {
                    'shallow': 'سطحی',
                    'medium': 'نیمه عمیق',
                    'deep': 'عمیق'
                };
                document.getElementById('resultLaserDepthRow').style.display = 'flex';
                document.getElementById('resultLaserDepth').innerHTML = depthNames[data.laser_depth] || data.laser_depth;
            } else {
                document.getElementById('resultLaserDepthRow').style.display = 'none';
            }
            
            if (description) {
                document.getElementById('resultDescRow').style.display = 'flex';
                document.getElementById('resultDescription').innerHTML = description;
            } else {
                document.getElementById('resultDescRow').style.display = 'none';
            }
            
            if (selectedService === 'anodizing' || selectedService === 'laser_engraving') {
                document.getElementById('priceEstimateSection').style.display = 'block';
                document.getElementById('contactMessageSection').style.display = 'none';
                document.getElementById('resultPrice').innerHTML = data.price_formatted;
                document.getElementById('resultUnitPrice').innerHTML = data.unit_price_after_discount.toLocaleString() + ' تومان';
                document.getElementById('resultDays').innerHTML = data.estimated_days + ' روز کاری';
                
                if (data.discount_percent && data.discount_percent > 0) {
                    document.getElementById('discountRow').style.display = 'flex';
                    document.getElementById('resultDiscount').innerHTML = data.discount_percent + '% تخفیف برای تعداد ' + data.quantity + ' عددی';
                } else {
                    document.getElementById('discountRow').style.display = 'none';
                }
            } else {
                document.getElementById('priceEstimateSection').style.display = 'none';
                document.getElementById('contactMessageSection').style.display = 'block';
            }
            
            document.getElementById('customerForm').style.display = 'none';
            document.getElementById('uploadArea').style.display = 'none';
            document.getElementById('submitBtn').style.display = 'none';
            document.getElementById('resultCard').classList.add('show');
            document.getElementById('resultCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            alert('خطا: ' + data.error);
            submitBtn.disabled = false;
        }
    } catch (error) {
        clearInterval(progressInterval);
        alert('مشکل در ارتباط با سرور');
        submitBtn.disabled = false;
        uploadProgress.classList.remove('show');
    } finally {
        isUploading = false;
    }
});

document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabId = tab.dataset.tab;
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        document.getElementById(tabId + '-tab').classList.add('active');
    });
});

window.resetForm = resetForm;
window.downloadReceipt = downloadReceipt;
