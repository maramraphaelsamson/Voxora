import io
import re
from typing import Optional
from pypdf import PdfReader
import docx

class DocumentParser:
    @staticmethod
    def extract_from_txt(content_bytes: bytes) -> str:
        # Try UTF-8 first, fallback to latin-1
        try:
            return content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            return content_bytes.decode("latin-1", errors="ignore")

    @staticmethod
    def extract_from_pdf(content_bytes: bytes) -> str:
        reader = PdfReader(io.BytesIO(content_bytes))
        pages_text = []
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                pages_text.append(extracted)
        return "\n\n".join(pages_text)

    @staticmethod
    def extract_from_docx(content_bytes: bytes) -> str:
        doc = docx.Document(io.BytesIO(content_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(paragraphs)

    @classmethod
    def extract_text(cls, filename: str, content_bytes: bytes) -> str:
        lower_name = filename.lower()
        if lower_name.endswith((".txt", ".md", ".csv")):
            return cls.extract_from_txt(content_bytes)
        elif lower_name.endswith(".pdf"):
            return cls.extract_from_pdf(content_bytes)
        elif lower_name.endswith(".docx"):
            return cls.extract_from_docx(content_bytes)
        else:
            # Attempt plain text decoding as fallback
            return cls.extract_from_txt(content_bytes)
