from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import Usuario

auth_bp = Blueprint('auth', __name__)


@auth_bp.post('/login')
def login():
    data = request.get_json(silent=True) or {}

    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email y password son requeridos'}), 400

    usuario = Usuario.query.filter_by(email=email).first()

    if not usuario or not usuario.check_password(password):
        return jsonify({'error': 'Credenciales invalidas'}), 401

    if not usuario.activo:
        return jsonify({'error': 'Usuario inactivo'}), 403

    token = create_access_token(
        identity=str(usuario.id),
        additional_claims={
            'rol':    usuario.rol.nombre,
            'nombre': usuario.nombre_completo,
            'email':  usuario.email
        }
    )

    return jsonify({
        'access_token': token,
        'usuario': usuario.to_dict()
    }), 200


@auth_bp.get('/perfil')
@jwt_required()
def perfil():
    usuario_id = int(get_jwt_identity())
    usuario    = Usuario.query.get_or_404(usuario_id)
    return jsonify(usuario.to_dict()), 200
