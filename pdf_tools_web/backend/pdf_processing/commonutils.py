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
# from .utils import save_temp_file, move_to_downloads, delete_temp_file

def parse_page_range(page_range, total_pages):
    """Parses a page range string like '1-3,5' and returns a list of page numbers (zero-indexed)."""
    pages = set()

    try:
        parts = page_range.split(',')
        for part in parts:
            if '-' in part:
                start, end = map(int, part.split('-'))
                if start > end or start < 1 or end > total_pages:
                    raise ValueError("Invalid page range.")
                pages.update(range(start, end + 1))
            else:
                page = int(part)
                if page < 1 or page > total_pages:
                    raise ValueError("Invalid page number.")
                pages.add(page)

        return sorted(p - 1 for p in pages)  # Convert to zero-indexed
    except ValueError:
        return None

def save_temp_file(uploaded_file):
    """Save uploaded file temporarily with a unique name and return the absolute file path."""
    temp_dir = os.path.join(settings.MEDIA_ROOT, 'tmp')
    os.makedirs(temp_dir, exist_ok=True)  # Ensure 'tmp' directory exists
    
    original_name, ext = os.path.splitext(uploaded_file.name)  # Extract name and extension
    unique_id = uuid.uuid4().hex[:6]  # Generate unique ID
    
    file_name = f"{original_name}_{unique_id}{ext}"  # Append unique ID
    file_path = os.path.join(temp_dir, file_name)
    
    with open(file_path, 'wb+') as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)
    
    return file_path




# ✅ Move output file to 'downloads/'
def move_to_downloads(file_path, original_name, extension):
    """Move processed file to 'downloads/' directory and return new path."""
    downloads_dir = os.path.join(settings.MEDIA_ROOT, 'downloads')
    os.makedirs(downloads_dir, exist_ok=True)  # Ensure 'downloads' directory exists
    
    unique_id = uuid.uuid4().hex[:6]
    new_file_path = os.path.join(downloads_dir, f"{original_name}_{unique_id}{extension}")
    shutil.move(file_path, new_file_path)
    
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