from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app import db
from app.models import Usuario, Rol, Area

usuarios_bp = Blueprint('usuarios', __name__)


def solo_admin():
    claims = get_jwt()
    return claims.get('rol') == 'admin'


@usuarios_bp.get('/')
@jwt_required()
def listar_usuarios():
    if not solo_admin():
        return jsonify({'error': 'Sin permiso'}), 403

    usuarios = Usuario.query.order_by(Usuario.nombre).all()
    return jsonify([u.to_dict() for u in usuarios]), 200


@usuarios_bp.post('/')
@jwt_required()
def crear_usuario():
    if not solo_admin():
        return jsonify({'error': 'Sin permiso'}), 403

    data = request.get_json(silent=True) or {}

    campos = ['nombre', 'apellidos', 'email', 'password', 'rol_id']
    for campo in campos:
        if not data.get(campo):
            return jsonify({'error': f'El campo {campo} es requerido'}), 400

    if Usuario.query.filter_by(email=data['email'].lower()).first():
        return jsonify({'error': 'El correo ya esta registrado'}), 409

    nuevo = Usuario(
        nombre    = data['nombre'],
        apellidos = data['apellidos'],
        email     = data['email'].lower(),
        rol_id    = data['rol_id'],
        area_id   = data.get('area_id'),
        activo    = True
    )
    nuevo.set_password(data['password'])

    db.session.add(nuevo)
    db.session.commit()

    return jsonify({'mensaje': 'Usuario creado', 'id': nuevo.id}), 201


@usuarios_bp.patch('/<int:uid>/activar')
@jwt_required()
def activar_usuario(uid):
    if not solo_admin():
        return jsonify({'error': 'Sin permiso'}), 403

    usuario = Usuario.query.get_or_404(uid)
    usuario.activo = True
    db.session.commit()
    return jsonify({'mensaje': 'Usuario activado'}), 200


@usuarios_bp.patch('/<int:uid>/desactivar')
@jwt_required()
def desactivar_usuario(uid):
    if not solo_admin():
        return jsonify({'error': 'Sin permiso'}), 403

    usuario = Usuario.query.get_or_404(uid)
    usuario.activo = False
    db.session.commit()
    return jsonify({'mensaje': 'Usuario desactivado'}), 200


@usuarios_bp.get('/roles')
@jwt_required()
def listar_roles():
    roles = Rol.query.all()
    return jsonify([r.to_dict() for r in roles]), 200


@usuarios_bp.get('/areas')
@jwt_required()
def listar_areas():
    areas = Area.query.filter_by(activo=True).all()
    return jsonify([a.to_dict() for a in areas]), 200
