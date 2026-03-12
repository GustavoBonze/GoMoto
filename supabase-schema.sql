-- ============================================================
-- GoMoto — Schema do Banco de Dados (Supabase / PostgreSQL)
-- Execute este script no SQL Editor do Supabase Dashboard
-- ============================================================

-- Habilitar extensão de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELA: motos
-- ============================================================
CREATE TABLE motos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  placa VARCHAR(10) NOT NULL UNIQUE,
  modelo VARCHAR(100) NOT NULL,
  marca VARCHAR(100) NOT NULL,
  ano INTEGER NOT NULL,
  cor VARCHAR(50),
  renavam VARCHAR(20),
  chassi VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'alugada', 'manutencao', 'inativa')),
  foto_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: clientes
-- ============================================================
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(200) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  rg VARCHAR(20),
  telefone VARCHAR(20) NOT NULL,
  email VARCHAR(200),
  endereco TEXT,
  cnh VARCHAR(20) NOT NULL,
  cnh_validade DATE NOT NULL,
  foto_cnh_url TEXT,
  foto_documento_url TEXT,
  observacoes TEXT,
  na_fila BOOLEAN NOT NULL DEFAULT FALSE,
  data_entrada_fila TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: contratos
-- ============================================================
CREATE TABLE contratos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  moto_id UUID NOT NULL REFERENCES motos(id),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  valor_mensal DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'encerrado')),
  pdf_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: cobrancas
-- ============================================================
CREATE TABLE cobrancas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contrato_id UUID REFERENCES contratos(id),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  descricao VARCHAR(300) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  vencimento DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido')),
  data_pagamento DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: entradas
-- ============================================================
CREATE TABLE entradas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  descricao VARCHAR(300) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  data DATE NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  moto_id UUID REFERENCES motos(id),
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: despesas
-- ============================================================
CREATE TABLE despesas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  descricao VARCHAR(300) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  data DATE NOT NULL,
  moto_id UUID REFERENCES motos(id),
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: multas
-- ============================================================
CREATE TABLE multas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  moto_id UUID NOT NULL REFERENCES motos(id),
  descricao VARCHAR(300) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_infracao DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')),
  data_pagamento DATE,
  responsavel VARCHAR(20) NOT NULL DEFAULT 'cliente' CHECK (responsavel IN ('cliente', 'empresa')),
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: manutencoes
-- ============================================================
CREATE TABLE manutencoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moto_id UUID NOT NULL REFERENCES motos(id),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('preventiva', 'corretiva', 'vistoria')),
  descricao VARCHAR(300) NOT NULL,
  data_realizada DATE,
  data_agendada DATE,
  custo DECIMAL(10,2),
  realizada BOOLEAN NOT NULL DEFAULT FALSE,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: checklists
-- ============================================================
CREATE TABLE checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moto_id UUID NOT NULL REFERENCES motos(id),
  contrato_id UUID REFERENCES contratos(id),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrega', 'devolucao')),
  data DATE NOT NULL,
  km_atual INTEGER NOT NULL,
  combustivel INTEGER NOT NULL CHECK (combustivel BETWEEN 0 AND 100),
  itens JSONB NOT NULL DEFAULT '[]',
  assinatura_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: processos
-- ============================================================
CREATE TABLE processos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: configuracoes
-- ============================================================
CREATE TABLE configuracoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chave VARCHAR(100) NOT NULL UNIQUE,
  valor TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO configuracoes (chave, valor) VALUES
  ('empresa_nome', 'GoMoto Locadora'),
  ('empresa_cnpj', ''),
  ('empresa_telefone', ''),
  ('empresa_email', ''),
  ('empresa_endereco', ''),
  ('notificacoes_email', 'true'),
  ('dias_aviso_vencimento', '3');

-- ============================================================
-- FUNÇÃO: atualizar updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER trg_motos_updated_at BEFORE UPDATE ON motos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_contratos_updated_at BEFORE UPDATE ON contratos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_cobrancas_updated_at BEFORE UPDATE ON cobrancas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_multas_updated_at BEFORE UPDATE ON multas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_manutencoes_updated_at BEFORE UPDATE ON manutencoes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_processos_updated_at BEFORE UPDATE ON processos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — apenas usuários autenticados
-- ============================================================
ALTER TABLE motos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cobrancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE entradas ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE multas ENABLE ROW LEVEL SECURITY;
ALTER TABLE manutencoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Políticas: apenas usuários autenticados acessam
CREATE POLICY "Autenticados podem ver motos" ON motos FOR ALL TO authenticated USING (true);
CREATE POLICY "Autenticados podem ver clientes" ON clientes FOR ALL TO authenticated USING (true);
CREATE POLICY "Autenticados podem ver contratos" ON contratos FOR ALL TO authenticated USING (true);
CREATE POLICY "Autenticados podem ver cobrancas" ON cobrancas FOR ALL TO authenticated USING (true);
CREATE POLICY "Autenticados podem ver entradas" ON entradas FOR ALL TO authenticated USING (true);
CREATE POLICY "Autenticados podem ver despesas" ON despesas FOR ALL TO authenticated USING (true);
CREATE POLICY "Autenticados podem ver multas" ON multas FOR ALL TO authenticated USING (true);
CREATE POLICY "Autenticados podem ver manutencoes" ON manutencoes FOR ALL TO authenticated USING (true);
CREATE POLICY "Autenticados podem ver checklists" ON checklists FOR ALL TO authenticated USING (true);
CREATE POLICY "Autenticados podem ver processos" ON processos FOR ALL TO authenticated USING (true);
CREATE POLICY "Autenticados podem ver configuracoes" ON configuracoes FOR ALL TO authenticated USING (true);
