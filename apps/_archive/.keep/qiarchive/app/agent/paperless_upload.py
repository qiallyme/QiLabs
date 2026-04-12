import os
import json
import urllib.request
import urllib.error
import mimetypes
from pathlib import Path

def upload_to_paperless(file_path: str, url: str, token: str, title: str = None) -> dict:
    """
    Upload a file to Paperless-ngx using standard library urllib.
    Returns the response dict if successful.
    """
    if not token:
        raise ValueError("Paperless token is required.")
    if not url:
        raise ValueError("Paperless URL is required.")
        
    api_url = f"{url.rstrip('/')}/api/documents/post_document/"
    
    boundary = "---Boundary" + os.urandom(16).hex()
    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": f"multipart/form-data; boundary={boundary}"
    }
    
    body = []
    
    # Add title if provided
    if title:
        body.append(f"--{boundary}".encode())
        body.append(f'Content-Disposition: form-data; name="title"'.encode())
        body.append(b"")
        body.append(title.encode())
        
    # Add document
    filename = os.path.basename(file_path)
    mime_type = mimetypes.guess_type(file_path)[0] or "application/octet-stream"
    
    body.append(f"--{boundary}".encode())
    body.append(f'Content-Disposition: form-data; name="document"; filename="{filename}"'.encode())
    body.append(f"Content-Type: {mime_type}".encode())
    body.append(b"")
    with open(file_path, "rb") as f:
        body.append(f.read())
        
    body.append(f"--{boundary}--".encode())
    body.append(b"")
    
    payload = b"\r\n".join(body)
    
    req = urllib.request.Request(api_url, data=payload, headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode()
            if response.status == 202:
                return {"status": "accepted", "task_id": res_body}
            return json.loads(res_body)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        raise Exception(f"Paperless upload failed ({e.code}): {error_body}")
    except Exception as e:
        raise Exception(f"Paperless upload failed: {e}")
