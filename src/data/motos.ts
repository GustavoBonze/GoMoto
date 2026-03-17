/**
 * @file motos.ts
 * @description Repositório de dados estáticos (Mock Data) das motocicletas da frota GoMoto.
 * Este arquivo serve como uma base de dados temporária para o desenvolvimento do front-end
 * enquanto a integração completa com o Supabase está em andamento.
 * Contém informações técnicas reais das motos da empresa.
 */

/**
 * @interface MotorcycleData
 * @description Estrutura simplificada para representação de dados de uma motocicleta no mock.
 * Todas as chaves foram traduzidas do português para o inglês seguindo o padrão do sistema.
 */
export interface MotorcycleData {
  /** @property id - Identificador único do registro no mock. */
  id: string;
  /** @property license_plate - Placa de identificação da moto. */
  license_plate: string;
  /** @property model - Modelo comercial do veículo. */
  model: string;
  /** @property make - Marca fabricante da motocicleta. */
  make: string;
  /** @property year - Ano de fabricação e modelo. */
  year: string;
  /** @property color - Cor oficial registrada no documento. */
  color: string;
  /** @property renavam - Número do registro nacional (opcional no mock). */
  renavam?: string;
  /** @property chassis - Número de identificação do chassi (opcional no mock). */
  chassis?: string;
}

/**
 * @constant ALL_MOTORCYCLES
 * @description Coleção de dados reais da frota atual da GoMoto.
 * Esta constante será substituída por uma consulta ao banco de dados Supabase em produção.
 */
export const ALL_MOTORCYCLES: MotorcycleData[] = [
  { 
    id: '1', 
    license_plate: 'AAA0A00', 
    model: 'HONDA/CG 160 START',     
    make: 'HONDA',  
    year: '21/22', 
    color: 'VERMELHO', 
    renavam: '00000000000',  
    chassis: '9C2JC0000XX000000' 
  },
  { 
    id: '2', 
    license_plate: 'BBB1B11', 
    model: 'YAMAHA/YS150 FAZER SED', 
    make: 'YAMAHA', 
    year: '23/24', 
    color: 'CINZA',    
    renavam: '11111111111',  
    chassis: '9C6RG00000XX00000' 
  },
  { 
    id: '3', 
    license_plate: 'CCC2C22', 
    model: 'HONDA/CG 160 CARGO',     
    make: 'HONDA',  
    year: '23/24', 
    color: 'BRANCO',  
    renavam: '22222222222',  
    chassis: '9C2JH0000XX000000' 
  },
  { 
    id: '4', 
    license_plate: 'DDD3D33', 
    model: 'HONDA/CG 160 START',     
    make: 'HONDA',  
    year: '24/25', 
    color: 'PRETO',   
    renavam: '33333333333',  
    chassis: '9C2JC0000YY000000' 
  },
];

/**
 * @section LOCAL STORAGE KEYS
 * @description Chaves utilizadas para persistência de dados no navegador (LocalStorage).
 * Essas chaves espelham o comportamento das tabelas do banco de dados Supabase
 * para manter a consistência da lógica de negócio durante a prototipagem.
 */

/** @constant LS_ALLOCATED_MOTORCYCLES - Chave para armazenar o estado de alocação das motos. */
export const LS_ALLOCATED_MOTORCYCLES = 'gomoto_motos_alocadas';

/** @constant LS_QUEUE - Chave para gerenciar a fila de espera de interessados. */
export const LS_QUEUE = 'gomoto_fila';

/** @constant LS_NEW_CONTRACTS - Chave para rastrear contratos recém-criados localmente. */
export const LS_NEW_CONTRACTS = 'gomoto_new_contracts';
