CREATE SCHEMA grupos;

CREATE TABLE IF NOT EXISTS grupos.grupos (
	gru_id SERIAL NOT NULL,
	gru_nome VARCHAR(256) NOT NULL,
	usu_id_dono INT NOT NULL,      
	gru_created_at TIMESTAMP DEFAULT NOW(),

	CONSTRAINT pk_grupos_gru_id PRIMARY KEY (gru_id)
);

-- Pessoas vinculadas a um grupo (podem ou nao ser um usuário cadastrado)
CREATE TABLE IF NOT EXISTS grupos.participantes (
	par_id SERIAL NOT NULL,
	gru_id INT NOT NULL,
	usu_id INT,                   
	par_nome VARCHAR(256) NOT NULL,
	par_isento BOOLEAN NOT NULL DEFAULT false,   
	par_created_at TIMESTAMP DEFAULT NOW(),

	CONSTRAINT pk_participantes_par_id PRIMARY KEY (par_id),
	CONSTRAINT fk_participantes_gru_id FOREIGN KEY (gru_id) REFERENCES grupos.grupos (gru_id)
);

-- Vínculo entre uma despesa (de outro serviço) e um participante (Requisito 3)
CREATE TABLE IF NOT EXISTS grupos.despesa_participante (
	dp_id SERIAL NOT NULL,
	des_id INT NOT NULL,           
	par_id INT NOT NULL,
	dp_exclusiva BOOLEAN NOT NULL DEFAULT false,    
	dp_peso DECIMAL(10,2),                          
	dp_created_at TIMESTAMP DEFAULT NOW(),

	CONSTRAINT pk_despesa_participante_dp_id PRIMARY KEY (dp_id),
	CONSTRAINT fk_despesa_participante_par_id FOREIGN KEY (par_id) REFERENCES grupos.participantes (par_id),
	CONSTRAINT uq_despesa_participante UNIQUE (des_id, par_id)  
);
