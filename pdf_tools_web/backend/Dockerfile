# FROM python:3.9
# WORKDIR /app
# COPY . .
# RUN pip install -r requirements.txt
# CMD ["gunicorn", "pdf_tools.wsgi"]

FROM python:3.9

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y poppler-utils libreoffice

# Copy project files
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Start the application
CMD ["gunicorn", "pdf_tools.wsgi"]

