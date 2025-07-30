from fastapi import UploadFile,HTTPException, status
from passlib.context import CryptContext
import json
import shutil
from uuid import uuid4
from typing import List,Optional
from pydantic import parse_obj_as
from sqlmodel import Session, select,func
from sqlalchemy.orm import joinedload
from sqlalchemy import desc, asc,case
from model import Usuario, Problema, Solucion, Reaccion
from schema import (
    UsuarioCreate,UsuarioUpdate, UsuarioRead,
    ProblemaCreate, ProblemaRead,ProblemaUpdate,
    SolucionCreate, SolucionRead,SolucionUpdate
)
from config import settings
from datetime import datetime, timedelta
from jose import jwt
import os
from utils import _save_single_upload_file,_validate_image_and_get_extension,_update_enunciado,_process_image_blocks

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# Usuario
def crear_token_de_acceso(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_usuario(session: Session, usuario_data: UsuarioCreate):
    hashed_password = pwd_context.hash(usuario_data.contraseña)

    user = Usuario(
        nombre=usuario_data.nombre,
        correo=usuario_data.correo,
        contraseña=hashed_password,
        aportaciones=0,
        publicaciones=0,
        foto=None 
    )

    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def get_usuario(session: Session, id_usuario: int):
    return session.get(Usuario, id_usuario)



def edit_usuario(session: Session, user_id: int, usuario_data: UsuarioUpdate, foto: UploadFile | None = None):
    user = session.query(Usuario).filter(Usuario.id_usuario == user_id).first()
    if not user:
        raise ValueError("Usuario no encontrado")

    # Verificar contraseña actual
    if not verificar_contraseña(usuario_data.password, user.contraseña):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Contraseña actual incorrecta"
        )

    # Actualizar correo si lo  proporciona
    if usuario_data.email is not None:
        user.correo = usuario_data.email

    # Cambiar contraseña si nueva_contraseña fue enviada
    if usuario_data.new_password is not None:
        user.contraseña = pwd_context.hash(usuario_data.new_password)

    # Cambiar foto si fue enviada
    if foto is not None:
        extension = _validate_image_and_get_extension(foto)
        if extension.lower() not in [".jpg", ".jpeg", ".png", ".webp"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Formato de imagen no permitido"
            )
        nombre_archivo = f"{user_id}_{foto.filename}"
        ruta_archivo = os.path.join(settings.USER_PHOTOS_DIR, nombre_archivo)
        _save_single_upload_file(foto, ruta_archivo)
        user.foto = f"{settings.USER_GET_DIR}/{nombre_archivo}"

    session.commit()
    session.refresh(user)
    return {"message": "Usuario actualizado correctamente"}

def verificar_contraseña(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def autenticar_usuario(session: Session, email: str, contraseña: str):
    usuario = session.query(Usuario).filter(Usuario.correo == email).first()
    if not usuario:
        return None
    if not verificar_contraseña(contraseña, usuario.contraseña):
        return None
    return usuario

# Problema

def create_problema(
    session: Session,
    problema_data: ProblemaCreate,
    imagenes: List[UploadFile]
):

    enunciado = problema_data.enunciado
    if enunciado is None:
        raise HTTPException(status_code=400, detail="El campo 'enunciado' es obligatorio")
    expected_image_blocks = sum(1 for bloque in enunciado if bloque.get("tipo") == "imagen")
    if len(imagenes) < expected_image_blocks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Faltan imágenes. El enunciado requiere {expected_image_blocks} imágenes, pero solo se recibieron {len(imagenes)}."
        )
    enunciado = _process_image_blocks(enunciado,imagenes)
    problema_orm = Problema(
        titulo=problema_data.titulo,
        materia=problema_data.materia,
        tipo=problema_data.tipo,
        propietario=problema_data.propietario,
        dificultad=problema_data.dificultad,
        carrera=problema_data.carrera,
        id_usuario=problema_data.id_usuario,
        enunciado=enunciado
    )

    session.add(problema_orm)
    session.commit()
    session.refresh(problema_orm)

    return problema_orm

def list_problemas(
    session: Session,
    skip: int = 0,
    limit: int = 20,
    titulo: Optional[str] = None,
    materia: Optional[str] = None,
    tipo: Optional[str] = None,
    dificultad: Optional[str] = None,
    carrera: Optional[str] = None,
):
    query = select(Problema)

    if titulo:
        query = query.where(Problema.titulo.ilike(f"%{titulo}%"))
    if materia:
        query = query.where(Problema.materia == materia)
    if tipo:
        query = query.where(Problema.tipo == tipo)
    if dificultad:
        query = query.where(Problema.dificultad == dificultad)
    if carrera:
        query = query.where(Problema.carrera == carrera)

    query = query.offset(skip).limit(limit)

    resultados = session.execute(query).scalars().all()

    # Si tu response_model espera un total o paginación extra:
    return {
        "items": resultados,
        "total": len(resultados)  # o un count real si quieres paginación precisa
    }

def get_problema_by_user(session: Session, id_user: int, skip: int = 0, limit: int = 10):
    total = session.exec(
        select(func.count()).select_from(Problema).where(Problema.id_usuario == id_user)
    ).one()

    items = session.exec(
        select(Problema).where(Problema.id_usuario == id_user).offset(skip).limit(limit)
    ).all()

    return {"items": items, "total": total}

def get_problema(session: Session, id_problema: int):
    return session.get(Problema, id_problema)


def edit_problema(
    session: Session,
    problem_id: int,
    problema_data: ProblemaUpdate,
    imagenes: List[UploadFile]
):
    problema = session.query(Problema).filter(Problema.id_problema == problem_id).first()

    if not problema:
        raise HTTPException(status_code=404, detail="Problema no encontrado")

    enunciado_anterior = problema.enunciado
    enunciado_nuevo = problema_data.enunciado

    expected_image_blocks = sum(1 for bloque in enunciado_nuevo if bloque.get("tipo") == "imagen" and not bloque.get("url", "").startswith("static/problema_imagenes"))
    if len(imagenes) < expected_image_blocks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Faltan imágenes. El enunciado requiere {expected_image_blocks} imágenes nuevas o reemplazadas, pero solo se recibieron {len(imagenes)}."
        )
    if imagenes: 
        enunciado_actualizado = _update_enunciado(enunciado_anterior, enunciado_nuevo, imagenes)
    else:
        enunciado_actualizado = enunciado_nuevo 
    for campo in ["titulo", "materia", "tipo", "propietario", "dificultad", "carrera"]:
        valor = getattr(problema_data, campo)
        if valor:  
            setattr(problema, campo, valor)
    if enunciado_actualizado:
        problema.enunciado = enunciado_actualizado
    session.commit()
    session.refresh(problema)

    return problema

# Solucion
def create_solucion(session: Session, solucion_data: SolucionCreate, imagenes : list[UploadFile]):
    
    contenido = solucion_data.contenido
    if contenido is None:
        raise HTTPException(status_code=400, detail="El campo 'enunciado' es obligatorio")
    expected_image_blocks = sum(1 for bloque in contenido if bloque.get("tipo") == "imagen")

    if len(imagenes) < expected_image_blocks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Faltan imágenes. El enunciado requiere {expected_image_blocks} imágenes, pero solo se recibieron {len(imagenes)}."
        )
    
    solucion_data.contenido = _process_image_blocks(contenido,imagenes)
    solucion = Solucion(
        id_problema=solucion_data.id_problema,
        id_usuario=solucion_data.id_usuario,
        contenido=contenido,
        likes=0,
        dislikes=0,
    )
    session.add(solucion)
    session.commit()
    session.refresh(solucion)
    return solucion

def edit_solucion(
    session : Session,
    solucion_id: int ,
    solucion_data: SolucionUpdate,
    imagenes: list[UploadFile]
    ):
    solucion = session.query(Solucion).filter(Solucion.id_solucion == solucion_id).first()

    if not solucion:
        raise HTTPException(status_code=404, detail="Solucion no encontrado")

     
    enunciado_anterior = solucion.contenido
    enunciado_nuevo = solucion_data.contenido
    if imagenes:
        expected_image_blocks = sum(1 for bloque in enunciado_nuevo if bloque.get("tipo") == "imagen" and not bloque.get("url", "").startswith("static/problema_imagenes"))
        if len(imagenes) < expected_image_blocks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Faltan imágenes. La solucion requiere {expected_image_blocks} imágenes nuevas o reemplazadas, pero solo se recibieron {len(imagenes)}."
            )
        
        solucion_actualizado = _update_enunciado(enunciado_anterior, enunciado_nuevo, imagenes)
    else:
        solucion_actualizado = enunciado_nuevo 
    if solucion_actualizado:
        solucion.contenido = solucion_actualizado
    session.commit()
    session.refresh(solucion)

    return solucion


def list_soluciones_por_problema(session: Session, id_problema: int, skip: int = 0, limit: int = 10):
    total = session.exec(
        select(func.count()).select_from(Solucion).where(Solucion.id_problema == id_problema)
    ).one()

    soluciones = session.exec(
        select(
            Solucion,
            Usuario.nombre,
            func.count(case((Reaccion.tipo == 1, 1))).label("likes"),
            func.count(case((Reaccion.tipo == -1, 1))).label("dislikes"),
        )
        .join(Usuario, Usuario.id_usuario == Solucion.id_usuario)
        .join(Reaccion, Reaccion.id_solucion == Solucion.id_solucion, isouter=True)
        .where(Solucion.id_problema == id_problema)
        .group_by(Solucion.id_solucion, Usuario.id_usuario, Usuario.nombre)  
        .order_by(func.count(case((Reaccion.tipo == 1, 1))).desc(),
                func.count(case((Reaccion.tipo == -1, 1))).asc())
        .offset(skip)
        .limit(limit)
    ).all()

    soluciones_response: List[SolucionRead] = []

    for solucion, nombre, likes, dislikes in soluciones: 
        if isinstance(solucion.contenido, str):
            try:
                solucion.contenido = json.loads(solucion.contenido)
            except json.JSONDecodeError:
                solucion.contenido = []

        soluciones_response.append(SolucionRead(
            id_solucion=solucion.id_solucion,
            id_usuario=solucion.id_usuario,
            nombre=nombre,   
            contenido=solucion.contenido,
            likes=likes,
            dislikes=dislikes,
            fecha=solucion.fecha
        ))

    return {
        "items": soluciones_response,
        "total": total,
    }

def list_soluciones_por_usuario(session: Session, id_user: int, skip: int = 0, limit: int = 10):
    total = session.exec(
        select(func.count()).select_from(Solucion).where(Solucion.id_usuario == id_user)
    ).one()

    soluciones = session.exec(
        select(
            Solucion,
            Problema.titulo, 
            func.count(case((Reaccion.tipo == 1, 1))).label("likes"),
            func.count(case((Reaccion.tipo == -1, 1))).label("dislikes"),
        )
        .join(Problema, Problema.id_problema == Solucion.id_problema)
        .join(Reaccion, Reaccion.id_solucion == Solucion.id_solucion, isouter=True)
        .where(Solucion.id_usuario == id_user)
        .group_by(Solucion.id_solucion, Problema.id_problema, Problema.titulo)  # 👈 igual que hicimos antes
        .order_by(
            func.count(case((Reaccion.tipo == 1, 1))).desc(),
            func.count(case((Reaccion.tipo == -1, 1))).asc()
        )
        .offset(skip)
        .limit(limit)
    ).all()


    soluciones_response: List[SolucionRead] = []

    for solucion, titulo, likes, dislikes in soluciones: 
        if isinstance(solucion.contenido, str):
            try:
                solucion.contenido = json.loads(solucion.contenido)
            except json.JSONDecodeError:
                solucion.contenido = []

        soluciones_response.append(SolucionRead(
            id_solucion=solucion.id_solucion,
            id_usuario=solucion.id_usuario,
            nombre=titulo,   
            contenido=solucion.contenido,
            likes=likes,
            dislikes=dislikes,
            fecha=solucion.fecha
        ))

    return {"items": soluciones_response, "total": total}



def get_solucion_por_id(session: Session, id_solucion: int):
    solucion = session.get(Solucion, id_solucion)
    if not solucion:
        raise HTTPException(status_code=404, detail="Solución no encontrada")

    if isinstance(solucion.contenido, str):
        try:
            solucion.contenido = json.loads(solucion.contenido)
        except json.JSONDecodeError:
            solucion.contenido = []
    
    return solucion

def like_solucion(session: Session, id_solucion: int, usuario_id: int):
    solucion = session.get(Solucion, id_solucion)
    if not solucion:
        return None

    reaccion = session.exec(
        select(Reaccion).where(
            Reaccion.id_usuario == usuario_id,
            Reaccion.id_solucion == id_solucion
        )
    ).first()

    if reaccion is None:
        # Primera vez que reacciona → guardar like
        reaccion = Reaccion(id_usuario=usuario_id, id_solucion=id_solucion, tipo=1)
        session.add(reaccion)
    elif reaccion.tipo == 1:
        # Ya había dado like → quitarlo (toggle)
        session.delete(reaccion)
    else:
        # Tenía dislike → cambiarlo a like
        reaccion.tipo = 1

    session.commit()

    # Recontar likes y dislikes
    likes = session.exec(
        select(func.count()).select_from(Reaccion).where(
            Reaccion.id_solucion == id_solucion, Reaccion.tipo == 1
        )
    ).one()
    dislikes = session.exec(
        select(func.count()).select_from(Reaccion).where(
            Reaccion.id_solucion == id_solucion, Reaccion.tipo == -1
        )
    ).one()

    return {"likes": likes, "dislikes": dislikes}


def dislike_solucion(session: Session, id_solucion: int, usuario_id: int):
    solucion = session.get(Solucion, id_solucion)
    if not solucion:
        return None

    reaccion = session.exec(
        select(Reaccion).where(
            Reaccion.id_usuario == usuario_id,
            Reaccion.id_solucion == id_solucion
        )
    ).first()

    if reaccion is None:
        reaccion = Reaccion(id_usuario=usuario_id, id_solucion=id_solucion, tipo=-1)
        session.add(reaccion)
    elif reaccion.tipo == -1:
        session.delete(reaccion)
    else:
        reaccion.tipo = -1  

    session.commit()

    likes = session.exec(
        select(func.count()).select_from(Reaccion).where(
            Reaccion.id_solucion == id_solucion, Reaccion.tipo == 1
        )
    ).one()
    dislikes = session.exec(
        select(func.count()).select_from(Reaccion).where(
            Reaccion.id_solucion == id_solucion, Reaccion.tipo == -1
        )
    ).one()

    return {"likes": likes, "dislikes": dislikes}

with open("./static/Carreras.json", encoding="utf-8") as f:
    DATA = json.load(f)

def obtener_carreras():
    return DATA["carreras"]

def obtener_materias_por_carrera(carrera_id: int):
    materias_dict = DATA["materias_por_carrera"]
    return materias_dict.get(str(carrera_id), [])