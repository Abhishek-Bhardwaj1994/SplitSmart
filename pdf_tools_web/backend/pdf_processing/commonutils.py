from rest_framework.response import Response
import zipfile
import os
import shutil
import tempfile
import uuid
from PyPDF2 import PdfReader, PdfWriter
from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import FileResponse
import time
from django.utils.text import slugify
from pathlib import Path
# from .utils import save_temp_file, move_to_downloads, delete_temp_file

def parse_page_range(page_range, total_pages):
    """Converts a user input page range into zero-based page numbers."""
    selected_pages = set()

    try:
        parts = page_range.split(',')
        for part in parts:
            if '-' in part:
                start, end = map(int, part.split('-'))
                selected_pages.update(range(start - 1, end))  # Convert to zero-based
            else:
                selected_pages.add(int(part) - 1)  # Convert to zero-based

        # ✅ Ensure valid pages (inside range)
        selected_pages = sorted(p for p in selected_pages if 0 <= p < total_pages)

    except ValueError:
        return []  # Invalid format

    return selected_pages


def save_temp_file(uploaded_file):
    """Save uploaded file temporarily with a unique name and return the absolute file path."""
    temp_dir = os.path.join(settings.MEDIA_ROOT, 'tmp')
    os.makedirs(temp_dir, exist_ok=True)  # Ensure 'tmp' directory exists

    # Extract name and extension safely
    original_name = Path(uploaded_file.name).stem  # Avoid issues with multiple dots
    ext = Path(uploaded_file.name).suffix.lower()  # Get file extension safely

    # Sanitize filename
    safe_name = slugify(original_name)

    # Generate unique file name
    unique_id = uuid.uuid4().hex[:6]
    file_name = f"{safe_name}_{unique_id}{ext}"
    file_path = os.path.join(temp_dir, file_name)

    # Save the file in chunks
    with open(file_path, 'wb+') as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)

    return file_path




# ✅ Move output file to 'downloads/'
def move_to_downloads(file_path, original_name, extension):
    """Move processed file to 'downloads/' directory and return new path."""
    downloads_dir = os.path.join(settings.MEDIA_ROOT, 'downloads')
    os.makedirs(downloads_dir, exist_ok=True)  # Ensure 'downloads' directory exists

    for old_file in os.listdir(downloads_dir):
        if old_file.startswith(original_name) and old_file.endswith(extension):
            os.remove(os.path.join(downloads_dir, old_file))

    file_path = os.path.abspath(file_path)

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"❌ File not found before moving: {file_path}")
    
    unique_id = uuid.uuid4().hex[:6]
    new_file_path = os.path.join(downloads_dir, f"{original_name}_{unique_id}{extension}")
    print(f"Moving file to: {new_file_path}")
    print(f"Original file path: {file_path}")
    try:
        if not os.path.exists(file_path):
            print(f"❌ File does NOT exist before moving: {file_path}")
            raise FileNotFoundError(f"File not found before moving: {file_path}")

        print(f"✅ File exists, proceeding with move: {file_path}")

        shutil.move(file_path, new_file_path)
        print(f"File moved to: {new_file_path}")
    except Exception as e:
        raise RuntimeError(f"❌ Failed to move file: {e}")
    if not os.path.exists(new_file_path):
        raise FileNotFoundError(f"❌ File move failed: {new_file_path}")

    return new_file_path

from django.http import FileResponse

def get_file_response(file_path):
    """Return a FileResponse while ensuring the file is properly closed before deletion."""
    try:
        temp_file = tempfile.NamedTemporaryFile(delete=False)  # Don't delete immediately
        with open(file_path, 'rb') as f:
            temp_file.write(f.read())  # Copy file contents
        temp_file.close()  # Close so FileResponse can access it

        response = FileResponse(open(temp_file.name, 'rb'), as_attachment=True, filename=os.path.basename(file_path))
        response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'

        return response
    except Exception as e:
        print(f"Error returning file {file_path}: {e}")
        return None


# ✅ Delete temporary files
# ✅ Delete temporary files
def delete_temp_file(file_path, retries=5, delay=3):
    """Delete the temporary file after processing, retrying if it's locked."""
    try:
        if file_path and os.path.exists(file_path):
            for attempt in range(retries):
                try:
                    os.remove(file_path)
                    print(f"Deleted file: {file_path}")
                    return  # Exit if successful
                except PermissionError:
                    print(f"Attempt {attempt+1}: File is locked, retrying in {delay} seconds...")
                    time.sleep(delay)  # Wait before retrying

            print(f"Failed to delete file after {retries} attempts: {file_path}")
    except Exception as e:
        print(f"Error deleting file {file_path}: {e}")