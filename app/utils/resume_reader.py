from PyPDF2 import PdfReader
from docx import Document


def read_resume_text(file_path: str) -> str:
    if file_path.endswith(".pdf"):
        reader = PdfReader(file_path)
        return " ".join(page.extract_text() or "" for page in reader.pages)

    elif file_path.endswith(".docx"):
        doc = Document(file_path)
        return " ".join(p.text for p in doc.paragraphs)

    else:
        raise ValueError("Unsupported resume format")
