import os
import shutil
from typing import Optional,List,Dict
from uuid import uuid4

from fastapi import UploadFile, HTTPException, status
from config import settings
def _save_single_upload_file(upload_file: UploadFile, file_path: str):
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno al guardar el archivo: {e}"
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

        nombre_solicitado = bloque.get("url")

        archivo = archivos_dict.get(nombre_solicitado)
        if not archivo:
            raise HTTPException(
                status_code=400,
                detail=f"Imagen '{nombre_solicitado}' no fue enviada."
            )

        extension = _validate_image_and_get_extension(archivo)

        if extension.lower() not in [".jpg", ".jpeg", ".png", ".webp"]:
            raise HTTPException(
                status_code=400,
                detail="Formato de imagen no permitido."
            )

        nombre_archivo = f"{uuid4().hex}_{archivo.filename}"
        ruta_archivo = os.path.join(settings.IMAGE_UPLOAD_DIR, nombre_archivo)

        _save_single_upload_file(archivo, ruta_archivo)

        bloque["url"] = f"{settings.IMAGE_GET_DIR}/{nombre_archivo}"

    return enunciado

def _update_enunciado(
    enunciado_anterior: List[Dict],
    enunciado_nuevo: List[Dict],
    imagenes: List[UploadFile]
) -> List[Dict]:
    imagenes_guardadas = []
    nombres_imagenes_usadas = set()

    for bloque in enunciado_nuevo:
        if bloque.get("tipo") == "imagen":
            url = bloque.get("url", "")
            if url.startswith("static/problema_imagenes") or url.startswith("problema_imagenes")   :
                bloque["url"] = f"/{url}"
                nombres_imagenes_usadas.add(url)
                continue

            nombre_archivo_original = url
            imagen = next((img for img in imagenes if img.filename == nombre_archivo_original), None)

            if imagen is None:
                raise HTTPException(
                    status_code=400,
                    detail=f"No se encontró el archivo de imagen para '{nombre_archivo_original}'"
                )

            _validate_image_and_get_extension(imagen)
            nombre_unico = f"{uuid4().hex}_{imagen.filename}"
            ruta_guardado = os.path.join(settings.IMAGE_UPLOAD_DIR, nombre_unico)
            _save_single_upload_file(imagen, ruta_guardado)

            nueva_url = f"{settings.IMAGE_GET_DIR}/{nombre_unico}"
            bloque["url"] = nueva_url
            nombres_imagenes_usadas.add(nueva_url.lstrip("/"))

    for bloque in enunciado_anterior:
        if bloque.get("tipo") == "imagen" and bloque.get("url"):
            url_antigua = bloque["url"].lstrip("/")
            if url_antigua not in nombres_imagenes_usadas:
                ruta_completa = os.path.join(os.getcwd(), url_antigua)
                if os.path.exists(ruta_completa):
                    os.remove(ruta_completa)

    return enunciado_nuevo