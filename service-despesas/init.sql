CREATE SCHEMA IF NOT EXISTS despesas;

CREATE TABLE IF NOT EXISTS despesas.despesas (
	des_id UUID NOT NULL,
	des_descricao VARCHAR(255) NOT NULL DEFAULT '',
	des_valor NUMERIC(12, 2) NOT NULL,
	des_moeda_original CHAR(3) NOT NULL,
	des_categoria VARCHAR(50) NOT NULL,
	des_viagem_id VARCHAR(100) NOT NULL,
	des_evento_id VARCHAR(100),
	des_status VARCHAR(20) NOT NULL DEFAULT 'ATIVA',
	des_created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	des_updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

	CONSTRAINT pk_despesas_des_id PRIMARY KEY (des_id),
	CONSTRAINT ck_despesas_des_valor CHECK (des_valor > 0),
	CONSTRAINT ck_despesas_des_moeda CHECK (des_moeda_original ~ '^[A-Z]{3}$'),
	CONSTRAINT ck_despesas_des_status CHECK (des_status IN ('ATIVA', 'ESTORNADA'))
);

CREATE INDEX IF NOT EXISTS idx_despesas_viagem_id
	ON despesas.despesas (des_viagem_id);

CREATE INDEX IF NOT EXISTS idx_despesas_evento_id
	ON despesas.despesas (des_evento_id);