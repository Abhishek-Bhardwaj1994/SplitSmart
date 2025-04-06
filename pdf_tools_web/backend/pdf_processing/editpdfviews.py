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
    crop_pdf, rotate_pdf, delete_pages, reorder_pages,
    add_text_to_pdf, add_image_to_pdf, draw_on_pdf, apply_filter_to_pdf
)
import json

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

@api_view(["POST"])
def edit_pdf_view(request):
    """
    Initial upload endpoint. Returns a session ID.
    """
    try:
        pdf_file = request.FILES["file"]
        if not pdf_file.name.endswith(".pdf"):
            return Response({"error": "File type not supported"}, status=400)
        session_id = str(uuid.uuid4())
        input_path = save_temp_file(pdf_file, session_id=session_id)
        return Response({"session_id": session_id})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


def handle_edit_operation(request, edit_func, param_key):
    try:
        data = request.data
        session_id = data.get("session_id")
        if not session_id:
            return Response({"error": "Missing session_id"}, status=400)

        params = data.get(param_key, {})
        if isinstance(params, str):
            params = json.loads(params)

        input_path = get_session_file_path(session_id)

        # 🛠 Call edit function and get the real output path
        output_path = edit_func(input_path, params)

        # 🛠 Overwrite the original tmp file with edited output
        os.replace(output_path, input_path)

        return FileResponse(open(input_path, "rb"), content_type="application/pdf")

    except Exception as e:
        return Response({"error": str(e)}, status=500)



@api_view(["POST"])
def crop_pdf_view(request):
    return handle_edit_operation(request, crop_pdf, "crop_params")


@api_view(["POST"])
def rotate_pdf_view(request):
    return handle_edit_operation(request, rotate_pdf, "rotation_data")


@api_view(["POST"])
def delete_pages_view(request):
    return handle_edit_operation(request, delete_pages, "pages_to_delete")


@api_view(["POST"])
def reorder_pages_view(request):
    return handle_edit_operation(request, reorder_pages, "new_order")


@api_view(["POST"])
def add_text_view(request):
    return handle_edit_operation(request, add_text_to_pdf, "text_items")


@api_view(["POST"])
def draw_on_pdf_view(request):
    return handle_edit_operation(request, draw_on_pdf, "draw_data")


@api_view(["POST"])
def add_image_view(request):
    return handle_edit_operation(request, add_image_to_pdf, "image_data")


from django.http import FileResponse
import threading
import time

@api_view(["POST"])
def download_final_pdf_view(request):
    try:
        session_id = request.data.get("session_id")
        input_path = get_session_file_path(session_id)

        if not os.path.exists(input_path):
            print(f"[❌] File not found: {input_path}")
            return Response({"error": "File not found."}, status=404)

        # Open the file in binary read mode and DON'T close it manually
        file_handle = open(input_path, "rb")

        # Django will automatically close the file handle when response is done
        response = FileResponse(file_handle, as_attachment=True, filename=f"edited_{session_id}.pdf")

        # Use callback after the response is fully sent to delete the file
        def delete_after_response():
            time.sleep(5)  # wait to ensure file is fully streamed
            try:
                os.remove(input_path)
                print(f"[✅] Deleted: {input_path}")
            except Exception as e:
                print(f"[⚠️] Could not delete {input_path}: {e}")

        threading.Thread(target=delete_after_response).start()

        return response

    except Exception as e:
        print(f"[❌] Exception during download: {e}")
        return Response({"error": str(e)}, status=500)

