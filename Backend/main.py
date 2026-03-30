from fastapi import FastAPI, Depends, HTTPException, status,UploadFile, File,Form, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import Query
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
import json
from typing import List,Optional
from sqlmodel import Session
from database import create_db_and_tables, get_session
from datetime import datetime, timedelta
from model import Problema, Solucion
from crud import (
    crear_token_de_acceso,
    edit_usuario, get_usuario,
    assign_rol, revoke_rol, get_usuario_rol, is_admin,
    get_problems_pendients, get_problem_pendient_by_id, approve_problem_by_id,
    delete_problem_by_id, delete_solution_by_id,
    get_or_create_google_usuario,
    create_problema, list_problemas, get_problema,edit_problema,
    get_problems_approved_by_user, get_problems_pendients_by_user,
    create_solucion, list_soluciones_por_problema, edit_solucion,list_soluciones_por_usuario,
    get_solucion_por_id, like_solucion, dislike_solucion,
    obtener_carreras,obtener_materias_por_carrera
)
from schema import (
    Token,
    UsuarioUpdate, UsuarioRead,GoogleLoginSchema,
    ProblemaCreate, ProblemaRead,ProblemaReadList,ProblemaReadListResponse, ProblemaUpdate,
    SolucionCreate, SolucionRead,SolucionUpdate,SolucionListResponse,
    AsignarRolRequest, RevokeRolRequest, UserRolListResponse
)
from utils_security import verificar_token
import os
from config import settings

security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)
app = FastAPI()
origins = settings.CORS_ORIGINS.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hola mundo"}

@app.put("/usuarios/{user_id}")
async def update_usuario(
    user_id: int,
    usuario_data :UsuarioUpdate = Depends(), 
    foto: UploadFile | None = File(None),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
):
    try:
        actor_id = verificar_token(credentials.credentials, session)
        usuario_actualizado = edit_usuario(session, user_id, actor_id, usuario_data, foto)
        return usuario_actualizado
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/usuarios/me", response_model=UsuarioRead)
def get_me(credentials: HTTPAuthorizationCredentials = Depends(security), session: Session = Depends(get_session)):
    return get_usuario(session, token=credentials.credentials)


@app.post("/roles/asignar")
def asignar_rol_endpoint(
    data: AsignarRolRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
):
    id_admin = verificar_token(credentials.credentials, session)
    if not is_admin(session, id_admin):
        raise HTTPException(status_code=403, detail="No tienes permisos de admin")
    return assign_rol(session, data.id_usuario, data.rol)


@app.delete("/roles/revoke")
def revoke_rol_endpoint(
    data: RevokeRolRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
):
    id_admin = verificar_token(credentials.credentials, session)
    if not is_admin(session, id_admin):
        raise HTTPException(status_code=403, detail="No tienes permisos de admin")
    if id_admin == data.id_usuario:
        raise HTTPException(
            status_code=400,
            detail="No puedes revocarte a ti mismo el rol Admin"
        )
    return revoke_rol(session, data.id_usuario)


@app.get("/roles/usuarios", response_model=UserRolListResponse)
def get_usuario_rol_endpoint(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
):
    id_admin = verificar_token(credentials.credentials, session)
    if not is_admin(session, id_admin):
        raise HTTPException(status_code=403, detail="No tienes permisos de admin")
    return get_usuario_rol(session)


@app.get("/problemas/pendientes", response_model=ProblemaReadListResponse)
def get_problems_pendients_endpoint(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, gt=0, le=100),
    titulo: Optional[str] = Query(None),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
):
    id_admin = verificar_token(credentials.credentials, session)
    if not is_admin(session, id_admin):
        raise HTTPException(status_code=403, detail="No tienes permisos de admin")
    return get_problems_pendients(session, skip=skip, limit=limit, titulo=titulo)


@app.get("/problemas/pendientes/{problem_id}", response_model=ProblemaRead)
def get_problem_pendient_by_id_endpoint(
    problem_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
):
    id_admin = verificar_token(credentials.credentials, session)
    if not is_admin(session, id_admin):
        raise HTTPException(status_code=403, detail="No tienes permisos de admin")
    return get_problem_pendient_by_id(session, problem_id)


@app.patch("/problemas/{problem_id}/approve", response_model=ProblemaRead)
def approve_problem_endpoint(
    problem_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
):
    id_admin = verificar_token(credentials.credentials, session)
    if not is_admin(session, id_admin):
        raise HTTPException(status_code=403, detail="No tienes permisos de admin")
    return approve_problem_by_id(session, problem_id)


@app.delete("/problemas/{problem_id}", response_model=ProblemaRead)
def delete_problem_endpoint(
    problem_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
):
    actor_id = verificar_token(credentials.credentials, session)
    problema = session.get(Problema, problem_id)
    if problema is None:
        raise HTTPException(status_code=404, detail="Problema no encontrado")
    if not is_admin(session, actor_id) and problema.id_usuario != actor_id:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar este problema")
    return delete_problem_by_id(session, problem_id)


@app.delete("/soluciones/{solution_id}")
def delete_solution_endpoint(
    solution_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
):
    actor_id = verificar_token(credentials.credentials, session)
    solucion = session.get(Solucion, solution_id)
    if solucion is None:
        raise HTTPException(status_code=404, detail="Solución no encontrada")
    if not is_admin(session, actor_id) and solucion.id_usuario != actor_id:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar esta solución")
    return delete_solution_by_id(session, solution_id)

@app.post("/auth/google", response_model=Token)
def login_with_google(
    login_data: GoogleLoginSchema = Body(...),
    session: Session = Depends(get_session)
):
    try:
        payload = google_id_token.verify_oauth2_token(
            login_data.id_token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de Google inválido"
        )

    issuer = payload.get("iss")
    if issuer not in ("accounts.google.com", "https://accounts.google.com"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Emisor inválido"
        )

    correo = payload.get("email")
    email_verified = payload.get("email_verified", False)
    if not correo or not email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de Google no verificada"
        )

    nombre = payload.get("name") or correo.split("@")[0]
    foto = payload.get("picture")
    usuario = get_or_create_google_usuario(
        session=session,
        correo=correo,
        nombre=nombre,
        foto=foto
    )
    expires = timedelta(days=30) if login_data.remember_me else timedelta(minutes=60)
    token = crear_token_de_acceso(
        data={
            "sub": str(usuario.id_usuario),
            "nombre": usuario.nombre
        },
        expires_delta=expires
    )
    return {"access_token": token, "token_type": "bearer"}

@app.post("/problemas/")
async def crear_problema_endpoint(
    problema_data  : ProblemaCreate = Depends(),
    imagenes: List[UploadFile] = File([]), 
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
):
    actor_id = verificar_token(credentials.credentials, session)
    nuevo_problema = create_problema(
        session=session,
        id_usuario=actor_id,
        problema_data=problema_data,
        imagenes=imagenes
    )

    return nuevo_problema
@app.put("/problemas/{problem_id}")
async def update_problema_endpoint(
    problem_id: int,
    problema_data: ProblemaUpdate = Depends(),
    imagenes: List[UploadFile] = File([]),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
):
    try:
        actor_id = verificar_token(credentials.credentials, session)
        problema_actualizado = edit_problema(session, actor_id, problem_id,problema_data,imagenes)
        return problema_actualizado
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    

@app.get("/problemas/", response_model=ProblemaReadListResponse)
def list_problemas_endpoint(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, gt=0, le=100),
    titulo: Optional[str] = Query(None),
    materia: Optional[str] = Query(None),
    tipo: Optional[str] = Query(None),
    dificultad: Optional[str] = Query(None),
    carrera: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    return list_problemas(
        session=session,
        skip=skip,
        limit=limit,
        titulo=titulo,
        materia=materia,
        tipo=tipo,
        dificultad=dificultad,
        carrera=carrera
    )
@app.get("/problemas/{id}", response_model=ProblemaRead)
def get_problema_endpoint(
    id: int,
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_security),
    session: Session = Depends(get_session)
):
    actor_id = None
    actor_is_admin = False

    if credentials is not None:
        actor_id = verificar_token(credentials.credentials, session)
        actor_is_admin = is_admin(session, actor_id)

    problema = get_problema(session, id, actor_id=actor_id, actor_is_admin=actor_is_admin)
    if not problema:
        raise HTTPException(status_code=404, detail="Problema no encontrado")
    return problema

@app.get("/problemas/usuario/aprobados", response_model=ProblemaReadListResponse)
def get_approved_problems_by_user_endpoint(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
):
    id_user = verificar_token(credentials.credentials, session)
    return get_problems_approved_by_user(session, id_user, skip=skip, limit=limit)


@app.get("/problemas/usuario/pendientes", response_model=ProblemaReadListResponse)
def get_pendient_problems_by_user_endpoint(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
):
    id_user = verificar_token(credentials.credentials, session)
    return get_problems_pendients_by_user(session, id_user, skip=skip, limit=limit)

@app.post("/soluciones/")
def create_solucion_endpoint(
    solucion: SolucionCreate = Depends(),
    imagenes: List[UploadFile] = File([]),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
):
    actor_id = verificar_token(credentials.credentials, session)
    return create_solucion(session, actor_id, solucion, imagenes)

@app.put("/soluciones/{solucion_id}")
def update_solucion_endpoint(
    solucion_id : int ,
    solucion_data : SolucionUpdate = Depends(),
    imagenes: Optional[List[UploadFile]] = File(default=None),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session : Session = Depends(get_session)
    ):
    actor_id = verificar_token(credentials.credentials, session)
    return edit_solucion(session,actor_id,solucion_id,solucion_data,imagenes)

@app.get("/soluciones/problema/{id_problema}", response_model=SolucionListResponse)
def list_soluciones_por_problema_endpoint(
    id_problema: int,
    skip: int = Query(0),
    limit: int = Query(10),
    session: Session = Depends(get_session)
):
    return list_soluciones_por_problema(session, id_problema, skip=skip, limit=limit)

@app.get("/soluciones/usuario")
def list_soluciones_endpoint(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
):
    id_user = verificar_token(credentials.credentials, session)
    return list_soluciones_por_usuario(session, id_user, skip=skip, limit=limit)


@app.get("/solucion/{id_solucion}")
def get_solucion_endpoint(id_solucion : int , session : Session = Depends(get_session)):
    return get_solucion_por_id(session,id_solucion)

@app.post("/soluciones/{id}/like")
def like_solucion_endpoint(
    id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
):
    actor_id = verificar_token(credentials.credentials, session)
    result = like_solucion(session, id, actor_id)
    if not result:
        raise HTTPException(status_code=404, detail="Solución no encontrada")
    return result

@app.post("/soluciones/{id}/dislike")
def dislike_solucion_endpoint(
    id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
):
    actor_id = verificar_token(credentials.credentials, session)
    result = dislike_solucion(session, id, actor_id)
    if not result:
        raise HTTPException(status_code=404, detail="Solución no encontrada")
    return result
@app.get("/carreras")
def get_carreras():
    return {"carreras": obtener_carreras()}

@app.get("/materias/{carrera_id}")
def get_materias(carrera_id: int):
    materias = obtener_materias_por_carrera(carrera_id)
    if materias is None:
        raise HTTPException(status_code=404, detail="Carrera no encontrada")
    return {"materias": materias}
