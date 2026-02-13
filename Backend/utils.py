import os
import shutil
from typing import Optional,List,Dict
from uuid import uuid4
from urllib.parse import urlparse

from fastapi import UploadFile, HTTPException, status
from config import settings
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name=settings.CLOUD_NAME,
    api_key=settings.API_KEY,
    api_secret=settings.API_SECRET,
    secure=True
)

def _is_cloudinary_stored_url(url: str) -> bool:
    if not isinstance(url, str) or not url.strip():
        return False

    parsed = urlparse(url.strip())
    if parsed.scheme not in {"http", "https"}:
        return False

    host = (parsed.netloc or "").lower()
    if not host.endswith("cloudinary.com"):
        return False

    path = (parsed.path or "").lstrip("/")
    # secure_url típico: /<cloud_name>/image/upload/...
    return path.startswith(f"{settings.CLOUD_NAME}/")

def _extract_cloudinary_public_id(url: str) -> str | None:
    if not isinstance(url, str) or not url.strip():
        return None

    parsed = urlparse(url.strip())
    path_parts = [part for part in (parsed.path or "").split("/") if part]
    if not path_parts:
        return None

    # Estructura esperada:
    # /<cloud_name>/image/upload[/v<version>]/<folder>/<public_id>.<ext>
    try:
        upload_index = path_parts.index("upload")
    except ValueError:
        return None

    public_parts = path_parts[upload_index + 1:]
    if not public_parts:
        return None

    # Si existe versión (v123...), la omitimos.
    if public_parts[0].startswith("v") and public_parts[0][1:].isdigit():
        public_parts = public_parts[1:]

    if not public_parts:
        return None

    # Cloudinary destroy espera public_id sin extensión.
    public_parts[-1] = os.path.splitext(public_parts[-1])[0]
    public_id = "/".join(public_parts).strip("/")
    return public_id or None

def _save_single_upload_file(upload_file: UploadFile) -> str:
    """
    Sube un archivo a Cloudinary y devuelve la URL pública.
    """
    try:
        # Convertimos el UploadFile a bytes
        file_bytes = upload_file.file.read()
        
        result = cloudinary.uploader.upload(
            file_bytes,
            folder="usuarios",  # Carpeta dentro de tu Cloudinary
            public_id=None,     # Si quieres nombre automático
            overwrite=True
        )
        
        return result.get("secure_url")  # URL pública segura
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al subir a Cloudinary: {e}"
        )

def _validate_image_and_get_extension(upload_file: UploadFile) -> str:
    if not upload_file.content_type or not upload_file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El archivo debe ser una imagen válida.")
    file_extension = os.path.splitext(upload_file.filename)[1]
    return file_extension

def _process_image_blocks(enunciado: list[dict], archivos: list[UploadFile]) -> list[dict]:
    if enunciado is None:
        return []

    archivos_dict = {archivo.filename: archivo for archivo in archivos}

    for bloque in enunciado:
        if bloque.get("tipo") != "imagen":
            continue

        nombre_solicitado = bloque.get("nombre")
        archivo = archivos_dict.get(nombre_solicitado)
        if not archivo:
            raise HTTPException(status_code=400, detail=f"Imagen '{nombre_solicitado}' no fue enviada.")

        extension = _validate_image_and_get_extension(archivo)
        if extension.lower() not in [".jpg", ".jpeg", ".png", ".webp"]:
            raise HTTPException(status_code=400, detail="Formato de imagen no permitido.")

        # Subir a Cloudinary y obtener URL
        url = _save_single_upload_file(archivo)
        bloque["url"] = url

    return enunciado

def _update_enunciado(
    enunciado_anterior: List[Dict],
    enunciado_nuevo: List[Dict],
    imagenes: List[UploadFile]
) -> List[Dict]:

    urls_usadas = set()
    imagenes_por_nombre = {img.filename: img for img in (imagenes or [])}

    # Procesar nuevas imágenes
    for bloque in enunciado_nuevo:
        if bloque.get("tipo") != "imagen":
            continue

        url = (bloque.get("url") or "").strip()
        if url:
            urls_usadas.add(url)
            continue

        nombre_archivo_original = (bloque.get("nombre") or "").strip()
        imagen = imagenes_por_nombre.get(nombre_archivo_original)
        if imagen is None:
            raise HTTPException(status_code=400, detail=f"No se encontró el archivo de imagen para '{nombre_archivo_original}'")

        _validate_image_and_get_extension(imagen)
        nueva_url = _save_single_upload_file(imagen)
        bloque["url"] = nueva_url
        urls_usadas.add(nueva_url)

    # Borrar imágenes antiguas que ya no se usan
    for bloque in enunciado_anterior:
        if bloque.get("tipo") == "imagen" and bloque.get("url"):
            url_antigua = bloque["url"]
            if url_antigua not in urls_usadas:
                public_id = _extract_cloudinary_public_id(url_antigua)
                if not public_id:
                    continue
                try:
                    cloudinary.uploader.destroy(public_id)
                except Exception:
                    # no bloquea el update si falla la eliminación
                    pass

    return enunciado_nuevo
