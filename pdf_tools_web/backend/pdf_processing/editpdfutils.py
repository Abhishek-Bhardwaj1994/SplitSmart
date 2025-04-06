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

def crop_pdf(input_path, crop_params):
    output_path = get_output_path(input_path, ".pdf")
    reader = PdfReader(input_path)
    writer = PdfWriter()

    for i, page in enumerate(reader.pages):
        left, top, right, bottom = crop_params.get(str(i), (0, 0, 0, 0))
        media_box = page.mediabox
        media_box.lower_left = (media_box.left + left, media_box.bottom + bottom)
        media_box.upper_right = (media_box.right - right, media_box.top - top)
        writer.add_page(page)

    with open(output_path, "wb") as f:
        writer.write(f)

    return output_path


def rotate_pdf(input_path, rotation_data):
    output_path = get_output_path(input_path, suffix="_rotated")
    reader = PdfReader(input_path)
    writer = PdfWriter()

    for i, page in enumerate(reader.pages):
        angle = rotation_data.get(str(i), 0)
        page.rotate(angle)
        writer.add_page(page)

    with open(output_path, "wb") as f:
        writer.write(f)

    return output_path


def delete_pages(input_path, pages_to_delete):
    output_path = get_output_path(input_path, suffix="_pages_deleted")
    reader = PdfReader(input_path)
    writer = PdfWriter()

    for i, page in enumerate(reader.pages):
        if i not in pages_to_delete:
            writer.add_page(page)

    with open(output_path, "wb") as f:
        writer.write(f)

    return output_path


def reorder_pages(input_path, new_order):
    output_path = get_output_path(input_path, suffix="_reordered")
    reader = PdfReader(input_path)
    writer = PdfWriter()

    for i in new_order:
        writer.add_page(reader.pages[i])

    with open(output_path, "wb") as f:
        writer.write(f)

    return output_path


def add_text_to_pdf(input_path, text_items):
    output_path = get_output_path(input_path, suffix="_text_added")
    packet = io.BytesIO()
    can = canvas.Canvas(packet, pagesize=letter)

    for item in text_items:
        x, y = item['position']
        text = item['text']
        font_size = item.get("font_size", 12)
        can.setFont("Helvetica", font_size)
        can.drawString(x, y, text)

    can.save()
    packet.seek(0)

    overlay_pdf = PdfReader(packet)
    base_pdf = PdfReader(input_path)
    writer = PdfWriter()

    for i, page in enumerate(base_pdf.pages):
        base_page = page
        if i < len(overlay_pdf.pages):
            base_page.merge_page(overlay_pdf.pages[i])
        writer.add_page(base_page)

    with open(output_path, "wb") as f:
        writer.write(f)

    return output_path


def add_image_to_pdf(input_path, image_path, position_data):
    output_path = get_output_path(input_path, suffix="_image_added")
    doc = fitz.open(input_path)
    img_rect = fitz.Rect(*position_data["coords"])
    page_num = position_data["page"]

    if page_num < len(doc):
        page = doc[page_num]
        page.insert_image(img_rect, filename=image_path)

    doc.save(output_path)
    doc.close()

    return output_path


def draw_on_pdf(input_path, draw_items):
    output_path = get_output_path(input_path, suffix="_drawn")
    doc = fitz.open(input_path)

    for item in draw_items:
        page = doc[item["page"]]
        shape = page.new_shape()
        color = item.get("color", (1, 0, 0))  # default red

        if item["type"] == "line":
            shape.draw_line(item["from"], item["to"])
        elif item["type"] == "rect":
            shape.draw_rect(item["rect"])
        elif item["type"] == "circle":
            shape.draw_circle(item["center"], item["radius"])
        shape.finish(color=color, fill=item.get("fill", False))
        shape.commit()

    doc.save(output_path)
    doc.close()

    return output_path


def apply_filter_to_pdf(input_path, filter_type="grayscale"):
    output_path = get_output_path(input_path, suffix="_filtered")
    doc = fitz.open(input_path)

    for page in doc:
        pix = page.get_pixmap()
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

        if filter_type == "grayscale":
            img = img.convert("L").convert("RGB")
        elif filter_type == "sepia":
            sepia = Image.new("RGB", img.size)
            pixels = img.load()
            for y in range(img.height):
                for x in range(img.width):
                    r, g, b = pixels[x, y]
                    tr = int(0.393 * r + 0.769 * g + 0.189 * b)
                    tg = int(0.349 * r + 0.686 * g + 0.168 * b)
                    tb = int(0.272 * r + 0.534 * g + 0.131 * b)
                    sepia.putpixel((x, y), (min(tr, 255), min(tg, 255), min(tb, 255)))
            img = sepia

        page_rect = page.rect
        img_path = f"/tmp/temp_filtered_{page.number}.png"
        img.save(img_path)
        page.clean_contents()
        page.insert_image(page_rect, filename=img_path)

    doc.save(output_path)
    doc.close()

    return output_path
