import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pdf_tools_web.settings')  # Replace 'pdf_tools' with your project name

application = get_wsgi_application()
