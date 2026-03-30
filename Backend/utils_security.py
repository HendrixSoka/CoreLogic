from fastapi import HTTPException, status
from jose import JWTError, jwt
from sqlmodel import Session

from config import settings
from model import Usuario


def verificar_token(token: str, session: Session) -> int:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        id_usuario = int(payload.get("sub"))
        if not id_usuario:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalido: no contiene un id_usuario valido",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except (JWTError, ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    usuario = session.get(Usuario, id_usuario)
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    return id_usuario
