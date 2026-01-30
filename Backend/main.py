from fastapi import FastAPI, Depends, HTTPException, status,UploadFile, File,Form, Body
from fastapi.security import OAuth2PasswordBearer,OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import Query
from jose import JWTError, jwt
import json
from typing import List,Optional
from sqlmodel import Session
from database import create_db_and_tables, get_session
from datetime import datetime, timedelta
from crud import (
    autenticar_usuario, crear_token_de_acceso,
    create_usuario,edit_usuario, get_usuario,
    create_problema, list_problemas, get_problema,edit_problema,get_problema_by_user,
    create_solucion, list_soluciones_por_problema, edit_solucion,list_soluciones_por_usuario,
    get_solucion_por_id, like_solucion, dislike_solucion,
    obtener_carreras,obtener_materias_por_carrera
)
from schema import (
    Token,
    UsuarioCreate,UsuarioUpdate, UsuarioRead,LoginSchema,
    ProblemaCreate, ProblemaRead,ProblemaReadList,ProblemaReadListResponse, ProblemaUpdate,
    SolucionCreate, SolucionRead,SolucionUpdate,SolucionListResponse
)
import os
from config import settings

security = HTTPBearer()
app = FastAPI()
origins = settings.CORS_ORIGINS.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/problema_imagenes", StaticFiles(directory=settings.IMAGE_UPLOAD_DIR), name="problema_imagenes")
app.mount("/fotos_usuarios", StaticFiles(directory=settings.USER_PHOTOS_DIR), name="fotos_usuarios")

@app.get("/")
def read_root():
    return {"message": "Hola mundo"}

@app.post("/register", response_model=UsuarioRead)
def register(usuario: UsuarioCreate, session: Session = Depends(get_session)):
    return create_usuario(session, usuario)

@app.put("/usuarios/{user_id}")
async def update_usuario(
    user_id: int,
    usuario_data :UsuarioUpdate = Depends(), 
    foto: UploadFile | None = File(None),
    session: Session = Depends(get_session)
):
    try:
        usuario_actualizado = edit_usuario(session, user_id, usuario_data, foto)
        return usuario_actualizado
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


@app.get("/usuarios/me", response_model=UsuarioRead)
def get_me(credentials: HTTPAuthorizationCredentials = Depends(security), session: Session = Depends(get_session)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        usuario_id: int = int(payload.get("sub"))
        if not usuario_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido: no contiene ID de usuario",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    usuario = get_usuario(session, usuario_id)
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

@app.post("/login", response_model=Token)
def login(
    login_data: LoginSchema = Body(...),
    session: Session = Depends(get_session)
):
    usuario = autenticar_usuario(session, login_data.email, login_data.password)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
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
    session: Session = Depends(get_session)
):
    nuevo_problema = create_problema(
        session=session,
        problema_data=problema_data,
        imagenes=imagenes
    )

    return nuevo_problema
@app.put("/problemas/{problem_id}")
async def update_problema_endpoint(
    problem_id: int,
    problema_data: ProblemaUpdate = Depends(),
    imagenes: List[UploadFile] = File([]),
    session: Session = Depends(get_session)
):
    try:
        problema_actualizado = edit_problema(session, problem_id,problema_data,imagenes)
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
def get_problema_endpoint(id: int, session: Session = Depends(get_session)):
    problema = get_problema(session, id)
    if not problema:
        raise HTTPException(status_code=404, detail="Problema no encontrado")
    return problema

@app.get("/problemas/usuario/{id_user}", response_model=ProblemaReadListResponse)
def get_problemas_by_user_endpoint(
    id_user: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    session: Session = Depends(get_session)
):
    result = get_problema_by_user(session, id_user, skip=skip, limit=limit)
    if not result["items"]:
        raise HTTPException(status_code=404, detail="Usuario no encontrado o sin problemas")
    return result

@app.post("/soluciones/")
def create_solucion_endpoint(
    solucion: SolucionCreate = Depends(),
    imagenes: List[UploadFile] = File([]),
    session: Session = Depends(get_session)
):
    return create_solucion(session, solucion, imagenes)

@app.put("/soluciones/{solucion_id}")
def update_solucion_endpoint(
    solucion_id : int ,
    solucion_data : SolucionUpdate = Depends(),
    imagenes: Optional[List[UploadFile]] = File(default=None),
    session : Session = Depends(get_session)
    ):
    return edit_solucion(session,solucion_id,solucion_data,imagenes)

@app.get("/soluciones/problema/{id_problema}", response_model=SolucionListResponse)
def list_soluciones_por_problema_endpoint(
    id_problema: int,
    skip: int = Query(0),
    limit: int = Query(10),
    session: Session = Depends(get_session)
):
    return list_soluciones_por_problema(session, id_problema, skip=skip, limit=limit)

@app.get("/soluciones/usuario/{id_user}")
def list_soluciones_endpoint(
    id_user: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    session: Session = Depends(get_session)
):
    return list_soluciones_por_usuario(session, id_user, skip=skip, limit=limit)


@app.get("/solucion/{id_solucion}")
def get_solucion_endpoint(id_solucion : int , session : Session = Depends(get_session)):
    return get_solucion_por_id(session,id_solucion)

@app.post("/soluciones/{id}/like")
def like_solucion_endpoint(
    id: int,
    usuario_id: int, 
    session: Session = Depends(get_session)
):
    result = like_solucion(session, id, usuario_id)
    if not result:
        raise HTTPException(status_code=404, detail="Solución no encontrada")
    return result

@app.post("/soluciones/{id}/dislike")
def dislike_solucion_endpoint(
    id: int,
    usuario_id: int,
    session: Session = Depends(get_session)
):
    result = dislike_solucion(session, id, usuario_id)
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
