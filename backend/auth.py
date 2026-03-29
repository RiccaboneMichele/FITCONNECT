# FitConnect - Authentication & Authorization
# JWT Token + Password Hashing + Permissions

from datetime import datetime, timedelta, timezone
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from models import User, Group, Permission
import os
from dotenv import load_dotenv

load_dotenv()

# Configurazione sicurezza
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-VERY-IMPORTANT")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 ore

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme per JWT
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def _role_value(role) -> str:
    """Normalizza il ruolo a stringa (compatibile con enum SQLAlchemy)."""
    return role.value if hasattr(role, "value") else str(role)

# ============================================================================
# PASSWORD HASHING
# ============================================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se la password corrisponde all'hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Crea hash della password"""
    return pwd_context.hash(password)

# ============================================================================
# JWT TOKEN
# ============================================================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Crea un JWT token.
    
    Args:
        data: Dati da includere nel token (es. user_id, email, role)
        expires_delta: Durata del token (default: 24 ore)
    
    Returns:
        Token JWT codificato
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    """
    Decodifica un JWT token.
    
    Args:
        token: Token JWT
    
    Returns:
        Payload del token
    
    Raises:
        JWTError: Se il token non è valido
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token non valido o scaduto",
            headers={"WWW-Authenticate": "Bearer"},
        )

# ============================================================================
# AUTENTICAZIONE UTENTE
# ============================================================================

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Autentica un utente con email e password.
    
    Args:
        db: Sessione database
        email: Email utente
        password: Password in chiaro
    
    Returns:
        User se autenticazione riuscita, None altrimenti
    """
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        return None
    
    if not verify_password(password, user.password_hash):
        return None
    
    if not user.is_active:
        return None
    
    return user

# ============================================================================
# DEPENDENCY: UTENTE CORRENTE
# ============================================================================

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency che restituisce l'utente corrente dal JWT token.
    
    Raises:
        HTTPException: Se token non valido o utente non trovato
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenziali non valide",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = decode_access_token(token)
        user_id: int = payload.get("user_id")
        
        if user_id is None:
            raise credentials_exception
    
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Utente disabilitato"
        )
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency che verifica che l'utente sia attivo.
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Utente non attivo"
        )
    return current_user

# ============================================================================
# AUTHORIZATION: ROLE-BASED ACCESS CONTROL
# ============================================================================

def require_role(allowed_roles: List[str]):
    """
    Dependency factory per verificare il ruolo dell'utente.
    
    Usage:
        @app.get("/admin/dashboard", dependencies=[Depends(require_role(["admin"]))])
    """
    async def role_checker(current_user: User = Depends(get_current_user)):
        if _role_value(current_user.role) not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Accesso negato. Ruoli richiesti: {', '.join(allowed_roles)}"
            )
        return current_user
    
    return role_checker

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency che verifica che l'utente sia un admin.
    """
    if not current_user.is_admin and _role_value(current_user.role) != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accesso negato. Richiesti permessi di amministratore."
        )
    return current_user

def require_permission(permission_name: str):
    """
    Dependency factory per verificare che l'utente abbia un permesso specifico.
    
    Usage:
        @app.get("/api/reports", dependencies=[Depends(require_permission("view_reports"))])
    """
    async def permission_checker(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        # Admin hanno tutti i permessi
        if current_user.is_admin:
            return current_user
        
        # Verifica permessi tramite gruppi
        user_permissions = set()
        for group in current_user.groups:
            for perm in group.permissions:
                user_permissions.add(perm.name)
        
        if permission_name not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Accesso negato. Richiesto permesso: {permission_name}"
            )
        
        return current_user
    
    return permission_checker

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def user_has_permission(user: User, permission_name: str) -> bool:
    """
    Verifica se un utente ha un permesso specifico.
    
    Args:
        user: Oggetto User
        permission_name: Nome del permesso
    
    Returns:
        True se l'utente ha il permesso, False altrimenti
    """
    if user.is_admin:
        return True
    
    for group in user.groups:
        for perm in group.permissions:
            if perm.name == permission_name:
                return True
    
    return False

def get_user_permissions(user: User) -> List[str]:
    """
    Restituisce la lista di tutti i permessi di un utente.
    
    Args:
        user: Oggetto User
    
    Returns:
        Lista di nomi permessi
    """
    if user.is_admin:
        # Admin hanno tutti i permessi
        return ["*"]  # Wildcard per tutti i permessi
    
    permissions = set()
    for group in user.groups:
        for perm in group.permissions:
            permissions.add(perm.name)
    
    return list(permissions)

def get_user_groups(user: User) -> List[str]:
    """
    Restituisce la lista dei gruppi di un utente.
    
    Args:
        user: Oggetto User
    
    Returns:
        Lista di nomi gruppi
    """
    return [group.name for group in user.groups]
