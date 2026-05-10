-- ================================================
-- SISTEMA INSTITUCIONAL - Schema Base de Datos
-- ================================================

USE sistema_institucional;

-- ── ÁREAS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS areas (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(150) NOT NULL,
  descripcion TEXT,
  activo      TINYINT(1) NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_areas_nombre (nombre)
) ENGINE=InnoDB;

-- ── ROLES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(50) NOT NULL,
  descripcion VARCHAR(200),
  UNIQUE KEY uq_roles_nombre (nombre)
) ENGINE=InnoDB;

-- ── USUARIOS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre              VARCHAR(100) NOT NULL,
  apellidos           VARCHAR(100) NOT NULL,
  email               VARCHAR(150) NOT NULL,
  password_hash       VARCHAR(256) NOT NULL,
  rol_id              INT UNSIGNED NOT NULL,
  area_id             INT UNSIGNED,
  activo              TINYINT(1) NOT NULL DEFAULT 1,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuarios_email (email),
  CONSTRAINT fk_usuarios_rol  FOREIGN KEY (rol_id)  REFERENCES roles(id),
  CONSTRAINT fk_usuarios_area FOREIGN KEY (area_id) REFERENCES areas(id)
) ENGINE=InnoDB;

-- ── DATOS INICIALES ───────────────────────────────
INSERT INTO roles (nombre, descripcion) VALUES
  ('admin',       'Administrador con acceso total'),
  ('supervisor',  'Supervisor con acceso a aprobaciones'),
  ('almacenista', 'Responsable de almacen'),
  ('usuario',     'Usuario estandar del sistema');

INSERT INTO areas (nombre, descripcion) VALUES
  ('Administracion',   'Direccion administrativa'),
  ('Recursos Humanos', 'Gestion de personal'),
  ('Almacen General',  'Control de inventario'),
  ('Sistemas',         'Tecnologias de informacion'),
  ('Finanzas',         'Gestion financiera');

