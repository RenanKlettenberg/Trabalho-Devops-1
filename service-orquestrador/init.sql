CREATE SCHEMA IF NOT EXISTS orquestrador;

CREATE TABLE IF NOT EXISTS orquestrador.sagas (
	sag_id UUID NOT NULL,
	sag_tipo VARCHAR(50) NOT NULL,
	sag_status VARCHAR(20) NOT NULL DEFAULT 'INICIADA',
	sag_payload JSONB NOT NULL,
	sag_resultado JSONB,
	sag_created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	sag_updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

	CONSTRAINT pk_sagas_sag_id PRIMARY KEY (sag_id),
	CONSTRAINT ck_sagas_sag_tipo CHECK (sag_tipo IN ('REGISTRAR_DESPESA', 'CANCELAR_DESPESA')),
	CONSTRAINT ck_sagas_sag_status CHECK (sag_status IN ('INICIADA', 'CONCLUIDA', 'FALHA'))
);

CREATE TABLE IF NOT EXISTS orquestrador.saga_passos (
	pas_id SERIAL NOT NULL,
	sag_id UUID NOT NULL,
	pas_nome VARCHAR(50) NOT NULL,
	pas_status VARCHAR(20) NOT NULL,
	pas_detalhe JSONB,
	pas_created_at TIMESTAMP NOT NULL DEFAULT NOW(),

	CONSTRAINT pk_saga_passos_pas_id PRIMARY KEY (pas_id),
	CONSTRAINT fk_saga_passos_sag_id FOREIGN KEY (sag_id) REFERENCES orquestrador.sagas (sag_id)
);

CREATE INDEX IF NOT EXISTS idx_saga_passos_sag_id
	ON orquestrador.saga_passos (sag_id);
