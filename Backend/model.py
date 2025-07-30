from sqlmodel import SQLModel, Field, Relationship,Column, UniqueConstraint
from typing import Optional, List, Union, Literal
from datetime import datetime
from enum import Enum
from sqlalchemy import Enum as SqlEnum, Column, JSON
from pydantic import BaseModel,validator
import json
from schema import TipoEnum,DificultadEnum
class Usuario(SQLModel, table=True):
    id_usuario: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    correo: str
    contraseña: str
    aportaciones: int = 0
    publicaciones: int = 0
    foto: Optional[str] = None

    problemas: List["Problema"] = Relationship(back_populates="usuario")
    soluciones: List["Solucion"] = Relationship(back_populates="usuario")


class Problema(SQLModel, table=True):
    id_problema: Optional[int] = Field(default=None, primary_key=True)
    id_usuario: int = Field(foreign_key="usuario.id_usuario")
    titulo: str
    enunciado: List[dict] = Field(sa_column=Column(JSON))  
    materia: str
    tipo: TipoEnum = Field(sa_column=Column(SqlEnum(TipoEnum, name="tipo_enum")))  # ✅ Arreglado
    propietario: str
    dificultad: Optional[DificultadEnum] = Field(
        default=None,
        sa_column=Column(SqlEnum(DificultadEnum, name="dificultad_enum"))  # ✅ Arreglado
    )
    carrera: str
    usuario: Optional[Usuario] = Relationship(back_populates="problemas")
    soluciones: List["Solucion"] = Relationship(back_populates="problema")

class Solucion(SQLModel, table=True):
    id_solucion: Optional[int] = Field(default=None, primary_key=True)
    id_problema: int = Field(foreign_key="problema.id_problema")
    id_usuario: int = Field(foreign_key="usuario.id_usuario")
    contenido: List[dict] = Field(sa_column=Column(JSON)) 
    fecha: datetime = Field(default_factory=datetime.utcnow)

    usuario: Optional[Usuario] = Relationship(back_populates="soluciones")
    problema: Optional[Problema] = Relationship(back_populates="soluciones")
    reacciones: list["Reaccion"] = Relationship(back_populates="solucion")

    
class Reaccion(SQLModel, table=True):
    id_reaccion: Optional[int] = Field(default=None, primary_key=True)
    id_usuario: int = Field(foreign_key="usuario.id_usuario", nullable=False)
    id_solucion: int = Field(foreign_key="solucion.id_solucion", nullable=False)
    tipo: int = Field(nullable=False)  # 1 = like, -1 = dislike

    __table_args__ = (
        UniqueConstraint("id_usuario", "id_solucion", name="unique_user_solution"),
    )
    usuario: Optional[Usuario] = Relationship()
    solucion: Optional[Solucion] = Relationship(back_populates="reacciones")