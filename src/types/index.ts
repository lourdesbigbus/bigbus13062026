export type UserRole = 'admin' | 'cliente';

export interface Profile {
  id: string;
  nome: string;
  telefone: string | null;
  email: string;
  role: UserRole;
  criado_em: string;
}

export type TipoVeiculo = 'van' | 'onibus' | 'carro' | 'motor';
export type StatusVeiculo = 'disponivel' | 'vendido';

export interface Veiculo {
  id: string;
  titulo: string;
  descricao: string | null;
  preco: number;
  tipo: TipoVeiculo;
  marca: string;
  modelo: string;
  ano_fabricacao: number;
  ano_modelo: number;
  quilometragem: number;
  combustivel: string;
  status: StatusVeiculo;
  criado_em: string;
  anunciado_por: string | null;
  
  // Relações que podem ser carregadas
  fotos?: FotoVeiculo[];
  anunciante?: Profile | null;
}

export interface FotoVeiculo {
  id: string;
  veiculo_id: string;
  url_foto: string;
  criado_em: string;
}

export type TipoProposta = 'compra' | 'troca' | 'financiamento';

export interface Proposta {
  id: string;
  veiculo_id: string;
  nome_cliente: string;
  telefone_cliente: string;
  tipo_proposta: TipoProposta;
  mensagem: string | null;
  criada_em: string;
  
  // Relações que podem ser carregadas
  veiculo?: Veiculo;
}

export interface FiltrosBusca {
  tipo?: TipoVeiculo | '';
  marca?: string;
  anoMin?: number;
  anoMax?: number;
  precoMin?: number;
  precoMax?: number;
}
