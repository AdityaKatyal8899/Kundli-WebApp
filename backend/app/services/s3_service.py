import boto3
import os
import uuid
from typing import Dict
from botocore.config import Config
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from absolute path
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

BUCKET = os.getenv("AWS_BUCKET_NAME")

if not BUCKET:
    raise RuntimeError("AWS_BUCKET_NAME not configured")

def get_s3_client():
    """
    Returns a configured S3 client using regional endpoints and SigV4.
    """
    return boto3.client(
        "s3",
        region_name=os.getenv("AWS_REGION"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        config=Config(
            signature_version="s3v4",
            s3={"addressing_style": "virtual"}
        )
    )

def gen_presigned_url(object_key: str, expiration: int = 3600) -> str:
    """
    Generates a temporary signed URL to view a private S3 object (GET).
    """
    s3 = get_s3_client()
    url = s3.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": BUCKET,
            "Key": object_key,
        },
        ExpiresIn=expiration,
    )
    return url

def generate_upload_url(user_id: str, file_type: str) -> Dict:
    """
    Generates a pre-signed URL for direct PUT upload to S3 from the browser.
    """
    ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
    if file_type not in ALLOWED_TYPES:
        raise ValueError(f"Unsupported file type: {file_type}. Supported: {ALLOWED_TYPES}")

    ext = file_type.split("/")[-1]
    if ext == "jpeg": ext = "jpg"
    
    unique_id = str(uuid.uuid4())
    object_key = f"profiles/{user_id}/photos/{unique_id}.{ext}"

    s3 = get_s3_client()
    
    # Debug Environment Sanity
    from datetime import datetime
    print("=== S3 PRESIGNED URL DEBUG ===")
    print("Server UTC time:", datetime.utcnow())
    print("AWS_REGION:", os.getenv("AWS_REGION"))
    print("AWS_BUCKET_NAME:", BUCKET)
    print("Access Key ID:", os.getenv("AWS_ACCESS_KEY_ID")[:6] + "...masked" if os.getenv("AWS_ACCESS_KEY_ID") else "None")
    print("Object Key:", object_key)
    
    upload_url = s3.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": BUCKET,
            "Key": object_key,
            "ContentType": file_type,
        },
        ExpiresIn=300, # 5 minutes
    )

    print("Generated Upload URL:", upload_url)
    print("================================")

    return {
        "upload_url": upload_url,
        "object_key": object_key
    }

def delete_s3_object(object_key: str):
    """
    Deletes an object from S3.
    """
    s3 = get_s3_client()
    s3.delete_object(Bucket=BUCKET, Key=object_key)
