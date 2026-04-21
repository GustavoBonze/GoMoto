-- ============================================================
-- GoMoto — Schema do Banco de Dados (Supabase / PostgreSQL)
-- Execute este script no SQL Editor do Supabase Dashboard
-- Gerado e revisado em 2026-03-19
-- ============================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELA: motorcycles
-- ============================================================
CREATE TABLE motorcycles (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_plate          VARCHAR(10) UNIQUE,
    model                  VARCHAR(100),
    make                   VARCHAR(100),
    year                   VARCHAR(10),        -- string: pode ser '2023/2024'
    color                  VARCHAR(50),
    renavam                VARCHAR(20),
    chassis                VARCHAR(20),
    fuel                   VARCHAR(50),
    engine_capacity        VARCHAR(20),
    previous_owner         VARCHAR(200),
    previous_owner_cpf     VARCHAR(14),
    purchase_date          DATE,
    fipe_value             DECIMAL(10,2),
    maintenance_up_to_date BOOLEAN DEFAULT false,
    status                 VARCHAR(20) CHECK (status IN ('available', 'rented', 'maintenance', 'inactive')) DEFAULT 'available',
    photo_url              TEXT,
    km_current             INTEGER DEFAULT 0,
    observations           TEXT,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: customers
-- ============================================================
CREATE TABLE customers (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                        VARCHAR(200),
    cpf                         VARCHAR(14) UNIQUE,
    rg                          VARCHAR(20),
    state                       VARCHAR(2),
    phone                       VARCHAR(20),
    email                       VARCHAR(200),
    address                     TEXT,
    zip_code                    VARCHAR(10),
    emergency_contact           VARCHAR(300),
    drivers_license             VARCHAR(20),
    drivers_license_validity    DATE,
    drivers_license_category    VARCHAR(10),
    birth_date                  DATE,
    payment_status              VARCHAR(50),
    drivers_license_photo_url   TEXT,
    document_photo_url          TEXT,
    observations                TEXT,
    in_queue                    BOOLEAN NOT NULL DEFAULT false,
    active                      BOOLEAN NOT NULL DEFAULT true,
    departure_date              DATE,
    departure_reason            TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: contracts
-- ============================================================
CREATE TABLE contracts (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id      UUID REFERENCES customers(id) ON DELETE CASCADE,
    motorcycle_id    UUID REFERENCES motorcycles(id) ON DELETE CASCADE,
    start_date       DATE,
    end_date         DATE,
    monthly_amount   DECIMAL(10,2),
    status           VARCHAR(20) CHECK (status IN ('active', 'closed', 'cancelled', 'broken')) DEFAULT 'active',
    pdf_url          TEXT,
    observations     TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: billings
-- ============================================================
CREATE TABLE billings (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id      UUID REFERENCES contracts(id) ON DELETE CASCADE,
    customer_id      UUID REFERENCES customers(id) ON DELETE CASCADE,
    description      VARCHAR(300),
    amount           DECIMAL(10,2),
    due_date         DATE,
    status           VARCHAR(20) CHECK (status IN ('pending', 'paid', 'overdue', 'loss')) DEFAULT 'pending',
    payment_date     DATE,
    observations     TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: incomes
-- ============================================================
CREATE TABLE incomes (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle          VARCHAR(10),        -- placa da moto
    date             DATE,               -- data do pagamento
    lessee           VARCHAR(200),       -- nome do locatário
    amount           DECIMAL(10,2),
    reference        VARCHAR(50),        -- Semanal, Quinzenal, Mensal, Caucao, Multa, Proporcional, Outros
    payment_method   VARCHAR(50),        -- PIX, Boleto, Cartao de credito, etc.
    period_from      DATE,               -- inicio do periodo referente
    period_to        DATE,               -- fim do periodo referente
    observations     TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: expenses
-- ============================================================
CREATE TABLE expenses (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description      VARCHAR(300),
    amount           DECIMAL(10,2),
    category         VARCHAR(100),
    date             DATE,
    motorcycle_id    UUID REFERENCES motorcycles(id) ON DELETE SET NULL,
    observations     TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: fines
-- ============================================================
CREATE TABLE fines (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id      UUID REFERENCES customers(id) ON DELETE CASCADE,
    motorcycle_id    UUID REFERENCES motorcycles(id) ON DELETE CASCADE,
    description      VARCHAR(300),
    amount           DECIMAL(10,2),
    infraction_date  DATE,
    due_date         DATE,
    status           VARCHAR(20) CHECK (status IN ('pending', 'paid')) DEFAULT 'pending',
    payment_date     DATE,
    responsible      VARCHAR(20) CHECK (responsible IN ('customer', 'company')) DEFAULT 'customer',
    observations     TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: maintenance_items
-- ============================================================
CREATE TABLE maintenance_items (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name             VARCHAR(200),
    km_interval      INTEGER,            -- NULL para itens baseados em data
    day_interval     INTEGER,            -- ex: 30 para vistoria mensal
    type             VARCHAR(20) CHECK (type IN ('preventive', 'corrective', 'inspection')),
    tip              TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: maintenances
-- ============================================================
CREATE TABLE maintenances (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    motorcycle_id        UUID REFERENCES motorcycles(id) ON DELETE CASCADE,
    standard_item_id     UUID REFERENCES maintenance_items(id) ON DELETE CASCADE,
    type                 VARCHAR(20) CHECK (type IN ('preventive', 'corrective', 'inspection')),
    description          VARCHAR(300),
    predicted_km         INTEGER,
    actual_km            INTEGER,
    scheduled_date       DATE,
    completed_date       DATE,
    cost                 DECIMAL(10,2),
    completed            BOOLEAN NOT NULL DEFAULT false,
    workshop             VARCHAR(200) DEFAULT 'Oficina do Careca',
    odometer_photo_url   TEXT,
    invoice_photo_url    TEXT,
    observations         TEXT,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: checklists
-- ============================================================
CREATE TABLE checklists (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    motorcycle_id    UUID REFERENCES motorcycles(id) ON DELETE CASCADE,
    contract_id      UUID REFERENCES contracts(id) ON DELETE CASCADE,
    type             VARCHAR(20) CHECK (type IN ('delivery', 'return')),
    date             DATE,
    current_km       INTEGER,
    fuel_level       INTEGER CHECK (fuel_level >= 0 AND fuel_level <= 100),
    items            JSONB NOT NULL DEFAULT '[]'::jsonb,
    signature_url    TEXT,
    observations     TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: processes
-- ============================================================
CREATE TABLE processes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question    TEXT,
    answer      TEXT,
    category    VARCHAR(100),
    "order"     INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: settings
-- ============================================================
CREATE TABLE settings (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key       VARCHAR(100) NOT NULL UNIQUE,
    value       TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: contract_templates (modelos de contrato .docx)
-- ============================================================
CREATE TABLE contract_templates (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug        VARCHAR(100) NOT NULL UNIQUE,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    file_url    TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can access contract_templates" ON contract_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- TABELA: queue_entries (fila de espera)
-- ============================================================
CREATE TABLE queue_entries (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id  UUID REFERENCES customers(id) ON DELETE CASCADE,
    position     INTEGER NOT NULL,
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNÇÃO: atualizar updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER trg_motorcycles_updated_at
    BEFORE UPDATE ON motorcycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_contracts_updated_at
    BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_billings_updated_at
    BEFORE UPDATE ON billings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_fines_updated_at
    BEFORE UPDATE ON fines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_maintenances_updated_at
    BEFORE UPDATE ON maintenances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_processes_updated_at
    BEFORE UPDATE ON processes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_settings_updated_at
    BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_queue_entries_updated_at
    BEFORE UPDATE ON queue_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — apenas usuários autenticados
-- ============================================================
ALTER TABLE motorcycles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE billings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE fines            ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenances     ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists       ENABLE ROW LEVEL SECURITY;
ALTER TABLE processes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs       ENABLE ROW LEVEL SECURITY;

-- Políticas: apenas usuários autenticados acessam (leitura e escrita)
CREATE POLICY "Authenticated users can access motorcycles"        ON motorcycles        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access customers"          ON customers          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access contracts"          ON contracts          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access billings"           ON billings           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access incomes"            ON incomes            FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access expenses"           ON expenses           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access fines"              ON fines              FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access maintenance_items"  ON maintenance_items  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access maintenances"       ON maintenances       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access checklists"         ON checklists         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access processes"          ON processes          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access settings"           ON settings           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access queue_entries"      ON queue_entries      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can access audit_logs"        ON audit_logs         FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- TABELA: audit_logs (rastreamento de ações)
-- ============================================================
CREATE TABLE audit_logs (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID NOT NULL,
    action           VARCHAR(50) NOT NULL,
    table_name       VARCHAR(100),
    record_id        UUID,
    old_data         JSONB,
    new_data         JSONB,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================
-- SEED: maintenance_items (13 itens padrão)
-- ============================================================
INSERT INTO maintenance_items (name, km_interval, day_interval, type, tip) VALUES
('Troca de oleo',                          1000,  NULL, 'preventive', 'Use oleo 20W50 ou 10W30; troque o filtro a cada 2 trocas.'),
('Filtro de oleo',                         4000,  NULL, 'preventive', 'Trocar a cada duas trocas de oleo.'),
('Lubrificacao da corrente',                500,  NULL, 'preventive', 'Use spray para corrente com o-ring; lubrificar apos chuva.'),
('Ajuste da corrente',                     1000,  NULL, 'preventive', 'Peso extra afrouxa mais rapido em motos de locacao.'),
('Troca da relacao (corrente/coroa/pinhao)', 12000, NULL, 'preventive', 'Prefira relacao original para maior durabilidade.'),
('Lona de freio traseira',                12000,  NULL, 'preventive', 'Evite manter o pe no freio.'),
('Pastilha de freio dianteira',            8000,  NULL, 'preventive', 'Use o freio dianteiro de forma equilibrada.'),
('Pneu dianteiro',                        12000,  NULL, 'preventive', 'Calibre semanalmente (32 psi dianteiro).'),
('Pneu traseiro',                          8000,  NULL, 'preventive', 'Calibre semanalmente (36 psi traseiro).'),
('Filtro de ar',                           7000,  NULL, 'preventive', 'Limpar ou trocar; poeira urbana reduz durabilidade.'),
('Velas de ignicao',                      10000,  NULL, 'preventive', 'Verificar e ajustar folga antes de trocar.'),
('Amortecedores',                         25000,  NULL, 'preventive', 'Peso extra acelera desgaste do oleo interno.'),
('Vistoria mensal',                         NULL,   30, 'inspection', 'Vistoria obrigatoria mensal de todas as motos.');

-- ============================================================
-- SEED: settings
-- ============================================================
INSERT INTO settings (key, value) VALUES
('company_name',              'GoMoto Locadora'),
('company_cnpj',              ''),
('company_phone',             ''),
('company_email',             ''),
('company_address',           ''),
('email_notifications',       'true'),
('due_date_warning_days',     '3');

-- ============================================================
-- SEED: motorcycles (5 motos da frota)
-- ============================================================
INSERT INTO motorcycles (id, license_plate, model, make, year, color, renavam, chassis, fuel, engine_capacity, status, km_current) VALUES
('11111111-1111-1111-1111-111111111111', 'ABC-1234', 'CG 160 Start',  'Honda',  '2021',      'Vermelha', '12345678901', '9C2KC2220MR123456', 'Gasolina', '160cc', 'rented',    45000),
('22222222-2222-2222-2222-222222222222', 'ABC1D23',  'CG 160 Fan',    'Honda',  '2022/2023', 'Preta',    '10987654321', '9C2KC2220NR654321', 'Flex',     '160cc', 'rented',    25000),
('33333333-3333-3333-3333-333333333333', 'DEF-5678', 'Factor 150',    'Yamaha', '2023',      'Branca',   '11223344556', '9C6KE2020PR112233', 'Flex',     '150cc', 'available', 15000),
('44444444-4444-4444-4444-444444444444', 'GHI-9012', 'Biz 125',       'Honda',  '2021/2022', 'Vermelha', '66554433221', '9C2JC1110MR998877', 'Flex',     '125cc', 'available', 32000),
('55555555-5555-5555-5555-555555555555', 'JKL3M45',  'Pop 110i',      'Honda',  '2022',      'Preta',    '99887766554', '9C2HA1010NR554433', 'Gasolina', '110cc', 'available',  8000);

-- ============================================================
-- SEED: customers (3 clientes fictícios)
-- ============================================================
INSERT INTO customers (id, name, cpf, rg, state, phone, email, in_queue, active) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Joao da Silva',    '123.456.789-09', '12345678', 'SP', '(11) 98765-4321', 'joao.silva@email.com',    false, true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Maria Santos',     '987.654.321-00', '87654321', 'SP', '(11) 91234-5678', 'maria.santos@email.com',  false, true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Pedro Oliveira',   '111.222.333-44', '11223344', 'SP', '(11) 99988-7766', 'pedro.oliveira@email.com', true,  true);

-- ============================================================
-- SEED: contracts (2 contratos ativos)
-- ============================================================
INSERT INTO contracts (id, customer_id, motorcycle_id, start_date, end_date, monthly_amount, status) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '2 months', CURRENT_DATE + INTERVAL '4 months', 800.00, 'active'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', CURRENT_DATE - INTERVAL '1 month',  CURRENT_DATE + INTERVAL '5 months', 900.00, 'active');

-- ============================================================
-- SEED: billings (1 paga, 1 pendente)
-- ============================================================
INSERT INTO billings (contract_id, customer_id, description, amount, due_date, status, payment_date) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mensalidade - Parcela 2', 800.00, CURRENT_DATE - INTERVAL '5 days', 'paid',    CURRENT_DATE - INTERVAL '6 days'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Mensalidade - Parcela 1', 900.00, CURRENT_DATE + INTERVAL '2 days', 'pending', NULL);

-- ============================================================
-- Pedro Oliveira na fila de espera (posição 1)
-- ============================================================
INSERT INTO queue_entries (customer_id, position, notes) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', 1, 'Aguardando disponibilidade de moto CG 160');
