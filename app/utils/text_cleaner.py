def clean_job_text(text: str, max_length: int = 6000) -> str:
    """
    Cleans raw page text:
    - Removes excessive whitespace
    - Trims length to avoid token overflow
    """

    cleaned = " ".join(text.split())

    if len(cleaned) > max_length:
        cleaned = cleaned[:max_length]

    return cleaned
