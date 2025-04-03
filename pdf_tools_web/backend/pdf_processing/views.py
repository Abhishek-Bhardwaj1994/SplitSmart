import os
import zipfile
from django.conf import settings
from django.core.files.storage import default_storage
from PyPDF2 import PdfReader, PdfWriter
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import FileResponse
from .utils import merge_pdfs, split_pdf, pdf_to_word, word_to_pdf, image_to_pdf, pdf_to_image
import uuid
from PIL import Image
from pillow_heif import register_heif_opener
import pillow_heif
import shutil
import time
import tempfile
import threading
from .commonutils import parse_page_range, delete_temp_file, save_temp_file, move_to_downloads, get_file_response

# ✅ Save uploaded file in 'media/tmp/'
# Register HEIF/HEIC support
register_heif_opener()

# ✅ Save uploaded file in 'media/tmp/'


# ✅ Merge PDFs
@api_view(['POST'])
def merge_pdfs_view(request):
    file_paths = [save_temp_file(f) for f in request.FILES.getlist('files')]
    print("Saved file paths:", file_paths)  # Debugging

    if len(file_paths) == 1:
        delete_temp_file(file_paths[0])
        return Response({"error": "At least two PDFs are required for merging."}, status=400)

    if not file_paths:
        return Response({"error": "No files provided for merging."}, status=400)

    output_file = None
    temp_copy = None

    try:
        output_file = merge_pdfs(file_paths)
        print("Merged PDF path:", output_file)  # Debugging

        original_name = "merged"
        output_file = move_to_downloads(output_file, original_name, ".pdf")

        # ✅ Create a temporary copy for serving
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_copy:
            shutil.copy(output_file, temp_copy.name)
            print("Temporary copy created at:", temp_copy.name)  # Debugging

        response = FileResponse(open(temp_copy.name, 'rb'), as_attachment=True, filename=os.path.basename(output_file))

        # ✅ Delete merged file from downloads after a short delay
        time.sleep(2)
        delete_temp_file(output_file)
        for file in file_paths:
            if os.path.exists(file):
                delete_temp_file(file)
        # threading.Thread(target=delete_temp_file, args=(output_file,)).start()

        return response

    except Exception as e:
        return Response({"error": str(e)}, status=500)

    # finally:
    #     # ✅ Delete temporary uploaded PDFs
    #     threading.Thread(target=delete_temp_file, args=(output_file,)).start()
    #     for file in file_paths:
    #         if os.path.exists(file):
    #             delete_temp_file(file)
    #         else:
    #             print(f"⚠️ File already deleted or missing: {file}")
        # time.sleep(2)
        # delete_temp_file(output_file)
        # threading.Thread(target=delete_temp_file, args=(file,)).start()  
        


# ✅ Split PDF
@api_view(['POST'])
def split_pdf_view(request):
    """Splits a PDF into selected pages and returns a single PDF."""
    if 'file' not in request.FILES:
        return Response({"error": "No file uploaded"}, status=400)

    # ✅ Save uploaded file in `media/tmp`
    temp_file = save_temp_file(request.FILES['file'])  
    tmp_dir = os.path.join(settings.MEDIA_ROOT, 'tmp')
    os.makedirs(tmp_dir, exist_ok=True)  
    
    file_name = os.path.basename(temp_file)
    tmp_file_path = os.path.join(tmp_dir, file_name)
    os.replace(temp_file, tmp_file_path)  

    try:
        reader = PdfReader(tmp_file_path)
        total_pages = len(reader.pages)

        # ✅ Get page selection
        page_range = request.data.get('pages', '')  
        selected_pages = parse_page_range(page_range, total_pages) if page_range else list(range(total_pages))

        if not selected_pages:
            return Response({'error': 'Invalid page range!'}, status=400)

        original_name = os.path.splitext(request.FILES['file'].name)[0]

        # ✅ Create a single merged PDF with selected pages
        downloads_dir = os.path.join(settings.MEDIA_ROOT, 'downloads')
        os.makedirs(downloads_dir, exist_ok=True)  

        unique_id = uuid.uuid4().hex[:6]
        output_file = os.path.join(downloads_dir, f"{original_name}_selected_{unique_id}.pdf")

        writer = PdfWriter()
        for page_num in selected_pages:
            writer.add_page(reader.pages[page_num])

        with open(output_file, "wb") as f:
            writer.write(f)

        # ✅ Return the merged PDF and schedule deletion
        response = FileResponse(open(output_file, 'rb'), as_attachment=True, filename=os.path.basename(output_file))

        # ✅ Cleanup files after response
        threading.Thread(target=delete_temp_file, args=(tmp_file_path,)).start()  
        threading.Thread(target=delete_temp_file, args=(output_file,)).start()

        return response

    except Exception as e:
        return Response({'error': str(e)}, status=500)
    
    finally:
        threading.Thread(target=delete_temp_file, args=(tmp_file_path,)).start() 



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
    print("Request FILES:", request.FILES)
    if 'file' not in request.FILES:
        return Response({'error': "No file uploaded"}, status=400)
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
    """Converts multiple images (JPG, PNG, HEIF, HEIC) into a single merged PDF."""
    
    files = request.FILES.getlist('files')  
    if not files:
        return Response({"error": "No files uploaded"}, status=400)

    temp_files = []  # Track saved temp files
    output_file = None

    try:
        # ✅ Save multiple images to temp folder
        for img_file in request.FILES.getlist('files'):
            temp_files.append(save_temp_file(img_file)) 

        if not temp_files:
            return Response({"error": "No valid images found"}, status=400)

        # ✅ Convert images to single PDF and move to downloads
        output_file = image_to_pdf(temp_files)

        response = FileResponse(
            open(output_file, 'rb'),
            as_attachment=True,
            filename=os.path.basename(output_file)
        )

        time.sleep(2)
        delete_temp_file(output_file)

        return response

    except Exception as e:
        return Response({'error': f"Conversion failed: {str(e)}"}, status=500)

    finally:
        # ✅ Cleanup temp files after response (run in background)
        threading.Thread(target=lambda: [delete_temp_file(f) for f in temp_files]).start()
        threading.Thread(target=delete_temp_file, args=(output_file,)).start()

        


# ✅ Convert PDF to Images

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