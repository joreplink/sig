from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

db  = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY']              = os.getenv('SECRET_KEY', 'dev-key')
    app.config['JWT_SECRET_KEY']          = os.getenv('JWT_SECRET_KEY', 'jwt-dev-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"mysql+pymysql://{os.getenv('DB_USER','jorep')}:"
        f"{os.getenv('DB_PASSWORD','T3cn0l061as')}@"
        f"{os.getenv('DB_HOST','localhost')}:"
        f"{os.getenv('DB_PORT','3306')}/"
        f"{os.getenv('DB_NAME','sistema_institucional')}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    jwt.init_app(app)
    CORS(app,
         origins=os.getenv('CORS_ORIGINS', 'http://localhost:4200'),
         supports_credentials=True)

    from app.modules.auth.routes     import auth_bp
    from app.modules.usuarios.routes import usuarios_bp
    from app.modules.bienes.routes   import bienes_bp

    app.register_blueprint(auth_bp,     url_prefix='/api/auth')
    app.register_blueprint(usuarios_bp, url_prefix='/api/usuarios')
    app.register_blueprint(bienes_bp,   url_prefix='/api/bienes')

    @app.route('/api/ping')
    def ping():
        return jsonify({'status': 'ok', 'mensaje': 'Backend funcionando'})

    return app
