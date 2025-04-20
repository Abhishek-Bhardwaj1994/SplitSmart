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
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

# Register HEIF opener
register_heif_opener()

# Get user's Downloads folder
# DOWNLOADS_DIR = str(Path.home() / "Downloads")
DOWNLOADS_DIR = os.path.join("media", "output")
os.makedirs(DOWNLOADS_DIR, exist_ok=True)


# ✅ Generate output file path with '_changed' suffix
def get_output_path(original_path, ext):
    # DOWNLOADS_DIR = str(Path.home() / "Downloads")
    """Generate unique filename and save in Downloads folder"""
    unique_id = uuid.uuid4().hex[:8]  # Generate a short unique ID
    filename = f"{Path(original_path).stem}_changed_{unique_id}{ext}"
    return os.path.join(DOWNLOADS_DIR, filename)

from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import io
import json

def draw_on_pdf(input_path, draw_data, output_path):
    reader = PdfReader(input_path)
    writer = PdfWriter()

    for page_num, page in enumerate(reader.pages):
        packet = io.BytesIO()
        media_box = page.mediabox
        width = float(media_box.width)
        height = float(media_box.height)

        c = canvas.Canvas(packet, pagesize=(width, height))

        if str(page_num) in draw_data:
            for stroke in draw_data[str(page_num)]:
                color = HexColor(stroke["color"])
                width_val = stroke["width"]
                points = stroke["points"]
                if len(points) >= 2:
                    c.setStrokeColor(color)
                    c.setLineWidth(width_val)
                    c.moveTo(points[0][0], height - points[0][1])
                    for pt in points[1:]:
                        c.lineTo(pt[0], height - pt[1])
                    c.stroke()

        c.save()
        packet.seek(0)

        overlay_reader = PdfReader(packet)
        page.merge_page(overlay_reader.pages[0])
        writer.add_page(page)

    with open(output_path, "wb") as f:
        writer.write(f)

    return output_path
