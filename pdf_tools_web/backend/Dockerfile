# FROM python:3.9
# WORKDIR /app
# COPY . .
# RUN pip install -r requirements.txt
# CMD ["gunicorn", "pdf_tools.wsgi"]

# Use Python Image
FROM python:3.9

# Set Working Directory
WORKDIR /app

# Install System Dependencies for LibreOffice & Poppler
RUN apt-get update && apt-get install -y \
    libreoffice \
    poppler-utils \
    && apt-get clean

# Copy Project Files
COPY . .

# Install Python Dependencies
RUN pip install -r requirements.txt

# Expose Necessary Ports (if needed)
EXPOSE 8000

# Set Environment Variable for LibreOffice
ENV LIBREOFFICE_PATH="soffice"

# Start Django Server (or Gunicorn in Production)
CMD ["gunicorn", "pdf_tools.wsgi:application", "--bind", "0.0.0.0:8000"]
