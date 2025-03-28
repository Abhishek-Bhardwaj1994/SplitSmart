import os
from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import FileResponse
from .utils import merge_pdfs, split_pdf, pdf_to_word, word_to_pdf, image_to_pdf, pdf_to_image

def save_temp_file(uploaded_file):
    """Save uploaded file temporarily and return the file path."""
    file_path = default_storage.save(f'media/{uploaded_file.name}', uploaded_file)
    return os.path.join(settings.MEDIA_ROOT, uploaded_file.name)

def delete_temp_file(file_path):
    """Delete the temporary file after processing."""
    if os.path.exists(file_path):
        os.remove(file_path)

# ✅ Merge PDFs
@api_view(['POST'])
def merge_pdfs_view(request):
    file_paths = [save_temp_file(f) for f in request.FILES.getlist('files')]
    output_file = merge_pdfs(file_paths)

    response = FileResponse(open(output_file, 'rb'), as_attachment=True, filename='merged.pdf')

    # Delete temporary files
    for file in file_paths:
        delete_temp_file(file)
    delete_temp_file(output_file)

    return response

# ✅ Split PDF
@api_view(['POST'])
def split_pdf_view(request):
    file = save_temp_file(request.FILES['file'])
    output_file = split_pdf(file)

    response = FileResponse(open(output_file, 'rb'), as_attachment=True, filename='split_page.pdf')

    # Delete temp files
    delete_temp_file(file)
    delete_temp_file(output_file)

    return response

# ✅ Convert PDF to Word
@api_view(['POST'])
def convert_pdf_to_word_view(request):
    file = save_temp_file(request.FILES['file'])
    output_file = pdf_to_word(file)

    response = FileResponse(open(output_file, 'rb'), as_attachment=True, filename='converted.docx')

    # Delete temp files
    delete_temp_file(file)
    delete_temp_file(output_file)

    return response

# ✅ Convert Word to PDF
@api_view(['POST'])
def convert_word_to_pdf_view(request):
    file = save_temp_file(request.FILES['file'])
    output_file = word_to_pdf(file)

    response = FileResponse(open(output_file, 'rb'), as_attachment=True, filename='converted.pdf')

    # Delete temp files
    delete_temp_file(file)
    delete_temp_file(output_file)

    return response

# ✅ Convert Image to PDF
@api_view(['POST'])
def convert_image_to_pdf_view(request):
    file = save_temp_file(request.FILES['file'])
    output_file = image_to_pdf(file)

    response = FileResponse(open(output_file, 'rb'), as_attachment=True, filename='converted.pdf')

    # Delete temp files
    delete_temp_file(file)
    delete_temp_file(output_file)

    return response

# ✅ Convert PDF to Image (Multiple Files)
@api_view(['POST'])
def convert_pdf_to_image_view(request):
    file = save_temp_file(request.FILES['file'])
    output_files = pdf_to_image(file)  # This function returns multiple images

    response = FileResponse(open(output_files[0], 'rb'), as_attachment=True, filename='converted.jpg')

    # Delete temp files
    delete_temp_file(file)
    for img_file in output_files:
        delete_temp_file(img_file)

    return response
