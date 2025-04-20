from django.urls import path
from .views import (
    merge_pdfs_view, split_pdf_view, convert_pdf_to_word_view, convert_word_to_pdf_view,
    convert_image_to_pdf_view, convert_pdf_to_image_view, lock_unlock_pdf_view,compress_pdf_view
)
from .editpdfviews import ( draw_on_pdf_view, upload_pdf_view, set_csrf_cookie)

urlpatterns = [
    path('merge-pdf/', merge_pdfs_view),
    path('split-pdf/', split_pdf_view),
    path('pdf-to-word/', convert_pdf_to_word_view),
    path('word-to-pdf/', convert_word_to_pdf_view),
    path('heif-jpg-image-to-pdf/', convert_image_to_pdf_view),
    path('pdf-to-heif-jpg-image/', convert_pdf_to_image_view),
    path('lock-unlock-pdf/', lock_unlock_pdf_view),
    path('compress-pdf/', compress_pdf_view),
    path('edit-pdf/upload-pdf/', upload_pdf_view),
    # path('edit-pdf/', edit_pdf_view),  # initial upload
    # path('edit-pdf/crop/', crop_pdf_view),
    # path('edit-pdf/rotate/', rotate_pdf_view),
    # path('edit-pdf/delete/', delete_pages_view),
    # path('edit-pdf/reorder/', reorder_pages_view),
    # path('edit-pdf/add-text/', add_text_view),
    path('edit-pdf/draw/', draw_on_pdf_view),
    # path('edit-pdf/add-image/', add_image_view),
    # path('edit-pdf/download/', download_final_pdf_view),
    path("set-csrf/", set_csrf_cookie),
]
