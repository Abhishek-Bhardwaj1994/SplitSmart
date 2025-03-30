import os
import subprocess
import fitz  # PyMuPDF for PDF text extraction
import pytesseract  # OCR for PDF to Word conversion
from PyPDF2 import PdfMerger, PdfReader, PdfWriter
from pdf2image import convert_from_path
from docx import Document
from PIL import Image
from pillow_heif import register_heif_opener  # HEIF Support
from pathlib import Path
import uuid
from pillow_heif import register_heif_opener
import shutil

# Register HEIF opener
register_heif_opener()

# Get user's Downloads folder
DOWNLOADS_DIR = str(Path.home() / "Downloads")

# ✅ Generate output file path with '_changed' suffix
def get_output_path(original_path, ext):
    """Generate unique filename and save in Downloads folder"""
    unique_id = uuid.uuid4().hex[:8]  # Generate a short unique ID
    filename = f"{Path(original_path).stem}_changed_{unique_id}{ext}"
    return os.path.join(DOWNLOADS_DIR, filename)


# ✅ Merge PDFs
def merge_pdfs(file_paths):
    """Merge multiple PDFs into one and return the final file path."""
    if not file_paths or len(file_paths) < 2:
        raise ValueError("At least two PDFs are required for merging.")
    
    

    temp_output = get_output_path("merged", ".pdf")
    merger = PdfMerger()

    try:
        for file in file_paths:
            merger.append(file)
        merger.write(temp_output)
    except Exception as e:
        raise RuntimeError(f"PDF Merge failed: {str(e)}")
    finally:
        merger.close()

    return temp_output


# ✅ Split PDF
def split_pdf(file):
    output_files = []
    try:
        reader = PdfReader(file)
        for i, page in enumerate(reader.pages):
            writer = PdfWriter()
            writer.add_page(page)
            output_file = get_output_path(file, f"_{i}.pdf")
            with open(output_file, "wb") as f:
                writer.write(f)
            output_files.append(output_file)
    except Exception as e:
        raise RuntimeError(f"PDF Split failed: {str(e)}")

    return output_files


# ✅ Convert PDF to Word (Improved)
def pdf_to_word(pdf_file):
    if not os.path.exists(pdf_file):
        raise RuntimeError(f"File not found: {pdf_file}")

    output_docx = get_output_path(pdf_file, ".docx")
    doc = Document()

    text = ""

    try:
        # Open PDF and extract text
        with fitz.open(pdf_file) as pdf_reader:
            for page in pdf_reader:
                text += page.get_text("text") + "\n\n"

        # If no text found, use OCR
        if not text.strip():
            print("No text found, running OCR...")
            images = convert_from_path(pdf_file)
            for image in images:
                text += pytesseract.image_to_string(image) + "\n\n"

        if not text.strip():
            raise RuntimeError("No text extracted from PDF!")

        print(f"Extracted text:\n{text[:500]}")  # Debugging
        doc.add_paragraph(text)
        doc.save(output_docx)

    except Exception as e:
        raise RuntimeError(f"PDF to Word conversion failed: {str(e)}")

    return output_docx


# ✅ Convert Word to PDF (Fixed Output Path)
def word_to_pdf(word_file):
    output_pdf = get_output_path(word_file, ".pdf")
    libreoffice_path = os.getenv("LIBREOFFICE_PATH", "soffice")

    try:
        subprocess.run([
            libreoffice_path, "--headless", "--convert-to", "pdf",
            "--outdir", os.path.dirname(output_pdf), word_file
        ], check=True)

        converted_file = os.path.join(os.path.dirname(output_pdf), f"{Path(word_file).stem}.pdf")

        if not os.path.exists(converted_file):
            raise FileNotFoundError("PDF conversion failed.")

        shutil.move(converted_file, output_pdf)
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Word to PDF conversion failed: {str(e)}")

    return output_pdf


# ✅ Convert Image to PDF (Supports JPG, PNG, HEIF)
def image_to_pdf(image_file):
    output_pdf = get_output_path(image_file, ".pdf")
    try:
        img = Image.open(image_file)
        img.convert("RGB").save(output_pdf)
    except Exception as e:
        raise RuntimeError(f"Image to PDF conversion failed: {str(e)}")
    return output_pdf


# ✅ Convert PDF to Image (Supports JPG, PNG, HEIF)
def pdf_to_image(pdf_file, format="JPEG"):
    output_files = []
    try:
        images = convert_from_path(pdf_file)
        for i, img in enumerate(images):
            img_path = get_output_path(pdf_file, f"_{i}.{format.lower()}")
            img.save(img_path, format)
            output_files.append(img_path)
    except Exception as e:
        raise RuntimeError(f"PDF to Image conversion failed: {str(e)}")
    return output_files
