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
from pillow_heif import register_heif_opener
import shutil
import time
import tempfile
from .commonutils import parse_page_range, delete_temp_file, save_temp_file, move_to_downloads, get_file_response

# ✅ Save uploaded file in 'media/tmp/'
# Register HEIF/HEIC support
register_heif_opener()

# ✅ Save uploaded file in 'media/tmp/'


# ✅ Merge PDFs
@api_view(['POST'])
def merge_pdfs_view(request):
    print(request.FILES)  # Debugging
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

        return response

    except Exception as e:
        return Response({"error": str(e)}, status=500)

    finally:
        # ✅ Delete temporary uploaded PDFs
        for file in file_paths:
            delete_temp_file(file)


# ✅ Split PDF
@api_view(['POST'])
def split_pdf_view(request):
    """Splits a PDF into selected pages or multiple single-page PDFs."""
    if 'file' not in request.FILES:
        return Response({"error": "No file uploaded"}, status=400)

    file = save_temp_file(request.FILES['file'])
    output_files = []

    try:
        reader = PdfReader(file)
        total_pages = len(reader.pages)

        # ✅ Get optional page range from request
        page_range = request.data.get('pages', '')  # Example: "1-3,5"
        selected_pages = parse_page_range(page_range, total_pages) if page_range else list(range(total_pages))

        if not selected_pages:
            return Response({'error': 'Invalid page range!'}, status=400)

        original_name = os.path.splitext(request.FILES['file'].name)[0]

        # ✅ Extract selected pages
        for i, page_num in enumerate(selected_pages):
            writer = PdfWriter()
            writer.add_page(reader.pages[page_num])

            output_file = move_to_downloads(
                os.path.join(tempfile.gettempdir(), f"{original_name}_page{page_num+1}.pdf"),
                original_name,
                ".pdf"
            )

            with open(output_file, "wb") as f:
                writer.write(f)
            
            output_files.append(output_file)

        # ✅ If one file, return it directly
        if len(output_files) == 1:
            return FileResponse(open(output_files[0], 'rb'), as_attachment=True, filename=os.path.basename(output_files[0]))

        # ✅ If multiple files, create a ZIP archive
        unique_id = uuid.uuid4().hex[:6]
        zip_name = f"{original_name}_selected_{unique_id}.zip"
        zip_path = os.path.join(tempfile.gettempdir(), zip_name)

        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for pdf in output_files:
                zipf.write(pdf, os.path.basename(pdf))

        final_zip_path = move_to_downloads(zip_path, original_name, ".zip")
        return FileResponse(open(final_zip_path, 'rb'), as_attachment=True, filename=os.path.basename(final_zip_path))

    except Exception as e:
        return Response({'error': str(e)}, status=500)

    finally:
        # ✅ Delete temp input file & split files
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