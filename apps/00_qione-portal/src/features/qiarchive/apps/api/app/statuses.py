from enum import Enum

class DocumentStatus(str, Enum):
    INBOX = "inbox"
    STAGED = "staged"
    DUPLICATE = "duplicate"
    REVIEW = "review"
    UPLOAD_PENDING = "upload_pending"
    UPLOADED = "uploaded"
    INDEXED = "indexed"
    ERROR = "error"
