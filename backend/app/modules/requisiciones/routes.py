from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from app import db
from app.models import Requisicion, PartidaRequisicion, EstatusRequisicion

requisiciones_bp = Blueprint('requisiciones', __name__)


def generar_folio():
    anio  = datetime.utcnow().year
    total = Requisicion.query.filter(
        Requisicion.folio.like(f'REQ-{anio}-%')
    ).count()
    return f'REQ-{anio}-{str(total + 1).zfill(4)}'


@requisiciones_bp.get('/')
@jwt_required()
def listar():
    claims     = get_jwt()
    usuario_id = int(get_jwt_identity())
    rol        = claims.get('rol')

    query = Requisicion.query

    # Usuarios normales solo ven sus requisiciones
    if rol not in ('admin', 'supervisor'):
        query = query.filter_by(solicitante_id=usuario_id)

    if estatus := request.args.get('estatus'):
        query = query.join(EstatusRequisicion).filter(
            EstatusRequisicion.estatus == estatus
        )

    reqs = query.order_by(Requisicion.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reqs]), 200


@requisiciones_bp.post('/')
@jwt_required()
def crear():
    data       = request.get_json(silent=True) or {}
    usuario_id = int(get_jwt_identity())

    if not data.get('titulo'):
        return jsonify({'error': 'El titulo es requerido'}), 400

    partidas_data = data.get('partidas', [])
    if not partidas_data:
        return jsonify({'error': 'Agrega al menos un concepto'}), 400

    total = sum(
        float(p.get('cantidad', 0)) * float(p.get('precio_unitario', 0))
        for p in partidas_data
    )

    req = Requisicion(
        folio          = generar_folio(),
        titulo         = data['titulo'],
        descripcion    = data.get('descripcion'),
        solicitante_id = usuario_id,
        area_id        = data.get('area_id'),
        periodo        = data.get('periodo'),
        total          = total
    )
    db.session.add(req)
    db.session.flush()

    for p in partidas_data:
        cantidad        = float(p.get('cantidad', 0))
        precio_unitario = float(p.get('precio_unitario', 0))
        partida = PartidaRequisicion(
            requisicion_id  = req.id,
            concepto        = p['concepto'],
            cantidad        = cantidad,
            unidad          = p.get('unidad', 'pieza'),
            precio_unitario = precio_unitario,
            subtotal        = cantidad * precio_unitario
        )
        db.session.add(partida)

    estatus_inicial = EstatusRequisicion(
        requisicion_id = req.id,
        estatus        = 'borrador',
        usuario_id     = usuario_id,
        observaciones  = 'Requisicion creada'
    )
    db.session.add(estatus_inicial)
    db.session.commit()

    return jsonify({'mensaje': 'Requisicion creada', 'id': req.id, 'folio': req.folio}), 201


@requisiciones_bp.get('/<int:rid>')
@jwt_required()
def obtener(rid):
    req  = Requisicion.query.get_or_404(rid)
    data = req.to_dict()
    data['partidas']    = [p.to_dict() for p in req.partidas]
    data['historial']   = [e.to_dict() for e in req.estatus_log]
    return jsonify(data), 200


@requisiciones_bp.patch('/<int:rid>/estatus')
@jwt_required()
def cambiar_estatus(rid):
    req        = Requisicion.query.get_or_404(rid)
    data       = request.get_json(silent=True) or {}
    usuario_id = int(get_jwt_identity())
    claims     = get_jwt()
    rol        = claims.get('rol')

    nuevo_estatus = data.get('estatus')
    if not nuevo_estatus:
        return jsonify({'error': 'El estatus es requerido'}), 400

    # Solo admin y supervisor pueden aprobar o rechazar
    if nuevo_estatus in ('aprobada', 'rechazada') and rol not in ('admin', 'supervisor'):
        return jsonify({'error': 'Sin permiso para este cambio de estatus'}), 403

    nuevo = EstatusRequisicion(
        requisicion_id = req.id,
        estatus        = nuevo_estatus,
        observaciones  = data.get('observaciones'),
        usuario_id     = usuario_id
    )
    db.session.add(nuevo)
    db.session.commit()

    return jsonify({'mensaje': f'Estatus cambiado a {nuevo_estatus}'}), 200
