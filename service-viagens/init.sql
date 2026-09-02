CREATE SCHEMA viagem;

CREATE TABLE viagem.viagens(
	via_id SERIAL,
	via_nome VARCHAR(255) NOT NULL,
	via_data_ini TIMESTAMP NOT NULL,
	via_data_fim TIMESTAMP NOT NULL,

	gru_id INT NOT NULL,

	CONSTRAINT pf_viagens_via_id PRIMARY KEY (via_id),
);

CREATE TABLE viagem.eventos(
	eve_id SERIAL,
	eve_nome VARCHAR(255),
	eve_descricao TEXT,
	eve_status INT DEFAULT 1,
	eve_categoria INT NOT NULL,
	eve_data_ini TIMESTAMP,
	eve_data_fim TIMESTAMP,
	eve_data_estimatida BOOLEAN NOT NULL DEFAULT true,
	eve_orcamento DECIMAL(10,2) DEFAULT 0,

	via_id INT NOT NULL,
	usu_id INT NOT NULL,

	CONSTRAINT pk_eventos_eve_id PRIMARY KEY (eve_id),
	CONSTRAINT fk_eventos_via_id FOREIGN KEY (via_id) REFERENCES viagem.viagens (via_id),
);