import os
import zipfile
from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import FileResponse
from .utils import merge_pdfs, split_pdf, pdf_to_word, word_to_pdf, image_to_pdf, pdf_to_image
import uuid
from pillow_heif import register_heif_opener
import shutil
import time
import tempfile

# ✅ Save uploaded file in 'media/tmp/'
# Register HEIF/HEIC support
register_heif_opener()

# ✅ Save uploaded file in 'media/tmp/'
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

# ✅ Merge PDFs
@api_view(['POST'])
def merge_pdfs_view(request):
    file_paths = [save_temp_file(f) for f in request.FILES.getlist('files')]
    output_file = None

    try:
        output_file = merge_pdfs(file_paths)
        original_name = "merged"
        output_file = move_to_downloads(output_file, original_name, ".pdf")
        return FileResponse(open(output_file, 'rb'), as_attachment=True)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    finally:
        for file in file_paths:
            delete_temp_file(file)
        delete_temp_file(output_file)

# ✅ Split PDF
@api_view(['POST'])
def split_pdf_view(request):
    file = save_temp_file(request.FILES['file'])
    output_files = []

    try:
        output_files = split_pdf(file)
        if not output_files:
            return Response({'error': 'No pages extracted!'}, status=500)
        
        original_name = os.path.splitext(request.FILES['file'].name)[0]
        if len(output_files) == 1:
            output_files[0] = move_to_downloads(output_files[0], original_name, ".pdf")
            return FileResponse(open(output_files[0], 'rb'), as_attachment=True)
        
        zip_path = move_to_downloads(os.path.join(settings.MEDIA_ROOT, 'tmp', f"{original_name}.zip"), original_name, ".zip")
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for pdf in output_files:
                zipf.write(pdf, os.path.basename(pdf))
        
        return FileResponse(open(zip_path, 'rb'), as_attachment=True)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    finally:
        delete_temp_file(file)
        for pdf in output_files:
            delete_temp_file(pdf)

# ✅ Convert PDF to Word
@api_view(['POST'])
def convert_pdf_to_word_view(request):
    file = save_temp_file(request.FILES['file'])
    output_file = None

    try:
        output_file = pdf_to_word(file)  # Convert PDF to Word
        original_name = os.path.splitext(request.FILES['file'].name)[0]
        output_file = move_to_downloads(output_file, original_name, ".docx")

        # ✅ Check if the output file exists before returning it
        if not os.path.exists(output_file):
            print(f"❌ Output file not found: {output_file}")
            return Response({'error': 'Conversion failed: Output file not found'}, status=500)

        print(f"✅ Output file ready at: {output_file}")

        # ✅ Return FileResponse with correct content-type
        # response = FileResponse(
        #     open(output_file, 'rb'),
        #     as_attachment=True,
        #     filename=os.path.basename(output_file),
        #     content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        # )
        response = get_file_response(output_file)
        if response:

        # ✅ Delay deletion to ensure file is properly sent
            time.sleep(2)  # Ensure the file is not locked before deletion
            delete_temp_file(output_file)

        return response

    except Exception as e:
        return Response({'error': str(e)}, status=500)

    finally:
        delete_temp_file(file)  # Delete input PDF immediately


# ✅ Convert Word to PDF
@api_view(['POST'])
def convert_word_to_pdf_view(request):
    file = save_temp_file(request.FILES['file'])
    output_file = None

    try:
        output_file = word_to_pdf(file)
        original_name = os.path.splitext(request.FILES['file'].name)[0]
        output_file = move_to_downloads(output_file, original_name, ".pdf")
        # return FileResponse(open(output_file, 'rb'), as_attachment=True)
        response = get_file_response(output_file)
        if response:
            time.sleep(2)  # Small delay to avoid file lock
            delete_temp_file(output_file)
        return response
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    finally:
        # response = get_file_response(output_file)
        delete_temp_file(file)  # Now it will delete after response is sent
        # return response

# ✅ Convert Image to PDF
@api_view(['POST'])
def convert_image_to_pdf_view(request):
    file = save_temp_file(request.FILES['file'])
    output_file = None

    try:
        # Ensure HEIF/HEIC support
        img = Image.open(file)
        if img.format in ['HEIF', 'HEIC']:
            img = img.convert("RGB")
        
        output_file = image_to_pdf(file)
        original_name = os.path.splitext(request.FILES['file'].name)[0]  # Extract filename without extension
        unique_id = uuid.uuid4().hex[:6]  # Generate unique ID
        return FileResponse(open(output_file, 'rb'), as_attachment=True, filename=f'{original_name}_{unique_id}.pdf')
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    finally:
        delete_temp_file(file)
        if output_file:
            delete_temp_file(output_file)

# ✅ Convert PDF to Images
@api_view(['POST'])
@api_view(['POST'])
def convert_pdf_to_image_view(request):
    file = save_temp_file(request.FILES['file'])
    output_files = []
    
    # Get format from query params, default to 'jpg'
    format = request.GET.get('format', 'jpg').lower()
    allowed_formats = {'jpg', 'png', 'heif'}
    if format not in allowed_formats:
        format = 'jpg'  # Default to JPG if invalid format is provided

    try:
        output_files = pdf_to_image(file, format=format.upper())

        if not output_files:
            return Response({'error': 'No images extracted!'}, status=500)

        original_name = os.path.splitext(request.FILES['file'].name)[0]
        unique_id = uuid.uuid4().hex[:6]

        if len(output_files) == 1:
            return FileResponse(open(output_files[0], 'rb'), as_attachment=True, filename=f'{original_name}_{unique_id}.{format}')

        # If multiple files, create a zip
        zip_path = os.path.join(settings.MEDIA_ROOT, 'tmp', f"{original_name}_{unique_id}.zip")
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for img in output_files:
                zipf.write(img, os.path.basename(img))

        return FileResponse(open(zip_path, 'rb'), as_attachment=True, filename=f'{original_name}_{unique_id}.zip')

    except Exception as e:
        return Response({'error': str(e)}, status=500)
    finally:
        delete_temp_file(file)
        for img in output_files:
            delete_temp_file(img)