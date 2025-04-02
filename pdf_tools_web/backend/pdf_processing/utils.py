import os
import subprocess
import fitz  # PyMuPDF for PDF text extraction
import pytesseract  # OCR for PDF to Word conversion
from PyPDF2 import PdfMerger, PdfReader, PdfWriter
from pdf2image import convert_from_path
from docx import Document
from PIL import Image,UnidentifiedImageError
# from PIL import 
from pillow_heif import register_heif_opener  # HEIF Support
from pathlib import Path
import uuid
from pillow_heif import register_heif_opener
import shutil

# Register HEIF opener
register_heif_opener()

# Get user's Downloads folder
# DOWNLOADS_DIR = str(Path.home() / "Downloads")
DOWNLOADS_DIR = os.path.join("media", "downloads")
os.makedirs(DOWNLOADS_DIR, exist_ok=True)


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
def split_pdf(file_path):
    """Splits a PDF into individual pages and saves them in 'downloads'."""
    output_files = []
    try:
        reader = PdfReader(file_path)
        for i, page in enumerate(reader.pages, start=1):  # Start from 1 for better naming
            writer = PdfWriter()
            writer.add_page(page)

            output_file = get_output_path(file_path, i)
            with open(output_file, "wb") as f:
                writer.write(f)

            output_files.append(output_file)

        # ✅ Delete original file after splitting
        if os.path.exists(file_path):
            os.remove(file_path)

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
def image_to_pdf(image_files):
    """Convert multiple images to a single PDF"""
    output_pdf = get_output_path(image_files[0], ".pdf")
    images = []

    try:
        for image_file in image_files:
            try:
                with open(image_file, "rb") as f:  # Open explicitly in binary mode
                    img = Image.open(f)
                    img.load()  # Ensure image is properly loaded before processing

                if img.mode != "RGB":
                    img = img.convert("RGB")
                images.append(img)
            except UnidentifiedImageError:
                raise RuntimeError(f"Invalid image file: {image_file}")

        if images:
            images[0].save(output_pdf, "PDF", save_all=True, append_images=images[1:])
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
