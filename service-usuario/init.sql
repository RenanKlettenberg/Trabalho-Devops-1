CREATE SCHEMA usuario; -- Nome do microserviço

-- DROP TABLE usuario.usuario
CREATE TABLE IF NOT EXISTS usuario.usuarios (
	usu_id SERIAL NOT NULL,
	usu_email VARCHAR(256) UNIQUE NOT NULL,
	usu_nome VARCHAR(256) NOT NULL,
	usu_password TEXT NOT NULL,
	usu_plano VARCHAR(20) NOT NULL DEFAULT 'free',
	usu_codigo_auth INT,
	usu_codigo_auth_validade TIMESTAMP,
	usu_created_at TIMESTAMP DEFAULT NOW(),

	CONSTRAINT pk_sys_usuario_usu_id PRIMARY KEY (usu_id)
);