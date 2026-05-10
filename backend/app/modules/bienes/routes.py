from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models import Bien, MovimientoBien

bienes_bp = Blueprint('bienes', __name__)


@bienes_bp.get('/')
@jwt_required()
def listar_bienes():
    query = Bien.query.filter_by(activo=True)

    area_id = request.args.get('area_id')
    estado  = request.args.get('estado')
    q       = request.args.get('q')

    if area_id:
        query = query.filter_by(area_id=int(area_id))
    if estado:
        query = query.filter_by(estado=estado)
    if q:
        query = query.filter(Bien.descripcion.ilike(f'%{q}%') |
                             Bien.numero_inventario.ilike(f'%{q}%'))

    bienes = query.order_by(Bien.numero_inventario).all()
    return jsonify([b.to_dict() for b in bienes]), 200


@bienes_bp.post('/')
@jwt_required()
def crear_bien():
    data = request.get_json(silent=True) or {}

    if not data.get('numero_inventario') or not data.get('descripcion'):
        return jsonify({'error': 'Numero de inventario y descripcion son requeridos'}), 400

    if Bien.query.filter_by(numero_inventario=data['numero_inventario']).first():
        return jsonify({'error': 'El numero de inventario ya existe'}), 409

    usuario_id = int(get_jwt_identity())

    bien = Bien(
        numero_inventario      = data['numero_inventario'],
        descripcion            = data['descripcion'],
        marca                  = data.get('marca'),
        modelo                 = data.get('modelo'),
        numero_serie           = data.get('numero_serie'),
        valor_adquisicion      = data.get('valor_adquisicion'),
        fecha_adquisicion      = data.get('fecha_adquisicion'),
        estado                 = data.get('estado', 'bueno'),
        area_id                = data.get('area_id'),
        usuario_responsable_id = data.get('usuario_responsable_id')
    )
    db.session.add(bien)
    db.session.flush()

    movimiento = MovimientoBien(
        bien_id     = bien.id,
        tipo        = 'alta',
        descripcion = 'Registro inicial del bien',
        usuario_id  = usuario_id
    )
    db.session.add(movimiento)
    db.session.commit()

    return jsonify({'mensaje': 'Bien registrado', 'id': bien.id}), 201


@bienes_bp.get('/<int:bid>')
@jwt_required()
def obtener_bien(bid):
    bien = Bien.query.get_or_404(bid)
    data = bien.to_dict()
    data['movimientos'] = [m.to_dict() for m in bien.movimientos.order_by(
        MovimientoBien.created_at.desc()).limit(10)]
    return jsonify(data), 200


@bienes_bp.patch('/<int:bid>')
@jwt_required()
def actualizar_bien(bid):
    bien = Bien.query.get_or_404(bid)
    data = request.get_json(silent=True) or {}
    usuario_id = int(get_jwt_identity())

    campos = ['descripcion','marca','modelo','numero_serie',
              'valor_adquisicion','estado','area_id','usuario_responsable_id']
    for campo in campos:
        if campo in data:
            setattr(bien, campo, data[campo])

    movimiento = MovimientoBien(
        bien_id     = bien.id,
        tipo        = 'actualizacion',
        descripcion = data.get('motivo', 'Actualizacion de datos'),
        usuario_id  = usuario_id
    )
    db.session.add(movimiento)
    db.session.commit()

    return jsonify({'mensaje': 'Bien actualizado'}), 200


@bienes_bp.patch('/<int:bid>/baja')
@jwt_required()
def dar_baja(bid):
    bien = Bien.query.get_or_404(bid)
    usuario_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    bien.activo = False
    bien.estado = 'baja'

    movimiento = MovimientoBien(
        bien_id     = bien.id,
        tipo        = 'baja',
        descripcion = data.get('motivo', 'Baja del sistema'),
        usuario_id  = usuario_id
    )
    db.session.add(movimiento)
    db.session.commit()

    return jsonify({'mensaje': 'Bien dado de baja'}), 200
