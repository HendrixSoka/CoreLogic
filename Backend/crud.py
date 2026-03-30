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
from sqlalchemy.exc import IntegrityError
from model import Usuario, Problema, Solucion, Reaccion, Rol
from schema import (
    UsuarioCreate,UsuarioUpdate, UsuarioRead,
    UserRolRead,
    EstadoProblemaEnum, EstadoSolucionEnum,
    ProblemaCreate, ProblemaRead,ProblemaUpdate,
    SolucionCreate, SolucionRead,SolucionUpdate
)
from config import settings
from datetime import datetime, timedelta
from jose import jwt
import os
from utils import _save_single_upload_file,_validate_image_and_get_extension,_update_enunciado,_process_image_blocks
from utils_security import verificar_token
from pathlib import Path
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _normalize_email(email: str) -> str:
    return email.strip().lower()


# Usuario
def crear_token_de_acceso(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

async def create_usuario(session: Session, usuario_data: UsuarioCreate):
    email = _normalize_email(usuario_data.email)
    existing = session.exec(
        select(Usuario).where(Usuario.correo == email)
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="El correo ya está registrado"
        )
    hashed_password = pwd_context.hash(usuario_data.password)

    user = Usuario(
        nombre=usuario_data.name,
        correo=email,
        contraseña=hashed_password,
        verificado=True,
        aportaciones=0,
        publicaciones=0,
        foto=None 
    )
    

    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def get_usuario(session: Session, id_usuario: int | None = None, token: str | None = None):
    if token is not None:
        id_usuario = verificar_token(token, session)
    if id_usuario is None:
        raise HTTPException(status_code=400, detail="Se requiere id_usuario o token")
    return session.get(Usuario, id_usuario)



def edit_usuario(
    session: Session,
    user_id: int,
    actor_id: int,
    usuario_data: UsuarioUpdate,
    foto: UploadFile | None = None
):
    if actor_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para modificar este usuario"
        )

    user = session.query(Usuario).filter(Usuario.id_usuario == user_id).first()
    if not user:
        raise ValueError("Usuario no encontrado")

    if usuario_data.nombre is not None and usuario_data.nombre.strip():
        user.nombre = usuario_data.nombre.strip()

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
    normalized_email = _normalize_email(email)
    usuario = session.query(Usuario).filter(Usuario.correo == normalized_email).first()
    if not usuario:
        return None
    if not verificar_contraseña(contraseña, usuario.contraseña):
        return None
    return usuario

def get_or_create_google_usuario(
    session: Session,
    correo: str,
    nombre: str,
    foto: Optional[str] = None
):
    correo_normalizado = _normalize_email(correo)
    usuario = session.exec(
        select(Usuario).where(Usuario.correo == correo_normalizado)
    ).first()
    if usuario:
        usuario.verificado = True
        if foto:
            usuario.foto = foto
        session.add(usuario)
        session.commit()
        session.refresh(usuario)
        return usuario

    random_password = uuid4().hex
    hashed_password = pwd_context.hash(random_password)
    nuevo_usuario = Usuario(
        nombre=nombre,
        correo=correo_normalizado,
        contraseña=hashed_password,
        verificado=True,
        aportaciones=0,
        publicaciones=0,
        foto=foto
    )
    session.add(nuevo_usuario)
    try:
        session.commit()
        session.refresh(nuevo_usuario)
        return nuevo_usuario
    except IntegrityError:
        session.rollback()
        usuario_existente = session.exec(
            select(Usuario).where(Usuario.correo == correo_normalizado)
        ).first()
        if usuario_existente:
            usuario_existente.verificado = True
            if foto:
                usuario_existente.foto = foto
            session.add(usuario_existente)
            session.commit()
            session.refresh(usuario_existente)
            return usuario_existente
        raise

def _require_verified_user_by_id(user_id: int, session: Session):
    usuario = get_usuario(session, user_id)
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


def is_admin(session: Session, id_usuario: int) -> bool:
    rol = session.exec(
        select(Rol).where(Rol.id_usuario == id_usuario, Rol.rol == "Admin")
    ).first()
    return rol is not None


def get_usuario_rol(session: Session):
    usuarios = session.exec(
        select(Usuario).order_by(Usuario.nombre.asc())
    ).all()

    admin_ids = set(
        session.exec(
            select(Rol.id_usuario).where(Rol.rol == "Admin")
        ).all()
    )

    items = [
        UserRolRead(
            id_usuario=usuario.id_usuario,
            nombre=usuario.nombre,
            correo=usuario.correo,
            foto=usuario.foto,
            is_admin=usuario.id_usuario in admin_ids
        )
        for usuario in usuarios
    ]

    return {"total": len(items), "items": items}


def assign_rol(
    session: Session,
    id_usuario: int,
    rol: str = "Admin"
):
    if rol != "Admin":
        raise HTTPException(
            status_code=400,
            detail="Por ahora solo se puede asignar el rol Admin"
        )

    usuario_objetivo = get_usuario(session, id_usuario)
    if usuario_objetivo is None:
        raise HTTPException(status_code=404, detail="El usuario objetivo no existe")

    existing_role = session.exec(
        select(Rol).where(Rol.id_usuario == id_usuario, Rol.rol == "Admin")
    ).first()
    if existing_role is not None:
        return {
            "message": "El usuario ya tiene rol Admin",
            "id_usuario": id_usuario,
            "rol": existing_role.rol
        }

    nuevo_rol = Rol(id_usuario=id_usuario, rol=rol)
    session.add(nuevo_rol)
    session.commit()
    session.refresh(nuevo_rol)

    return {
        "message": "Rol asignado correctamente",
        "id_usuario": id_usuario,
        "rol": nuevo_rol.rol,
        "id_rol": nuevo_rol.id_rol
    }


def revoke_rol(
    session: Session,
    id_usuario: int
):
    rol_objetivo = session.exec(
        select(Rol).where(Rol.id_usuario == id_usuario, Rol.rol == "Admin")
    ).first()
    if rol_objetivo is None:
        return {
            "message": "El usuario no tiene rol Admin",
            "id_usuario": id_usuario
        }

    session.delete(rol_objetivo)
    session.commit()

    return {
        "message": "Rol Admin revocado correctamente",
        "id_usuario": id_usuario
    }

# Problema

def create_problema(
    session: Session,
    id_usuario: int,
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
        id_usuario=id_usuario,
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
    query = select(Problema).where(Problema.estado == EstadoProblemaEnum.Aprobado)

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

    count_query = select(func.count()).select_from(query.subquery())
    total = session.execute(count_query).scalar()

    paginated_query = query.offset(skip).limit(limit)
    resultados = session.execute(paginated_query).scalars().all()

    return {
        "items": resultados,
        "total": total
    }

def get_problems_approved_by_user(session: Session, id_user: int, skip: int = 0, limit: int = 10):
    total = session.exec(
        select(func.count()).select_from(Problema).where(
            Problema.id_usuario == id_user,
            Problema.estado == EstadoProblemaEnum.Aprobado
        )
    ).one()

    items = session.exec(
        select(Problema).where(
            Problema.id_usuario == id_user,
            Problema.estado == EstadoProblemaEnum.Aprobado
        ).offset(skip).limit(limit)
    ).all()

    return {"items": items, "total": total}


def get_problems_pendients_by_user(session: Session, id_user: int, skip: int = 0, limit: int = 10):
    total = session.exec(
        select(func.count()).select_from(Problema).where(
            Problema.id_usuario == id_user,
            Problema.estado == EstadoProblemaEnum.Pendiente
        )
    ).one()

    items = session.exec(
        select(Problema).where(
            Problema.id_usuario == id_user,
            Problema.estado == EstadoProblemaEnum.Pendiente
        ).offset(skip).limit(limit)
    ).all()

    return {"items": items, "total": total}

def get_problema(
    session: Session,
    id_problema: int,
    actor_id: int | None = None,
    actor_is_admin: bool = False
):
    problema = session.get(Problema, id_problema)
    if problema is None:
        return None

    if problema.estado == EstadoProblemaEnum.Aprobado:
        return problema

    if actor_is_admin:
        return problema

    if actor_id is not None and problema.id_usuario == actor_id:
        return problema

    return None


def get_problems_pendients(
    session: Session,
    skip: int = 0,
    limit: int = 20,
    titulo: str | None = None
):
    query = select(Problema).where(Problema.estado == EstadoProblemaEnum.Pendiente)
    total_query = select(func.count()).select_from(Problema).where(
        Problema.estado == EstadoProblemaEnum.Pendiente
    )

    if titulo:
        query = query.where(Problema.titulo.ilike(f"%{titulo}%"))
        total_query = total_query.where(Problema.titulo.ilike(f"%{titulo}%"))

    total = session.exec(total_query).one()
    items = session.exec(
        query.offset(skip).limit(limit)
    ).all()
    return {"items": items, "total": total}


def get_problem_pendient_by_id(session: Session, problem_id: int):
    problema = get_problema(session, problem_id, actor_is_admin=True)
    if problema is None:
        raise HTTPException(status_code=404, detail="Problema no encontrado")
    if problema.estado != EstadoProblemaEnum.Pendiente:
        raise HTTPException(status_code=404, detail="Problema pendiente no encontrado")
    return problema


def approve_problem_by_id(session: Session, problem_id: int):
    problema = session.get(Problema, problem_id)
    if not problema:
        raise HTTPException(status_code=404, detail="Problema no encontrado")

    was_approved = problema.estado == EstadoProblemaEnum.Aprobado
    problema.estado = EstadoProblemaEnum.Aprobado
    session.add(problema)

    if not was_approved:
        usuario = session.get(Usuario, problema.id_usuario)
        if usuario is not None:
            usuario.publicaciones += 1
            session.add(usuario)

    session.commit()
    session.refresh(problema)
    return problema


def delete_problem_by_id(session: Session, problem_id: int):
    problema = session.get(Problema, problem_id)
    if not problema:
        raise HTTPException(status_code=404, detail="Problema no encontrado")

    problema.estado = EstadoProblemaEnum.Eliminado
    session.add(problema)
    session.commit()
    session.refresh(problema)
    return problema


def edit_problema(
    session: Session,
    actor_id: int,
    problem_id: int,
    problema_data: ProblemaUpdate,
    imagenes: List[UploadFile]
):
    problema = session.query(Problema).filter(Problema.id_problema == problem_id).first()

    if not problema:
        raise HTTPException(status_code=404, detail="Problema no encontrado")
    if problema.id_usuario != actor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para modificar este problema"
        )

    enunciado_anterior = problema.enunciado
    enunciado_nuevo = problema_data.enunciado

    expected_image_blocks = sum(
        1
        for bloque in enunciado_nuevo
        if bloque.get("tipo") == "imagen" and not (bloque.get("url") or "").strip()
    )
    if len(imagenes) < expected_image_blocks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Faltan imágenes. El enunciado requiere {expected_image_blocks} imágenes nuevas o reemplazadas, pero solo se recibieron {len(imagenes)}."
        )
    enunciado_actualizado = _update_enunciado(enunciado_anterior, enunciado_nuevo, imagenes)
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
def create_solucion(session: Session, actor_id: int, solucion_data: SolucionCreate, imagenes : list[UploadFile]):
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
        id_usuario=actor_id,
        contenido=contenido,
        likes=0,
        dislikes=0,
    )
    session.add(solucion)

    usuario = session.get(Usuario, actor_id)
    if usuario is not None:
        usuario.aportaciones += 1
        session.add(usuario)

    session.commit()
    session.refresh(solucion)
    return solucion

def edit_solucion(
    session : Session,
    actor_id: int,
    solucion_id: int ,
    solucion_data: SolucionUpdate,
    imagenes: list[UploadFile]
    ):
    imagenes = imagenes or []
    solucion = session.query(Solucion).filter(Solucion.id_solucion == solucion_id).first()

    if not solucion:
        raise HTTPException(status_code=404, detail="Solucion no encontrado")
    if solucion.id_usuario != actor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para modificar esta solucion"
        )

     
    enunciado_anterior = solucion.contenido
    enunciado_nuevo = solucion_data.contenido
    expected_image_blocks = sum(
        1
        for bloque in enunciado_nuevo
        if bloque.get("tipo") == "imagen" and not (bloque.get("url") or "").strip()
    )
    if len(imagenes) < expected_image_blocks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Faltan imágenes. La solucion requiere {expected_image_blocks} imágenes nuevas o reemplazadas, pero solo se recibieron {len(imagenes)}."
        )
    
    solucion_actualizado = _update_enunciado(enunciado_anterior, enunciado_nuevo, imagenes)
    if solucion_actualizado:
        solucion.contenido = solucion_actualizado
    session.commit()
    session.refresh(solucion)

    return solucion


def list_soluciones_por_problema(session: Session, id_problema: int, skip: int = 0, limit: int = 10):
    total = session.exec(
        select(func.count()).select_from(Solucion).where(
            Solucion.id_problema == id_problema,
            Solucion.estado == EstadoSolucionEnum.Visible
        )
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
        .where(
            Solucion.id_problema == id_problema,
            Solucion.estado == EstadoSolucionEnum.Visible
        )
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
            fecha=solucion.fecha,
            estado=solucion.estado
        ))

    return {
        "items": soluciones_response,
        "total": total,
    }

def list_soluciones_por_usuario(session: Session, id_user: int, skip: int = 0, limit: int = 10):
    total = session.exec(
        select(func.count()).select_from(Solucion).where(
            Solucion.id_usuario == id_user,
            Solucion.estado.in_([
                EstadoSolucionEnum.Visible,
                EstadoSolucionEnum.Reportado
            ])
        )
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
        .where(
            Solucion.id_usuario == id_user,
            Solucion.estado.in_([
                EstadoSolucionEnum.Visible,
                EstadoSolucionEnum.Reportado
            ])
        )
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
            fecha=solucion.fecha,
            estado=solucion.estado
        ))

    return {"items": soluciones_response, "total": total}



def get_solucion_por_id(session: Session, id_solucion: int):
    solucion = session.get(Solucion, id_solucion)
    if not solucion:
        raise HTTPException(status_code=404, detail="Solución no encontrada")
    if solucion.estado != EstadoSolucionEnum.Visible:
        raise HTTPException(status_code=404, detail="Solución no encontrada")

    if isinstance(solucion.contenido, str):
        try:
            solucion.contenido = json.loads(solucion.contenido)
        except json.JSONDecodeError:
            solucion.contenido = []
    
    return solucion


def delete_solution_by_id(session: Session, solution_id: int):
    solucion = session.get(Solucion, solution_id)
    if not solucion:
        raise HTTPException(status_code=404, detail="Solución no encontrada")

    solucion.estado = EstadoSolucionEnum.Eliminado
    session.add(solucion)
    session.commit()
    session.refresh(solucion)
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

BASE_DIR = Path(__file__).resolve().parent

with open(BASE_DIR / "static" / "Carreras.json", encoding="utf-8") as f:
    DATA = json.load(f)

def obtener_carreras():
    return DATA["carreras"]

def obtener_materias_por_carrera(carrera_id: int):
    materias_dict = DATA["materias_por_carrera"]
    return materias_dict.get(str(carrera_id), [])
