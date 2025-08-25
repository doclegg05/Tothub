#!/usr/bin/env python3
import urllib.request
import zipfile
import os
import sys

url = "https://javascript.daypilot.org/download/1606/daypilot-lite-2024.4.606.zip"
output_dir = "client/public/js/daypilot"

# Create directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

# Download the file
print(f"Downloading DayPilot Lite from {url}...")
try:
    urllib.request.urlretrieve(url, f"{output_dir}/daypilot-lite.zip")
    print("Download complete.")
    
    # Extract the zip file
    print("Extracting files...")
    with zipfile.ZipFile(f"{output_dir}/daypilot-lite.zip", 'r') as zip_ref:
        zip_ref.extractall(output_dir)
    print("Extraction complete.")
    
    # List extracted files
    files = os.listdir(output_dir)
    print(f"Extracted files: {files}")
    
    # Remove the zip file
    os.remove(f"{output_dir}/daypilot-lite.zip")
    print("Cleanup complete.")
    
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)