from PyPDF2 import PdfMerger, PdfReader, PdfWriter
from pdf2image import convert_from_path
from docx import Document
from reportlab.pdfgen import canvas
from PIL import Image
import os

# Merge PDFs
def merge_pdfs(file_paths):
    merger = PdfMerger()
    for file in file_paths:
        merger.append(file)
    output_file = "media/merged.pdf"
    merger.write(output_file)
    merger.close()
    return output_file

# Split PDF into separate pages
def split_pdf(file):
    reader = PdfReader(file)
    output_files = []
    for i, page in enumerate(reader.pages):
        writer = PdfWriter()
        writer.add_page(page)
        output_file = f"media/split_{i}.pdf"
        with open(output_file, "wb") as f:
            writer.write(f)
        output_files.append(output_file)
    return output_files[0]  # Returning the first split page

# Convert PDF to Word
def pdf_to_word(pdf_file):
    doc = Document()
    images = convert_from_path(pdf_file)
    for image in images:
        doc.add_paragraph(image.filename)
    output_file = "media/converted.docx"
    doc.save(output_file)
    return output_file

# Convert Word to PDF
def word_to_pdf(word_file):
    doc = Document(word_file)
    pdf_path = "media/converted.pdf"
    c = canvas.Canvas(pdf_path)
    c.drawString(100, 750, doc.paragraphs[0].text)
    c.save()
    return pdf_path

# Convert Image to PDF
def image_to_pdf(image_file):
    img = Image.open(image_file)
    pdf_path = "media/converted.pdf"
    img.convert('RGB').save(pdf_path)
    return pdf_path

# Convert PDF to Image (JPEG)
def pdf_to_image(pdf_file, format="JPEG"):
    images = convert_from_path(pdf_file)
    output_files = []
    for i, img in enumerate(images):
        img_path = f"media/output_{i}.{format.lower()}"
        img.save(img_path, format)
        output_files.append(img_path)
    return output_files
