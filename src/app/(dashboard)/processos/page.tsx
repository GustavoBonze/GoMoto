/**
 * @file src/app/(dashboard)/processos/page.tsx
 * @description Página de Gestão de Processos e Base de Conhecimento da GoMoto.
 * 
 * @summary
 * Esta página funciona como uma base de conhecimento centralizada (FAQ) para os funcionários.
 * O "porquê" de sua existência é padronizar o atendimento e as operações, garantindo
 * que todos na equipe sigam as mesmas regras e tenham acesso rápido a respostas
 * para as dúvidas mais comuns de clientes sobre locação, cobrança, manutenção, etc.
 * Isso reduz erros, agiliza o treinamento e melhora a consistência do serviço.
 * 
 * @funcionalidades
 * 1.  **Visualização em Acordeão**: Exibe os processos como uma lista de perguntas e respostas expansíveis.
 * 2.  **Agrupamento por Categoria**: Organiza os processos em seções (Locação, Cobrança, etc.) para fácil navegação.
 * 3.  **Filtro Rápido**: Permite filtrar a lista para ver apenas uma categoria por vez.
 * 4.  **CRUD de Processos**: Interface para administradores criarem, editarem e excluírem processos internos.
 */

'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, BookOpen, Search } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import type { Process } from '@/types'

/**
 * @constant categories
 * @description Lista fixa de categorias para classificar os processos da empresa.
 * O "porquê": Garante consistência na categorização e alimenta os filtros da UI.
 */
const categories = ['Locação', 'Cobrança', 'Manutenção', 'Documentação', 'Plano Fidelidade', 'Procedimentos Internos', 'Geral']

/**
 * @constant mockProcesses
 * @description Dados iniciais para simular os processos já cadastrados.
 * O "porquê": Permite o desenvolvimento da UI sem dependência do banco de dados,
 * populando a lista com exemplos realistas de perguntas e respostas.
 */
const mockProcesses: Process[] = [
  // ── LOCAÇÃO ──────────────────────────────────────────────────────────────
  {
    id: '1',
    question: 'Quais documentos são necessários para alugar uma moto?',
    answer:
      'O cliente precisa enviar:\n\n• CNH Digital (na categoria correta)\n• Comprovante de residência atualizado (mês atual ou anterior, em nome do cliente — conta de luz, água ou celular)\n• Print do histórico de corridas semanais (Uber, 99, iFood, Mercado Livre etc.) — se for trabalhar com aplicativos\n\nSe a locação não for para aplicativos, basta informar a finalidade do uso da moto.',
    category: 'Locação',
    order: 1,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '2',
    question: 'Preciso ter nome limpo no SPC/Serasa?',
    answer:
      'Não. A GoMoto não exige nome limpo. O único requisito obrigatório é possuir CNH válida na categoria correta.',
    category: 'Locação',
    order: 2,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '3',
    question: 'Como funciona o processo de locação do início ao fim?',
    answer:
      '1. Envio de documentos — Cliente envia CNH, comprovante de residência e histórico de corridas (se aplicável).\n\n2. Análise — Um dos gerentes analisa a documentação. Prazo máximo: 1 dia útil.\n\n3. Agendamento de visita — Com documentos aprovados, marcamos o dia e horário para o cliente ver a moto no estacionamento do Shopping de Santa Cruz.\n\n4. Assinatura do contrato — Emitimos o contrato digital, assinado via GOV.BR.\n\n5. Retirada da moto — No dia combinado, o cliente paga o caução (R$ 500,00 no Básico ou R$ 600,00 no Fidelidade) e retira a moto.\n\nObs.: clientes que adiantam a documentação têm prioridade na fila de atendimento.',
    category: 'Locação',
    order: 3,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '4',
    question: 'Posso emprestar ou sublocar a moto para outra pessoa?',
    answer:
      'Não. O uso é exclusivo do locatário. É proibido emprestar ou sublocar a moto.\n\nMulta por descumprimento:\n• Plano Básico: R$ 1.000,00\n• Plano Fidelidade: R$ 1.600,00\n\nAlém disso, se ocorrer sinistro (roubo, furto) com a moto cedida a terceiros e o seguro negar cobertura, o cliente fica obrigado a pagar o valor total da moto conforme a tabela FIPE.',
    category: 'Locação',
    order: 4,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '5',
    question: 'Posso viajar para fora do Rio de Janeiro com a moto?',
    answer:
      'Não, sem autorização prévia e por escrito da GoMoto.\n\nPenalidades:\n• Multa de R$ 1.000,00\n• Custos para trazer a moto de volta ao RJ\n• Pagamento de eventuais danos ocorridos, inclusive caso fortuito e força maior',
    category: 'Locação',
    order: 5,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '6',
    question: 'Posso colocar adesivos, fazer pintura ou instalar acessórios na moto?',
    answer:
      'Não, sem autorização prévia e por escrito da GoMoto.\n\nSe autorizado, a retirada das modificações e a recuperação da moto ao estado original são de responsabilidade do cliente.',
    category: 'Locação',
    order: 6,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '7',
    question: 'O que acontece se o cliente sofrer acidente sob efeito de álcool?',
    answer:
      'Se o cliente se envolver em sinistro estando sob efeito de álcool/entorpecentes, ou recusar o teste do bafômetro, e o seguro negar a cobertura, o cliente deve pagar o valor total da moto conforme a tabela FIPE.\n\nTambém arca com todos os custos de reboque e recuperação da moto junto ao depósito.',
    category: 'Locação',
    order: 7,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '8',
    question: 'O que fazer em caso de roubo ou furto da moto?',
    answer:
      '1. Avisar imediatamente à GoMoto\n2. Ir à delegacia mais próxima e registrar o Boletim de Ocorrência (BO)\n3. Comparecer à empresa de SINDICÂNCIA na data determinada pela GoMoto para apuração dos fatos\n\nAtenção: se o cliente não comparecer à sindicância e o seguro negar o pagamento, o cliente deverá pagar o valor total da moto conforme tabela FIPE vigente.\n\nCentral 24h para reboque: (21) 98225-0109',
    category: 'Locação',
    order: 8,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '9',
    question: 'Como funciona a devolução da moto?',
    answer:
      'A moto deve ser devolvida:\n• No local, data e hora indicados pela GoMoto\n• Limpa e com o mesmo nível de combustível da retirada\n• Em perfeito estado (vistoria por vídeo via WhatsApp antes da devolução)\n\nTaxa de lavagem:\n• Lavagem simples: R$ 40,00\n• Lavagem especial: R$ 60,00 + 1 diária por dia parada (limite de 10 diárias)\n\nMulta por atraso na devolução: R$ 100,00 por dia',
    category: 'Locação',
    order: 9,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '10',
    question: 'O que acontece se o cliente não devolver a moto após notificação?',
    answer:
      'A não devolução após notificação (por qualquer meio: WhatsApp, e-mail, ligação, SMS ou Telegram) configura CRIME DE APROPRIAÇÃO INDÉBITA, conforme o art. 168 do Código Penal Brasileiro.\n\nPena: reclusão de 1 a 4 anos, além de multa.',
    category: 'Locação',
    order: 10,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '11',
    question: 'A moto precisa passar por vistoria obrigatória?',
    answer:
      'Sim. A moto deve ser apresentada à GoMoto 2 (duas) vezes por mês, na data e local designados pela empresa.\n\nMulta por não comparecer: R$ 35,00 por dia de atraso.\n\nA não apresentação reiterada pode resultar em rescisão contratual.',
    category: 'Locação',
    order: 11,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  // ── COBRANÇA ─────────────────────────────────────────────────────────────
  {
    id: '12',
    question: 'Qual o valor do aluguel e quando devo pagar?',
    answer:
      'Plano Básico: R$ 350,00 por semana\nPlano Fidelidade: R$ 380,00 por semana\n\nPagamento: toda quarta-feira até as 23:59h via PIX.\nO comprovante deve ser enviado ao gerente no mesmo dia do pagamento.',
    category: 'Cobrança',
    order: 12,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '13',
    question: 'Quando começa a pagar o aluguel após retirar a moto?',
    answer:
      'O pagamento começa somente após a primeira semana de uso. Não é necessário pagar nada adiantado antes da retirada da moto.\n\nO caução (R$ 500 ou R$ 600) é pago no ato da retirada, mas não é aluguel — é um depósito de garantia.',
    category: 'Cobrança',
    order: 13,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '14',
    question: 'O que acontece se atrasar o pagamento?',
    answer:
      'Plano Básico:\n• Multa fixa de R$ 35,00 + R$ 35,00 por dia de atraso\n• Prazo máximo para pagar com juros: quinta-feira 23:59h\n• Não pagar até quinta = quebra de contrato → GoMoto pode recolher a moto\n\nPlano Fidelidade:\n• R$ 38,00 por dia de atraso\n• Prazo máximo: domingo 23:59h\n• Não pagar até domingo = perda do plano fidelidade + recolhimento da moto\n\nSe a dívida acumular mais de R$ 100,00 (Básico) ou R$ 140,00 (Fidelidade) sem quitar: moto deve ser entregue imediatamente. Multa por não entregar: R$ 350,00/dia.',
    category: 'Cobrança',
    order: 14,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '15',
    question: 'O que é o caução e como funciona?',
    answer:
      'O caução é um depósito de segurança pago no momento da retirada da moto. Não é aluguel nem receita da empresa — é um valor temporariamente retido como garantia contratual.\n\nValores:\n• Plano Básico: R$ 500,00\n• Plano Fidelidade: R$ 600,00\n\nFormas de pagamento: Pix, Boleto ou Cartão de Crédito (à vista ou parcelado).',
    category: 'Cobrança',
    order: 15,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '16',
    question: 'O caução é devolvido ao final do contrato?',
    answer:
      'Sim, em até 30 dias úteis após a devolução da moto, desde que:\n\n• A moto seja devolvida em perfeito estado (vistoria por vídeo)\n• Não haja aluguéis, multas de trânsito ou multas contratuais pendentes\n• Após realizadas as manutenções necessárias, se houver\n\nQuaisquer débitos ou danos são descontados antes da devolução. O cliente recebe o saldo restante.\n\nNo Plano Fidelidade, o caução só é devolvido após o cumprimento completo dos 24 meses.',
    category: 'Cobrança',
    order: 16,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '17',
    question: 'O que acontece se a moto for presa no depósito por infração do cliente?',
    answer:
      'O cliente arca com todos os custos para liberar a moto no depósito público.\n\nAlém disso, é cobrada uma multa contratual de R$ 35,00 por dia enquanto a moto estiver no depósito (lucro cessante).',
    category: 'Cobrança',
    order: 17,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '18',
    question: 'O que acontece se ocorrer um sinistro e a proteção veicular for acionada?',
    answer:
      'A Cota de Participação da Proteção Veicular é de R$ 1.200,00 e é 100% responsabilidade do cliente.\n\nO cliente também paga reboque, taxas e reparos quando não cobertos pela proteção veicular — independentemente de culpa, negligência ou imprudência.',
    category: 'Cobrança',
    order: 18,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  // ── MANUTENÇÃO ────────────────────────────────────────────────────────────
  {
    id: '19',
    question: 'Com que frequência devo trocar o óleo da moto?',
    answer:
      'A troca de óleo deve ser feita a cada 1.000 km rodados.\n\nÓleos recomendados para Honda CG 160 START:\n• Pro Honda 10W30\n• Mobil Super Moto Authentic 10W-30\n• Honda 10W30\n\nÓleos recomendados para Yamaha Fazer 150:\n• Yamalube 20W50 ou 10W40\n• Motul 5100 4T 10W-40\n• Castrol Power1 Racing 4T 10W-50',
    category: 'Manutenção',
    order: 19,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '20',
    question: 'Quem paga a troca de óleo?',
    answer:
      'Plano Básico: 50% GoMoto / 50% cliente. O valor de 50% é abatido diretamente na cobrança semanal após comprovação.\n\nPlano Fidelidade: 100% responsabilidade do cliente (assim como toda manutenção do plano fidelidade).\n\nPara comprovação (obrigatória nos dois planos — a GoMoto registra em sistema o km e data para controle da moto):\n• Foto do painel da moto mostrando a quilometragem\n• Nota fiscal da compra do óleo\n\nEnviar pelo grupo do WhatsApp. A não comprovação pode resultar em quebra de contrato.',
    category: 'Manutenção',
    order: 20,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '21',
    question: 'Quem paga as manutenções preventivas e gerais?',
    answer:
      'Plano Básico:\n• Manutenção preventiva e geral: 50% GoMoto / 50% cliente\n• Se constatado mau uso pelo cliente: 100% cliente\n• A GoMoto cobre: kit de tração (barulho anormal ou desgaste excessivo) e pneus (quando atingir o TWI)\n\nPlano Fidelidade:\n• Toda manutenção (preventiva e corretiva): 100% cliente\n• A GoMoto acompanha e registra em sistema quando foi feita e a quilometragem, pois a moto pertence à empresa\n• A GoMoto continua pagando: IPVA, licenciamento e seguro obrigatório\n\nEm ambos os planos: a GoMoto NÃO disponibiliza moto reserva.',
    category: 'Manutenção',
    order: 21,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '22',
    question: 'O que fazer se a moto apresentar problema mecânico ou elétrico?',
    answer:
      '1. Informar imediatamente à GoMoto\n2. Apresentar a moto à GoMoto no prazo de 24 horas para reparo na oficina indicada\n\nNão é permitido realizar reparos sem autorização prévia da GoMoto.\n\nCustos por dano causado por mau uso ou negligência do cliente (exemplo: bomba de combustível queimada por falta de gasolina):\n• Valor integral da peça\n• Custo da mão de obra\n• Custo do reboque\n• Demais valores inerentes ao reparo',
    category: 'Manutenção',
    order: 22,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '23',
    question: 'O cliente precisa verificar algum item periodicamente?',
    answer:
      'Sim. É obrigação do cliente verificar regularmente:\n\n• Calibragem dos pneus\n• Nível de óleo do motor\n• Nível do fluido de freio\n• Nível do líquido do sistema de arrefecimento\n• Temperatura do sistema de arrefecimento\n• Sistema de iluminação e sinalização\n\nQuaisquer danos por falta de verificação são de responsabilidade do cliente.',
    category: 'Manutenção',
    order: 23,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  // ── DOCUMENTAÇÃO ─────────────────────────────────────────────────────────
  {
    id: '24',
    question: 'Quem paga IPVA, licenciamento e seguro obrigatório da moto?',
    answer:
      'É responsabilidade da GoMoto o pagamento do IPVA, licenciamento e seguro obrigatório (DPVAT) da motocicleta durante toda a vigência do contrato.',
    category: 'Documentação',
    order: 24,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '25',
    question: 'Quem paga as multas de trânsito?',
    answer:
      'O cliente (locatário) — 100% de responsabilidade. As multas devem ser pagas imediatamente após aparecerem no sistema do DETRAN, independentemente de recurso ou transferência de pontos.\n\nA GoMoto indica o cliente como condutor/infrator responsável, conforme exige o art. 257 do CTB, transferindo os pontos para a CNH do cliente.',
    category: 'Documentação',
    order: 25,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '26',
    question: 'O que fazer se uma autuação de trânsito chegar em nome da GoMoto?',
    answer:
      'O cliente deve comparecer ao local e na data estipulados pela GoMoto para assinar o auto de infração, garantindo a transferência dos pontos para sua CNH.\n\nMulta por não comparecer no prazo: R$ 500,00.\n\nSe o cliente quiser recorrer da multa: o recurso é feito pelo próprio cliente diretamente no órgão autuador. Se o recurso for vitorioso, a GoMoto fornece cópia da guia de pagamento para que o cliente solicite o reembolso.',
    category: 'Documentação',
    order: 26,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '27',
    question: 'O cliente pode acionar a proteção veicular por conta própria?',
    answer:
      'Não. É proibido acionar o serviço de Proteção Veicular sem autorização expressa da GoMoto.\n\nPenalidade por descumprimento:\n• Multa de R$ 500,00\n• Obrigação de arcar com custos de reboque e transporte caso o serviço tenha atingido o limite mensal de acionamentos',
    category: 'Documentação',
    order: 27,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '28',
    question: 'O que acontece se o cliente perder a chave ou o documento da moto?',
    answer:
      'O cliente é responsável por todos os acessórios da moto em sua posse (chave de ignição, documento, etc.).\n\nEm caso de perda ou dano: o cliente arca com todos os custos de reposição. A GoMoto pode usar o valor do caução para compensação.',
    category: 'Documentação',
    order: 28,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  // ── PLANO FIDELIDADE ──────────────────────────────────────────────────────
  {
    id: '29',
    question: 'O que é o Plano Fidelidade?',
    answer:
      'É um contrato de locação com duração de 24 meses ininterruptos que inclui uma opção de compra da moto ao final do período.\n\nAo cumprir os 24 meses em dia, o cliente tem o direito de adquirir a propriedade da moto pelo preço vigente da tabela da GoMoto. A GoMoto assina o documento de transferência para que o cliente possa registrar a moto no DETRAN em seu nome.',
    category: 'Plano Fidelidade',
    order: 29,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '30',
    question: 'Qual a diferença entre o Plano Básico e o Plano Fidelidade?',
    answer:
      'Plano Básico:\n• R$ 350,00/semana\n• Prazo inicial: 3 meses (depois indeterminado)\n• Caução: R$ 500,00\n• Manutenção (preventiva e corretiva): 50% cliente / 50% GoMoto\n• IPVA, licenciamento, seguro: GoMoto\n• Sem opção de compra\n\nPlano Fidelidade:\n• R$ 380,00/semana\n• Prazo fixo: 24 meses ininterruptos\n• Caução: R$ 600,00\n• Toda manutenção (preventiva e corretiva): 100% cliente\n• IPVA, licenciamento, seguro: GoMoto\n• Com opção de compra ao final dos 24 meses',
    category: 'Plano Fidelidade',
    order: 30,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '31',
    question: 'Posso sair do Plano Fidelidade antes dos 24 meses?',
    answer:
      'O contrato de 24 meses é vinculante (princípio do pacta sunt servanda — força obrigatória dos contratos, art. 421 do Código Civil).\n\nRescisão antecipada gera multa de R$ 1.500,00.',
    category: 'Plano Fidelidade',
    order: 31,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '32',
    question: 'O que acontece se eu atrasar o pagamento no Plano Fidelidade?',
    answer:
      'Multa: R$ 38,00 por dia de atraso.\n\nPrazo máximo para pagar com juros: até domingo 23:59h da semana em atraso.\n\nSe não pagar até domingo:\n• Perde imediatamente o Plano Fidelidade (incluindo a opção de compra)\n• O contrato passa a valer as condições do Plano Básico\n• A GoMoto tem o direito de recolher a moto após as 96 horas previstas',
    category: 'Plano Fidelidade',
    order: 32,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '33',
    question: 'E se a moto for roubada ou furtada durante o Plano Fidelidade?',
    answer:
      'A GoMoto disponibilizará outra moto das mesmas características e ano em até 90 dias úteis após o registro do sinistro.\n\nO cliente deve:\n1. Avisar imediatamente à GoMoto\n2. Registrar BO na delegacia\n3. Comparecer à sindicância',
    category: 'Plano Fidelidade',
    order: 33,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '34',
    question: 'Posso transferir o direito de compra do Plano Fidelidade para outra pessoa?',
    answer:
      'Não. O direito de compra ao final dos 24 meses é intransferível — somente o locatário que assinou o contrato pode exercê-lo.',
    category: 'Plano Fidelidade',
    order: 34,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  // ── GERAL ─────────────────────────────────────────────────────────────────
  {
    id: '35',
    question: 'Onde fica a GoMoto e como funciona o atendimento?',
    answer:
      'A GoMoto é de Santa Cruz, Rio de Janeiro, e opera 100% online — sem loja física. Todo o atendimento, análise de documentos e assinatura de contrato são feitos digitalmente.\n\nA única etapa presencial é a entrega e devolução da moto, que ocorre no estacionamento do Shopping de Santa Cruz, sempre com um dos gerentes (Jamerson ou Gustavo) presentes.',
    category: 'Geral',
    order: 35,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '36',
    question: 'Quais motos estão disponíveis para locação?',
    answer:
      'Atualmente a GoMoto tem disponível a Honda CG 160 START 2024.\n\nA disponibilidade pode variar. Entre em contato para confirmar.',
    category: 'Geral',
    order: 36,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '37',
    question: 'Existe um número de emergência 24h?',
    answer:
      'Sim.\n\n• Central 24h para assistência de reboque: (21) 98225-0109\n• Setor de eventos: (21) 98225-9598',
    category: 'Geral',
    order: 37,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '38',
    question: 'Qual é o foro para resolução de disputas contratuais?',
    answer:
      'O foro eleito é o da cidade do Rio de Janeiro/RJ, ao qual as partes renunciam a qualquer outro, por mais privilegiado que seja.',
    category: 'Geral',
    order: 38,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '39',
    question: 'A GoMoto tem vínculo trabalhista com os locatários?',
    answer:
      'Não. Está expressamente pactuado que não existe qualquer vínculo trabalhista, subordinação ou controle típico de relações de emprego entre a GoMoto e o locatário. Não há obrigações previdenciárias nem encargos sociais.',
    category: 'Geral',
    order: 39,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  // ── LOCAÇÃO (complemento) ─────────────────────────────────────────────────
  {
    id: '40',
    question: 'Qual categoria de CNH é obrigatória para alugar uma moto?',
    answer:
      'O cliente deve possuir CNH válida na categoria A ou AB. A categoria B (somente carro) não é aceita.\n\nA CNH deve estar regular — sem suspensão ou cassação. O cliente declara no contrato que está corretamente habilitado conforme a legislação vigente.',
    category: 'Locação',
    order: 40,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '41',
    question: 'Familiares ou amigos podem pilotar a moto?',
    answer:
      'Não. O uso é exclusivo do locatário. Nenhuma outra pessoa pode pilotar a moto, nem familiares, salvo autorização inequívoca e expressa do locador (GoMoto).\n\nMulta por descumprimento:\n• Plano Básico: R$ 1.000,00\n• Plano Fidelidade: R$ 1.600,00\n\nSe ocorrer sinistro com terceiro pilotando e o seguro negar: cliente paga o valor FIPE da moto.',
    category: 'Locação',
    order: 41,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '42',
    question: 'A moto pode ser usada para qualquer finalidade, ou apenas para aplicativos?',
    answer:
      'Pode ser usada para qualquer finalidade legal — trabalho com aplicativos (Uber, 99, iFood etc.), uso pessoal, deslocamento, entre outros.\n\nO cliente apenas precisa informar a finalidade no momento da documentação. Se for para aplicativos, envia o histórico de corridas. Se for outra finalidade, basta informar.',
    category: 'Locação',
    order: 42,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '43',
    question: 'Preciso informar onde a moto vai ficar estacionada?',
    answer:
      'Sim. O cliente deve informar à GoMoto o endereço onde a moto habitualmente ficará estacionada.\n\nCaso estacione em local diferente do informado, o cliente será responsável por qualquer dano ou prejuízo à moto — inclusive casos fortuitos e força maior.',
    category: 'Locação',
    order: 43,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '44',
    question: 'O Plano Básico renova automaticamente após os 3 meses iniciais?',
    answer:
      'Sim. Após o período inicial de 3 meses, o contrato passa a vigorar por prazo indeterminado automaticamente — salvo manifestação contrária de qualquer das partes.\n\nO encerramento pode ocorrer por:\n• Resiliação voluntária (aviso de qualquer das partes)\n• Descumprimento contratual',
    category: 'Locação',
    order: 44,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '45',
    question: 'Posso encerrar o Plano Básico antes dos 3 meses iniciais?',
    answer:
      'Sim, mas há penalidade. A devolução antecipada antes do prazo mínimo de 3 meses gera multa de R$ 1.200,00 por quebra de contrato.\n\nApós os 3 meses, o contrato pode ser encerrado sem multa de rescisão (apenas seguir o processo de devolução normal).',
    category: 'Locação',
    order: 45,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '46',
    question: 'Como é feita a assinatura do contrato?',
    answer:
      'O contrato é totalmente digital. Após aprovação dos documentos e visita à moto, a GoMoto emite o contrato e envia ao cliente.\n\nA assinatura é realizada via GOV.BR — a plataforma do governo federal que garante validade jurídica à assinatura digital. O cliente precisa ter conta no GOV.BR (CPF + senha ou biometria).\n\nO contrato é firmado em 2 (duas) vias de igual teor.',
    category: 'Locação',
    order: 46,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  // ── COBRANÇA (complemento) ────────────────────────────────────────────────
  {
    id: '47',
    question: 'Quais gastos são 100% responsabilidade do cliente além do aluguel semanal?',
    answer:
      'O cliente arca exclusivamente com:\n\n• Combustível — em qualquer momento\n• Pedágios — durante o uso\n• Estacionamentos — durante o uso\n• Multas de trânsito — 100% do cliente\n• Troca de óleo — 50% no Básico / 100% no Fidelidade\n• Cota de participação em sinistros — R$ 1.200,00\n• Reparos por mau uso ou acidente\n• Reboque e taxas de depósito público\n• Reposição de chaves e documentos perdidos\n• Taxa de lavagem na devolução (se aplicável)\n\nObs.: se a GoMoto for cobrada por pedágio ou estacionamento gerado pelo cliente, o cliente reembolsa imediatamente.',
    category: 'Cobrança',
    order: 47,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '48',
    question: 'O caução pode ser parcelado?',
    answer:
      'Sim. O caução pode ser pago das seguintes formas:\n• PIX (à vista)\n• Boleto (à vista)\n• Cartão de crédito (à vista ou parcelado)\n\nIndependentemente da forma de pagamento, o valor deve estar integralizado até o ato de retirada da moto.',
    category: 'Cobrança',
    order: 48,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '49',
    question: 'O caução pode ser usado para pagar multas de trânsito?',
    answer:
      'Sim. Se o cliente não pagar a multa, a GoMoto pode usar o valor do caução para quitá-la.\n\nNesse caso, o cliente deve repor imediatamente o valor utilizado, para que o caução mantenha seu valor integral durante toda a vigência do contrato.\n\nO descumprimento dessa reposição pode acarretar rescisão contratual.',
    category: 'Cobrança',
    order: 49,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  // ── MANUTENÇÃO (complemento) ──────────────────────────────────────────────
  {
    id: '50',
    question: 'Existe assistência de reboque em caso de pane mecânica na rua?',
    answer:
      'Sim. A GoMoto disponibiliza uma central de reboque 24 horas para emergências.\n\nCentral 24h: (21) 98225-0109\n\nOs custos do reboque por pane mecânica são divididos conforme o plano (50/50 no Básico, 100% cliente no Fidelidade), desde que não seja dano por mau uso. Dano por mau uso (ex.: bomba queimada por falta de combustível) é 100% responsabilidade do cliente.',
    category: 'Manutenção',
    order: 50,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '51',
    question: 'A GoMoto indeniza o cliente por perda de ganhos se a moto quebrar?',
    answer:
      'Não. Está expressamente previsto no contrato que a GoMoto não se responsabiliza por:\n• Lucros cessantes ou perda de ganhos financeiros do cliente\n• Quaisquer prejuízos por impossibilidade de uso da moto por falha mecânica\n• Despesas médicas, hospitalares ou jurídicas do cliente\n\nA GoMoto também não disponibiliza moto reserva.',
    category: 'Manutenção',
    order: 51,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  // ── DOCUMENTAÇÃO (complemento) ────────────────────────────────────────────
  {
    id: '52',
    question: 'O contrato digital tem validade jurídica?',
    answer:
      'Sim. O contrato é assinado via GOV.BR, plataforma oficial do governo federal, que confere validade jurídica plena à assinatura eletrônica.\n\nOs valores, despesas e encargos da locação constituem dívidas líquidas e certas, exigíveis à vista e passíveis de cobrança executiva.\n\nNotificações e comunicações podem ser feitas por qualquer meio eletrônico (WhatsApp, e-mail) ou físico com AR.',
    category: 'Documentação',
    order: 52,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '53',
    question: 'O cliente autoriza o uso de sua imagem pela GoMoto ao assinar o contrato?',
    answer:
      'Sim. Ao assinar o contrato, o cliente autoriza expressamente a GoMoto a coletar, usar e divulgar sua imagem para fins de cadastro, defesa e promoção/propaganda da empresa.\n\nO cliente renuncia ao direito de pleitear indenização por esse uso.',
    category: 'Documentação',
    order: 53,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  // ── PLANO FIDELIDADE (complemento) ────────────────────────────────────────
  {
    id: '54',
    question: 'É obrigatório comprar a moto ao final dos 24 meses do Plano Fidelidade?',
    answer:
      'Não. A compra é um DIREITO do cliente, não uma obrigação. Ao cumprir os 24 meses em dia, o cliente tem a opção de comprar — mas pode optar por não comprar.\n\nSe o cliente decidir não comprar, a situação do contrato deve ser alinhada com a GoMoto (encerramento ou continuidade em outro formato).',
    category: 'Plano Fidelidade',
    order: 54,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '55',
    question: 'Como é definido o preço de compra da moto ao final do Plano Fidelidade?',
    answer:
      'O preço de compra é definido pela tabela da GoMoto vigente à época do término do contrato.\n\nImportante: o inadimplemento de qualquer parcela semanal durante os 24 meses cancela automaticamente o direito à opção de compra — mesmo que o cliente regularize o pagamento depois.',
    category: 'Plano Fidelidade',
    order: 55,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '56',
    question: 'Posso migrar do Plano Básico para o Plano Fidelidade depois de já estar alugando?',
    answer:
      'Esta migração depende de negociação direta com a GoMoto e não está prevista automaticamente no contrato.\n\nPara solicitar, o cliente deve entrar em contato com um dos gerentes (Jamerson ou Gustavo). Um novo contrato de Plano Fidelidade precisará ser emitido e assinado.',
    category: 'Plano Fidelidade',
    order: 56,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  // ── PROCEDIMENTOS INTERNOS ────────────────────────────────────────────────
  {
    id: '57',
    question: 'Como aprovar um novo cliente? (checklist de análise)',
    answer:
      'Checklist de aprovação:\n\n1. CNH Digital — verificar: nome, validade, categoria (A ou AB), sem suspensão\n2. Comprovante de residência — verificar: em nome do cliente, mês atual ou anterior, RJ\n3. Histórico de corridas — se for para apps: verificar regularidade e atividade recente\n4. Análise de risco — verificar comportamento no contato, inconsistências nos documentos\n5. Aprovação — comunicar ao cliente e agendar visita\n6. Visita — apresentar a moto, tirar dúvidas, confirmar intenção\n7. Emitir contrato via GOV.BR e aguardar assinatura\n8. Retirada — confirmar pagamento do caução antes de entregar a moto\n\nPrazo de análise: máximo 1 dia útil.',
    category: 'Procedimentos Internos',
    order: 57,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '58',
    question: 'Como agir quando um cliente atrasa o pagamento?',
    answer:
      'Fluxo de cobrança por atraso:\n\nQuarta-feira (vencimento):\n• Enviar mensagem de cobrança ao cliente\n• Aguardar confirmação do pagamento e recebimento do comprovante\n\nQuinta-feira (Plano Básico) / Domingo (Plano Fidelidade):\n• Se ainda sem pagamento: notificar formalmente sobre quebra de contrato\n• Registrar a notificação (WhatsApp, e-mail ou ligação)\n• Se dívida > R$ 100 (Básico) ou > R$ 140 (Fidelidade): acionar recolhimento da moto\n\nApós o prazo limite sem pagamento:\n• Acionar gerente para recolhimento imediato da moto\n• Multa de R$ 350,00/dia se cliente não entregar após notificação\n• Se não devolver: providências legais por Apropriação Indébita (art. 168 CP)',
    category: 'Procedimentos Internos',
    order: 58,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '59',
    question: 'Como proceder em caso de acidente com a moto?',
    answer:
      'Ao ser comunicado de um acidente:\n\n1. Verificar se o cliente está seguro (prioridade)\n2. Orientar o cliente a acionar o reboque se necessário: (21) 98225-0109\n3. Se houver terceiros: orientar o cliente a registrar BO\n4. Verificar se há suspeita de embriaguez (altera radicalmente as responsabilidades)\n5. Acionar o seguro/proteção veicular da GoMoto (NÃO autorizar o cliente a acionar diretamente)\n6. Agendar sindicância para apuração dos fatos\n7. Registrar no sistema: data, km, descrição do ocorrido, responsabilidades\n8. Definir quem arca com os custos com base no contrato:\n   • Protegido pela proteção veicular: cota de participação R$ 1.200 (cliente)\n   • Mau uso: 100% cliente\n   • Embriaguez + seguro negado: cliente paga FIPE da moto',
    category: 'Procedimentos Internos',
    order: 59,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '60',
    question: 'Como fazer a vistoria obrigatória da moto?',
    answer:
      'Vistoria ocorre 2x por mês, no local e data definidos pela GoMoto (Shopping de Santa Cruz).\n\nO que verificar:\n• Carroceria: riscos, amassados, peças faltando\n• Pneus: desgaste, calibragem, TWI\n• Óleo: nível e data/km da última troca\n• Freios: funcionamento\n• Iluminação: faróis, pisca, luz de freio\n• Documentos: CRLV dentro da moto\n• Quilometragem: registrar no sistema\n• Condição geral de limpeza\n\nRegistrar tudo no sistema com data e km. Tirar fotos para documentação.\n\nCliente que não comparecer: multa de R$ 35,00/dia — notificar imediatamente.',
    category: 'Procedimentos Internos',
    order: 60,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '61',
    question: 'Como proceder quando cliente quer encerrar o contrato?',
    answer:
      'Antes de 3 meses (Plano Básico):\n• Informar multa de R$ 1.200,00 por rescisão antecipada\n• Confirmar intenção do cliente\n• Agendar devolução da moto\n\nApós 3 meses (Plano Básico):\n• Não há multa de rescisão\n• Agendar devolução da moto\n\nPlano Fidelidade (qualquer momento antes de 24 meses):\n• Informar multa de R$ 1.500,00\n• Confirmar intenção\n\nProcesso de devolução:\n1. Agendar horário no Shopping de Santa Cruz com o gerente\n2. Realizar vistoria completa com vídeo (WhatsApp)\n3. Verificar pendências: aluguéis, multas, danos\n4. Calcular valor a descontar do caução\n5. Devolver saldo do caução em até 30 dias úteis',
    category: 'Procedimentos Internos',
    order: 61,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '62',
    question: 'Como funciona a fila de atendimento para novos clientes?',
    answer:
      'A fila segue a ordem de chegada das mensagens.\n\nPrioridade para clientes que:\n1. Enviaram a documentação completa\n2. Confirmaram interesse e agendaram visita\n\nCliente que só pergunta e não envia documentação: mantido na fila normal, sem prioridade.\n\nQuando a moto está disponível:\n• Verificar próximo da fila com documentação aprovada\n• Contatar e agendar visita\n• Formalizar contrato e retirada\n\nRegistrar no sistema todos os interessados na fila com status: Contato Inicial, Documentação Enviada, Aprovado, Agendado, Concluído.',
    category: 'Procedimentos Internos',
    order: 62,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '63',
    question: 'O que é a sindicância e quando acionar?',
    answer:
      'A sindicância é o processo de apuração de fatos após um sinistro grave (roubo, furto ou colisão).\n\nQuando acionar:\n• Roubo ou furto da moto — obrigatório\n• Colisão com danos relevantes\n• Qualquer sinistro onde o seguro/proteção veicular precise ser acionado\n\nProcesso:\n1. Cliente registra o BO\n2. GoMoto define a data de comparecimento à empresa de sindicância\n3. Cliente deve comparecer na data marcada\n4. Se cliente não comparecer e seguro negar: cliente paga o valor FIPE da moto\n\nA sindicância é feita pela empresa de proteção veicular parceira da GoMoto.',
    category: 'Procedimentos Internos',
    order: 63,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '64',
    question: 'Como registrar e tratar uma multa de trânsito?',
    answer:
      'Quando chega uma autuação em nome da GoMoto:\n\n1. Verificar no sistema qual cliente estava com a moto na data/hora da infração\n2. Notificar o cliente imediatamente sobre a multa e o valor\n3. Orientar o cliente a pagar a multa diretamente no DETRAN o quanto antes\n4. Agendar comparecimento do cliente para assinar o auto de infração (transferência de pontos para a CNH dele)\n   → Prazo conforme determinado pelo órgão autuador\n   → Multa por não comparecer: R$ 500,00\n5. Se cliente não pagar: GoMoto pode usar o caução para quitar (cliente repõe imediatamente)\n6. Registrar no sistema: multa, valor, data, status do pagamento\n\nSe o cliente quiser recorrer: ele mesmo recorre no órgão autuador. Se ganhar, GoMoto fornece cópia da guia para reembolso.',
    category: 'Procedimentos Internos',
    order: 64,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  // ── GERAL (complemento) ───────────────────────────────────────────────────
  {
    id: '65',
    question: 'A GoMoto atende clientes de qualquer bairro ou cidade do Rio de Janeiro?',
    answer:
      'Sim. A GoMoto atende clientes de qualquer bairro do Rio de Janeiro e região.\n\nRestrição: a moto não pode sair do estado do RJ sem autorização expressa. O atendimento (análise, contrato) é 100% online, então o cliente não precisa estar em Santa Cruz para iniciar o processo.\n\nA entrega e devolução são feitas presencialmente no Shopping de Santa Cruz, sempre com agendamento.',
    category: 'Geral',
    order: 65,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '66',
    question: 'Como entrar em contato com a GoMoto?',
    answer:
      'Todo o atendimento é feito via WhatsApp.\n\nGerentes responsáveis:\n• Jamerson\n• Gustavo\n\nCentral de emergência 24h (reboque): (21) 98225-0109\nSetor de eventos: (21) 98225-9598\n\nA GoMoto não possui loja física aberta ao público — o ponto de entrega/devolução no Shopping de Santa Cruz é somente por agendamento.',
    category: 'Geral',
    order: 66,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: '67',
    question: 'Quanto tempo leva para conseguir uma moto após o primeiro contato?',
    answer:
      'O processo é ágil:\n• Análise de documentos: até 1 dia útil\n• Agendamento de visita: feito logo após aprovação\n• Retirada da moto: no dia da visita (se contrato assinado e caução pago)\n\nClientes que enviam a documentação completa logo no primeiro contato têm prioridade e tendem a ser atendidos mais rápido.\n\nSe houver fila de espera (todas as motos alocadas), o cliente é colocado na lista e acionado assim que houver disponibilidade.',
    category: 'Geral',
    order: 67,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
]

/**
 * @constant categoryBadgeVariant
 * @description Mapeamento de estilos visuais (cores do Badge) para cada categoria.
 * O "porquê": Centraliza a lógica de estilização, tornando fácil alterar a cor
 * associada a uma categoria em um único local.
 */
const categoryBadgeVariant: Record<string, 'success' | 'info' | 'warning' | 'muted' | 'brand' | 'danger'> = {
  Locação: 'brand',
  Cobrança: 'warning',
  Manutenção: 'info',
  Documentação: 'success',
  'Plano Fidelidade': 'danger',
  'Procedimentos Internos': 'info',
  Geral: 'muted',
}

/**
 * @constant defaultForm
 * @description Estado inicial para o formulário de criação/edição de processos.
 * O "porquê": Garante que o modal de "Adicionar Processo" sempre abra com os campos limpos.
 */
const defaultForm = { question: '', answer: '', category: 'Geral' }

/**
 * @component ProcessesPage
 * @description Componente principal que renderiza a lista de processos em formato de acordeão.
 */
export default function ProcessesPage() {
  /**
   * @state processes
   * @description Armazena a lista completa de processos. É a fonte da verdade para a UI.
   */
  const [processes, setProcesses] = useState<Process[]>(mockProcesses)
  /**
   * @state expandedId
   * @description Guarda o ID do processo que está atualmente expandido, mostrando a resposta. Se `null`, todos estão fechados.
   */
  const [expandedId, setExpandedId] = useState<string | null>(null)
  /**
   * @state categoryFilter
   * @description Armazena o valor do filtro de categoria selecionado pelo usuário.
   */
  const [categoryFilter, setCategoryFilter] = useState('')
  /**
   * @state isModalOpen
   * @description Controla a visibilidade do modal de cadastro/edição.
   */
  const [isModalOpen, setIsModalOpen] = useState(false)
  /**
   * @state editingProcess
   * @description Guarda o objeto do processo em edição. Se `null`, o modal está em modo de "criação".
   */
  const [editingProcess, setEditingProcess] = useState<Process | null>(null)
  /**
   * @state form
   * @description Armazena os valores atuais do formulário no modal.
   */
  const [form, setForm] = useState(defaultForm)
  /**
   * @state search
   * @description Armazena o texto digitado pelo usuário no campo de busca livre.
   */
  const [search, setSearch] = useState('')

  /**
   * @const filteredProcesses
   * @description Aplica o filtro de categoria e o filtro de busca textual à lista de processos.
   * O "porquê": Combina dois critérios de filtragem para que o usuário possa encontrar
   * processos tanto pela categoria quanto por palavras-chave na pergunta ou resposta.
   */
  const filteredProcesses = processes.filter((p) => {
    const matchesCategory = !categoryFilter || p.category === categoryFilter
    const matchesSearch =
      !search ||
      p.question.toLowerCase().includes(search.toLowerCase()) ||
      p.answer.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  /**
   * @const groupedProcesses
   * @description Organiza os processos filtrados em um objeto onde a chave é a categoria.
   * O "porquê": Facilita a renderização da UI em blocos agrupados por categoria,
   * ao invés de uma lista única desordenada.
   */
  const groupedProcesses = categories.reduce<Record<string, Process[]>>((acc, cat) => {
    const items = filteredProcesses.filter((p) => p.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {})

  /**
   * @function handleSubmit
   * @description Processa o envio do formulário, salvando um novo processo ou atualizando um existente.
   * @param e - O evento do formulário, para prevenir o recarregamento da página.
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingProcess) {
      // Lógica de Atualização
      setProcesses((prev) =>
        prev.map((p) =>
          p.id === editingProcess.id
            ? { ...p, question: form.question, answer: form.answer, category: form.category, updated_at: new Date().toISOString() }
            : p
        )
      )
    } else {
      // Lógica de Criação
      const newProcess: Process = {
        id: String(Date.now()),
        question: form.question,
        answer: form.answer,
        category: form.category,
        order: processes.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setProcesses((prev) => [...prev, newProcess])
    }
    // Reseta o estado e fecha o modal
    setForm(defaultForm)
    setEditingProcess(null)
    setIsModalOpen(false)
  }

  /**
   * @function handleEdit
   * @description Prepara o modal para edição, carregando os dados do processo selecionado.
   * @param process - O objeto do processo a ser editado.
   */
  function handleEdit(process: Process) {
    setEditingProcess(process)
    setForm({ question: process.question, answer: process.answer, category: process.category })
    setIsModalOpen(true)
  }

  /**
   * @function handleDelete
   * @description Remove um processo da lista.
   * O "porquê": A remoção é feita de forma otimista na UI, filtrando o array de estado.
   * Em uma aplicação real, aqui seria chamada uma API para deletar no banco.
   * @param id - O ID do processo a ser removido.
   */
  function handleDelete(id: string) {
    setProcesses((prev) => prev.filter((p) => p.id !== id))
  }

  /**
   * @function handleOpenModal
   * @description Abre o modal em modo de "criação".
   */
  function handleOpenModal() {
    setEditingProcess(null)
    setForm(defaultForm)
    setIsModalOpen(true)
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Cabeçalho da página com título, contador e botão de ação principal. */}
      <Header
        title="Processos da Empresa"
        subtitle={`${processes.length} processos cadastrados`}
        actions={
          <Button onClick={handleOpenModal}>
            <Plus className="w-4 h-4" />
            Adicionar Processo
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        {/* SEÇÃO DE FILTROS: Busca textual e filtro por categoria. */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Input de busca livre */}
          <div className="flex items-center gap-2 px-4 bg-[#323232] border-2 border-[#323232] rounded-full h-10 w-64 focus-within:border-[#474747]">
            <Search className="w-4 h-4 text-[#9e9e9e] flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar pergunta ou resposta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[#f5f5f5] text-[13px] outline-none placeholder:text-[#616161]"
            />
          </div>
          {/* Divisor visual */}
          <div className="w-px h-5 bg-[#474747]" />
          <BookOpen className="w-4 h-4 text-[#9e9e9e]" />
          <div className="flex gap-2 flex-wrap border-b border-[#323232]">
            {/* Botões de filtro rápido, incluindo "Todas". */}
            {[{ value: '', label: 'Todas' }, ...categories.map((c) => ({ value: c, label: c }))].map(
              (opt) => (
                <button
                  key={opt.value}
                  onClick={() => setCategoryFilter(opt.value)}
                  className={`px-3 py-2 text-[13px] font-medium transition-all duration-150 border-b-2 ${
                    categoryFilter === opt.value
                      ? 'border-[#BAFF1A] text-[#f5f5f5]'
                      : 'border-transparent text-[#9e9e9e] hover:text-[#f5f5f5]'
                  }`}
                >
                  {opt.label}
                </button>
              )
            )}
          </div>
        </div>

        {/* LISTAGEM AGRUPADA: Itera sobre as categorias que possuem itens. */}
        {Object.entries(groupedProcesses).map(([category, items]) => (
          <div key={category} className="space-y-2">
            {/* Cabeçalho de cada Categoria */}
            <div className="flex items-center gap-2 py-1">
              <Badge variant={categoryBadgeVariant[category] ?? 'muted'}>{category}</Badge>
              <span className="text-[12px] text-[#9e9e9e]">{items.length} processo(s)</span>
            </div>

            {/* Itens da Categoria em formato de Acordeão */}
            <div className="space-y-1">
              {items.map((process) => (
                <div
                  key={process.id}
                  className="bg-[#202020] border border-[#474747] rounded-2xl overflow-hidden transition-colors hover:border-[#474747]"
                >
                  {/* Botão de Expansão que contém a pergunta. */}
                  <button
                    className="w-full min-h-[56px] flex items-center justify-between gap-4 p-4 text-left"
                    onClick={() =>
                      setExpandedId((prev) => (prev === process.id ? null : process.id))
                    }
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      {process.category === 'Procedimentos Internos' && (
                        <span className="mt-0.5 flex-shrink-0 px-2 py-0.5 rounded-full text-[12px] font-medium bg-[#2d0363] text-[#a880ff]">
                          Interno
                        </span>
                      )}
                      <p className="font-medium text-[#f5f5f5] text-[13px] leading-relaxed">
                        {process.question}
                      </p>
                    </div>
                    
                    {/* Ações e Indicador de Status do Acordeão */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="secondary" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handleEdit(process) }} title="Editar processo">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="danger" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handleDelete(process.id) }} title="Excluir processo">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {/* Ícone de Seta que muda conforme o estado expandido. */}
                      {expandedId === process.id ? (
                        <ChevronUp className="w-4 h-4 text-[#9e9e9e]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#9e9e9e]" />
                      )}
                    </div>
                  </button>

                  {/* Conteúdo Expansível (A resposta para a pergunta). */}
                  {expandedId === process.id && (
                    <div className="px-4 pb-4 border-t border-[#474747] pt-3">
                      <p className="text-[13px] text-[#9e9e9e] leading-relaxed whitespace-pre-wrap">{process.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* FEEDBACK DE LISTA VAZIA: Exibido se nenhum processo corresponder ao filtro ou busca. */}
        {filteredProcesses.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <BookOpen className="w-12 h-12 text-[#616161] mx-auto mb-3" />
              <p className="text-[#9e9e9e]">
                {search ? `Nenhum resultado para "${search}"` : 'Nenhum processo encontrado'}
              </p>
              {search && (
                <button onClick={() => setSearch('')} className="mt-2 text-[12px] text-[#BAFF1A] hover:underline">
                  Limpar busca
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Interface para Adicionar ou Editar um Processo */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProcess ? 'Editar Processo' : 'Adicionar Novo Processo'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Categoria"
            options={categories.map((c) => ({ value: c, label: c }))}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <Input
            label="Pergunta"
            placeholder="Ex: Como funciona o processo de locação?"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            required
          />
          <Textarea
            label="Resposta"
            placeholder="Descreva o processo de forma clara e objetiva..."
            rows={5}
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            required
          />
          
          {/* Ações do Modal */}
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingProcess ? (
                <>
                  <Edit2 className="w-4 h-4" />
                  Salvar Alterações
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Adicionar Processo
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
