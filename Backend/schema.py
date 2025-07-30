from pydantic import BaseModel, parse_obj_as
from typing import Optional,Literal, Union,List
from datetime import datetime
from enum import Enum
from fastapi import UploadFile,HTTPException,Form
import json

class BloqueTexto(BaseModel):
    tipo: Literal["texto"]
    contenido: str

class BloqueImagen(BaseModel):
    tipo: Literal["imagen"]
    url: str

class BloqueCodigo(BaseModel):
    tipo: Literal["codigo"]
    lenguaje: str
    contenido: str

class BloqueEcuacion(BaseModel):
    tipo: Literal["ecuacion"]
    contenido: str

class BloqueLista(BaseModel):
    tipo: Literal["lista"]
    estilo: Literal["ordenada", "viñetas"]
    items: List[str]

class BloqueTabla(BaseModel):
    tipo: Literal["tabla"]
    encabezados: List[str]
    filas: List[List[str]]

Bloque = Union[
    BloqueTexto,
    BloqueImagen,
    BloqueCodigo,
    BloqueEcuacion,
    BloqueLista,
    BloqueTabla
]

class TipoEnum(str, Enum):
    Examen = "Examen"
    Auxiliatura = "Auxiliatura"
    Practica = "Practica"
    Propio = "Propio"

class DificultadEnum(str, Enum):
    Facil = "Facil"
    Media = "Media"
    Dificil = "Dificil"

class LoginSchema(BaseModel):
    email: str
    password: str
    remember_me: bool = False

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UsuarioCreate(BaseModel):
    name: str
    email: str
    password: str
    
class UsuarioRead(BaseModel):
    id_usuario: int
    nombre: str
    correo: str
    foto: Optional[str]
    aportaciones: int
    publicaciones: int
    class Config:
        from_attributes = True

class UsuarioUpdate:
    def __init__(
        self,
        email: Optional[str] = Form(None),
        new_password: Optional[str] = Form(None),
        password: str = Form(...), 
        photo: str = Form(None)
    ):
        self.email = email
        self.new_password = new_password
        self.password = password
        self.photo = photo


class ProblemaCreate:
    def __init__(
        self,
        titulo: str = Form(...),
        materia:str = Form(...),
        tipo: TipoEnum= Form(...),
        propietario: str = Form(None),
        dificultad: DificultadEnum= Form(...),
        carrera: str= Form(...),
        id_usuario: str = Form(...),
        enunciado: str = Form(...),
    ):
        self.titulo = titulo
        self.materia = materia
        self.tipo = tipo
        self.propietario = propietario
        self.dificultad = dificultad
        self.carrera = carrera
        self.id_usuario = int(id_usuario) if id_usuario and id_usuario.strip() != "" else None
        self.enunciado = None

        if enunciado:
            try:
                self.enunciado = json.loads(enunciado)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="El enunciado no es un JSON válido")


class ProblemaUpdate:
    def __init__(
        self,
        titulo: Optional[str] = Form(None),
        materia: Optional[str] = Form(None),
        tipo: Optional[TipoEnum] = Form(None),
        propietario: Optional[str] = Form(None),
        dificultad: Optional[DificultadEnum] = Form(None),
        carrera: Optional[str] = Form(None),
        id_usuario: Optional[str] = Form(None),
        enunciado: Optional[str] = Form(None),
    ):
        self.titulo = titulo
        self.materia = materia
        self.tipo = tipo
        self.propietario = propietario
        self.dificultad = dificultad
        self.carrera = carrera
        self.id_usuario = int(id_usuario) if id_usuario and id_usuario.strip() != "" else None
        self.enunciado = None

        if enunciado:
            try:
                self.enunciado = json.loads(enunciado)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="El enunciado no es un JSON válido")


class ProblemaReadList(BaseModel):
    id_problema: int
    titulo: str
    materia: str
    tipo: TipoEnum
    propietario: str
    dificultad: Optional[DificultadEnum] = None
    carrera: str
    id_usuario: int
    class Config:
        from_attributes = True

class ProblemaReadListResponse(BaseModel):
    total: int
    items: List[ProblemaReadList]

class ProblemaRead(ProblemaReadList):
    enunciado: List[Bloque]

class SolucionCreate():
    def __init__(
        self,
        id_problema :int = Form(...),
        id_usuario : int = Form(...),
        contenido : str = Form(...)
    ):
        self.id_problema = id_problema
        self.id_usuario = id_usuario
        try:
            bloques_raw = json.loads(contenido)
            bloques_validados = parse_obj_as(List[Bloque], bloques_raw)
            self.contenido = bloques_raw
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="El contenido no es un JSON válido")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Formato inválido de contenido: {e}")

class SolucionUpdate():
    def __init__(
        self,
        contenido : str = Form(None)
    ):
        self.contenido = contenido
        try:
            self.contenido = json.loads(contenido)
        except json.JSONDecodeError:
           raise HTTPException(status_code=400, detail="El contenido no es un JSON válido")


class SolucionRead(BaseModel):
    id_solucion: int
    id_usuario: int
    nombre: str #nombre de usuario o titulo de problema 
    contenido: List[dict]
    likes: int
    dislikes: int
    fecha: datetime

class SolucionListResponse(BaseModel):
    items: List[SolucionRead]
    total: int
        