import os
import zipfile
from django.conf import settings
from django.core.files.storage import default_storage
from PyPDF2 import PdfReader, PdfWriter
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import FileResponse
import uuid
from PIL import Image
from pillow_heif import register_heif_opener
import pillow_heif
import shutil
import time
import tempfile
import threading
from .commonutils import parse_page_range, delete_temp_file, save_temp_file, move_to_downloads, get_file_response
from django.views.decorators.csrf import csrf_exempt
from .editpdfutils import (
        draw_on_pdf
)
import json
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

@ensure_csrf_cookie
def set_csrf_cookie(request):
    return JsonResponse({'message': 'CSRF cookie set'})

def get_session_file_path(session_id):
    return os.path.join("media/tmp", f"{session_id}.pdf")

def save_temp_file(file, session_id=None):
    ext = file.name.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    folder = os.path.join(settings.MEDIA_ROOT, "tmp")
    
    # Optionally prefix filename with session_id
    if session_id:
        filename = f"{session_id}.pdf"
    else:
        filename = f"{uuid.uuid4()}.{ext}"


    if not os.path.exists(folder):
        os.makedirs(folder)

    path = os.path.join(folder, filename)
    with open(path, "wb+") as destination:
        for chunk in file.chunks():
            destination.write(chunk)
    return path

# @csrf_exempt
def upload_pdf_view(request):
    temp_dir = os.path.join(settings.MEDIA_ROOT, 'tmp')
    os.makedirs(temp_dir, exist_ok=True)  # Ensure 'tmp' directory exists
    if request.method == 'POST' and request.FILES.get('file'):
        uploaded_file = request.FILES['file']
        session_id = str(uuid.uuid4())
        input_path = save_temp_file(uploaded_file, session_id)
        return FileResponse({'session_id': session_id, 'file_url': f'{temp_dir}/{session_id}_{uploaded_file.name}'})
    return FileResponse({'error': 'Invalid request'}, status=400)


def draw_on_pdf_view(request):
    if request.method == 'POST':
        session_id = request.POST.get("session_id")
        draw_data = json.loads(request.POST.get("draw_data", "{}"))

        input_path = get_temp_file_path(session_id)
        output_path = get_output_path("drawn", session_id)

        from editpdfutils import draw_on_pdf
        draw_on_pdf(input_path, draw_data, output_path)

        save_temp_file(session_id, output_path)

        return FileResponse(open(output_path, "rb"), as_attachment=True, filename=f"drawn_{session_id}.pdf")



