from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db


class Area(db.Model):
    __tablename__ = 'areas'

    id          = db.Column(db.Integer, primary_key=True)
    nombre      = db.Column(db.String(150), nullable=False, unique=True)
    descripcion = db.Column(db.Text)
    activo      = db.Column(db.Boolean, default=True)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at  = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    usuarios = db.relationship('Usuario', backref='area', lazy='dynamic')

    def to_dict(self):
        return {
            'id':          self.id,
            'nombre':      self.nombre,
            'descripcion': self.descripcion,
            'activo':      self.activo
        }


class Rol(db.Model):
    __tablename__ = 'roles'

    id          = db.Column(db.Integer, primary_key=True)
    nombre      = db.Column(db.String(50), nullable=False, unique=True)
    descripcion = db.Column(db.String(200))

    usuarios = db.relationship('Usuario', backref='rol', lazy='dynamic')

    def to_dict(self):
        return {
            'id':          self.id,
            'nombre':      self.nombre,
            'descripcion': self.descripcion
        }


class Usuario(db.Model):
    __tablename__ = 'usuarios'

    id            = db.Column(db.Integer, primary_key=True)
    nombre        = db.Column(db.String(100), nullable=False)
    apellidos     = db.Column(db.String(100), nullable=False)
    email         = db.Column(db.String(150), nullable=False, unique=True)
    password_hash = db.Column(db.String(256), nullable=False)
    rol_id        = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    area_id       = db.Column(db.Integer, db.ForeignKey('areas.id'))
    activo        = db.Column(db.Boolean, default=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at    = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def nombre_completo(self):
        return f"{self.nombre} {self.apellidos}"

    def to_dict(self):
        return {
            'id':       self.id,
            'nombre':   self.nombre_completo,
            'email':    self.email,
            'rol':      self.rol.nombre,
            'area':     self.area.nombre if self.area else None,
            'activo':   self.activo
        }


class Bien(db.Model):
    __tablename__ = 'bienes'

    id                     = db.Column(db.Integer, primary_key=True)
    numero_inventario      = db.Column(db.String(50), nullable=False, unique=True)
    descripcion            = db.Column(db.Text, nullable=False)
    marca                  = db.Column(db.String(100))
    modelo                 = db.Column(db.String(100))
    numero_serie           = db.Column(db.String(100))
    valor_adquisicion      = db.Column(db.Numeric(12,2))
    fecha_adquisicion      = db.Column(db.Date)
    estado                 = db.Column(db.Enum('bueno','regular','malo','baja'), default='bueno')
    area_id                = db.Column(db.Integer, db.ForeignKey('areas.id'))
    usuario_responsable_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'))
    activo                 = db.Column(db.Boolean, default=True)
    created_at             = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at             = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    area        = db.relationship('Area',    foreign_keys=[area_id])
    responsable = db.relationship('Usuario', foreign_keys=[usuario_responsable_id])
    movimientos = db.relationship('MovimientoBien', backref='bien', lazy='dynamic')

    def to_dict(self):
        return {
            'id':                     self.id,
            'numero_inventario':      self.numero_inventario,
            'descripcion':            self.descripcion,
            'marca':                  self.marca,
            'modelo':                 self.modelo,
            'numero_serie':           self.numero_serie,
            'valor_adquisicion':      str(self.valor_adquisicion) if self.valor_adquisicion else None,
            'fecha_adquisicion':      self.fecha_adquisicion.isoformat() if self.fecha_adquisicion else None,
            'estado':                 self.estado,
            'area_id':                self.area_id,
            'area':                   self.area.nombre if self.area else None,
            'usuario_responsable_id': self.usuario_responsable_id,
            'responsable':            self.responsable.nombre_completo if self.responsable else None,
            'activo':                 self.activo,
            'created_at':             self.created_at.isoformat()
        }


class MovimientoBien(db.Model):
    __tablename__ = 'movimientos_bienes'

    id          = db.Column(db.Integer, primary_key=True)
    bien_id     = db.Column(db.Integer, db.ForeignKey('bienes.id'), nullable=False)
    tipo        = db.Column(db.Enum('alta','baja','cambio_area','actualizacion'), nullable=False)
    descripcion = db.Column(db.Text)
    usuario_id  = db.Column(db.Integer, db.ForeignKey('usuarios.id'))
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    usuario = db.relationship('Usuario', foreign_keys=[usuario_id])

    def to_dict(self):
        return {
            'id':          self.id,
            'tipo':        self.tipo,
            'descripcion': self.descripcion,
            'usuario':     self.usuario.nombre_completo if self.usuario else None,
            'created_at':  self.created_at.isoformat()
        }
