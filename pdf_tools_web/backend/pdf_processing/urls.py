from django.urls import path
from .views import (
    merge_pdfs_view, split_pdf_view, convert_pdf_to_word_view, convert_word_to_pdf_view,
    convert_image_to_pdf_view, convert_pdf_to_image_view
)

urlpatterns = [
    path('merge-pdf/', merge_pdfs_view),
    path('split/', split_pdf_view),
    path('pdf-to-word/', convert_pdf_to_word_view),
    path('word-to-pdf/', convert_word_to_pdf_view),
    path('image-to-pdf/', convert_image_to_pdf_view),
    path('pdf-to-image/', convert_pdf_to_image_view),
]
