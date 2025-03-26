from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import FileResponse
from .utils import merge_pdfs, split_pdf, pdf_to_word, word_to_pdf, image_to_pdf, pdf_to_image
from django.core.files.storage import default_storage

def save_temp_file(uploaded_file):
    file_path = default_storage.save(f'media/{uploaded_file.name}', uploaded_file)
    return file_path

@api_view(['POST'])
def merge_pdfs_view(request):
    file_paths = [save_temp_file(f) for f in request.FILES.getlist('files')]
    output_file = merge_pdfs(file_paths)
    return FileResponse(open(output_file, 'rb'), as_attachment=True, filename='merged.pdf')

@api_view(['POST'])
def split_pdf_view(request):
    file = save_temp_file(request.FILES['file'])
    output_file = split_pdf(file)
    return FileResponse(open(output_file, 'rb'), as_attachment=True, filename='split_page.pdf')

@api_view(['POST'])
def convert_pdf_to_word_view(request):
    file = save_temp_file(request.FILES['file'])
    output_file = pdf_to_word(file)
    return FileResponse(open(output_file, 'rb'), as_attachment=True, filename='converted.docx')

@api_view(['POST'])
def convert_word_to_pdf_view(request):
    file = save_temp_file(request.FILES['file'])
    output_file = word_to_pdf(file)
    return FileResponse(open(output_file, 'rb'), as_attachment=True, filename='converted.pdf')

@api_view(['POST'])
def convert_image_to_pdf_view(request):
    file = save_temp_file(request.FILES['file'])
    output_file = image_to_pdf(file)
    return FileResponse(open(output_file, 'rb'), as_attachment=True, filename='converted.pdf')

@api_view(['POST'])
def convert_pdf_to_image_view(request):
    file = save_temp_file(request.FILES['file'])
    output_files = pdf_to_image(file)
    return FileResponse(open(output_files[0], 'rb'), as_attachment=True, filename='converted.jpg')
