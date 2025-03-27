from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
# Static files (CSS, JavaScript, Images)
import os

STATIC_URL = '/static/'  # ✅ Required setting

# Define the directory where static files will be collected
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Additional locations for static files
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),  # If you have a 'static' folder in your project
]



DEBUG = True  # Set to False for production

ALLOWED_HOSTS = ["yourdomain.com", "www.yourdomain.com", "127.0.0.1","localhost"]

ROOT_URLCONF = 'pdf_tools.urls'

INSTALLED_APPS = [
    'django.contrib.admin',       # ✅ Admin panel (Required)
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',             # ✅ Django REST framework (API support)
    'pdf_processing',             # ✅ Our custom app
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / "templates"],  # Ensure templates directory exists
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',  # ✅ Required for admin
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',  # ✅ Required for admin
    'django.contrib.messages.middleware.MessageMiddleware',  # ✅ Required for admin
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

SECRET_KEY = '5=v_!#xnql)@ggphu1_k_i$n!)$_sjrgclc(52emgwf0m-!t+('