'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Veiculo, TipoVeiculo, StatusVeiculo } from '@/types';
import { Save, Upload, X, AlertCircle, CheckCircle2, Loader2, Plus, Image as ImageIcon } from 'lucide-react';

interface VehicleFormProps {
  veiculoParaEditar?: Veiculo | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function VehicleForm({ veiculoParaEditar, onSuccess, onCancel }: VehicleFormProps) {
  const isEditing = !!veiculoParaEditar;

  // Estados dos campos do formulário
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [tipo, setTipo] = useState<TipoVeiculo>('van');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anoFabricacao, setAnoFabricacao] = useState('');
  const [anoModelo, setAnoModelo] = useState('');
  const [quilometragem, setQuilometragem] = useState('');
  const [combustivel, setCombustivel] = useState('Diesel');
  const [status, setStatus] = useState<StatusVeiculo>('disponivel');

  // Imagens locais selecionadas para upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // URLs de imagens existentes do veículo (em modo edição)
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  
  // Status de carregamento e feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Carregar dados se for modo edição
  useEffect(() => {
    if (veiculoParaEditar) {
      setTitulo(veiculoParaEditar.titulo);
      setDescricao(veiculoParaEditar.descricao || '');
      setPreco(veiculoParaEditar.preco.toString());
      setTipo(veiculoParaEditar.tipo);
      setMarca(veiculoParaEditar.marca);
      setModelo(veiculoParaEditar.modelo);
      setAnoFabricacao(veiculoParaEditar.ano_fabricacao.toString());
      setAnoModelo(veiculoParaEditar.ano_modelo.toString());
      setQuilometragem(veiculoParaEditar.quilometragem.toString());
      setCombustivel(veiculoParaEditar.combustivel);
      setStatus(veiculoParaEditar.status);
      
      // Carregar fotos existentes
      if (veiculoParaEditar.fotos) {
        setExistingPhotos(veiculoParaEditar.fotos.map(f => f.url_foto));
      }
    }
  }, [veiculoParaEditar]);

  // Manipular seleção de imagens
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...filesArray]);
    }
  };

  // Remover imagem selecionada (local)
  const removeSelectedImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Remover foto já salva (edição)
  const removeExistingPhoto = (url: string) => {
    setExistingPhotos((prev) => prev.filter((photoUrl) => photoUrl !== url));
  };

  // Upload de imagens no Supabase Storage
  const uploadImages = async (veiculoId: string): Promise<string[]> => {
    const urls: string[] = [];

    for (const file of imageFiles) {
      // Gerar nome único de arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${veiculoId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `fotos/${fileName}`;

      // Enviar arquivo para o bucket 'veiculos'
      const { error: uploadError } = await supabase.storage
        .from('veiculos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Erro no upload da foto ${file.name}: ${uploadError.message}`);
      }

      // Obter URL pública do arquivo enviado
      const { data: { publicUrl } } = supabase.storage
        .from('veiculos')
        .getPublicUrl(filePath);

      urls.push(publicUrl);
    }

    return urls;
  };

  // Envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Obter id do usuário autenticado (anunciante)
      const { data: { user } } = await supabase.auth.getUser();
      
      const veiculoData = {
        titulo,
        descricao,
        preco: parseFloat(preco),
        tipo,
        marca,
        modelo,
        ano_fabricacao: parseInt(anoFabricacao),
        ano_modelo: parseInt(anoModelo),
        quilometragem: parseInt(quilometragem),
        combustivel,
        status,
        anunciado_por: user?.id || null,
      };

      let veiculoId = '';

      if (isEditing && veiculoParaEditar) {
        veiculoId = veiculoParaEditar.id;
        
        // Atualizar veículo existente
        const { error: updateError } = await supabase
          .from('veiculos')
          .update(veiculoData)
          .eq('id', veiculoId);

        if (updateError) throw updateError;

        // Remover fotos antigas que foram desmarcadas
        const fotosDeletadas = veiculoParaEditar.fotos
          ? veiculoParaEditar.fotos.filter(f => !existingPhotos.includes(f.url_foto))
          : [];

        if (fotosDeletadas.length > 0) {
          const idsParaDeletar = fotosDeletadas.map(f => f.id);
          const { error: deletePhotosError } = await supabase
            .from('fotos_veiculo')
            .delete()
            .in('id', idsParaDeletar);

          if (deletePhotosError) throw deletePhotosError;
        }
      } else {
        // Criar novo veículo
        const { data: insertData, error: insertError } = await supabase
          .from('veiculos')
          .insert(veiculoData)
          .select()
          .single();

        if (insertError) throw insertError;
        veiculoId = insertData.id;
      }

      // Upload das novas fotos selecionadas
      const novasUrls = await uploadImages(veiculoId);

      // Inserir registros de novas fotos na tabela fotos_veiculo
      if (novasUrls.length > 0) {
        const fotosData = novasUrls.map(url => ({
          veiculo_id: veiculoId,
          url_foto: url
        }));

        const { error: insertPhotosError } = await supabase
          .from('fotos_veiculo')
          .insert(fotosData);

        if (insertPhotosError) throw insertPhotosError;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Erro ao salvar veículo:', err);
      setError(err.message || 'Erro ao processar a solicitação. Verifique os campos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card text-card-foreground p-6 sm:p-8 rounded-2xl border border-border shadow-md max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          {isEditing ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
        </h2>
        <button
          onClick={onCancel}
          className="text-xs font-semibold text-slate-400 hover:text-foreground border border-border px-3 py-1.5 rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="text-sm font-semibold">Veículo salvo com sucesso! Redirecionando...</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl flex items-start space-x-2 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col space-y-1 sm:col-span-2">
            <label htmlFor="titulo" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Título do Anúncio *
            </label>
            <input
              id="titulo"
              type="text"
              required
              placeholder="Ex: Sprinter 415 CDI Executiva Escolar"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="bg-background border border-border px-3 py-2.5 rounded-lg text-sm"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="marca" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Marca *
            </label>
            <input
              id="marca"
              type="text"
              required
              placeholder="Ex: Mercedes-Benz"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="bg-background border border-border px-3 py-2.5 rounded-lg text-sm"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="modelo" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Modelo *
            </label>
            <input
              id="modelo"
              type="text"
              required
              placeholder="Ex: Sprinter 415 Executiva"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              className="bg-background border border-border px-3 py-2.5 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Ficha Técnica e Valores */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col space-y-1 col-span-2">
            <label htmlFor="preco" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Preço (R$) *
            </label>
            <input
              id="preco"
              type="number"
              required
              placeholder="120000"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              className="bg-background border border-border px-3 py-2.5 rounded-lg text-sm"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="tipo" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tipo *
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoVeiculo)}
              className="bg-background border border-border px-3 py-2.5 rounded-lg text-sm"
            >
              <option value="van">Van Comercial</option>
              <option value="onibus">Ônibus</option>
              <option value="carro">Carro</option>
              <option value="motor">Motor Pesado</option>
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="status" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Status *
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusVeiculo)}
              className="bg-background border border-border px-3 py-2.5 rounded-lg text-sm font-semibold"
            >
              <option value="disponivel">Disponível</option>
              <option value="vendido">Vendido</option>
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="anoFabricacao" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ano Fab. *
            </label>
            <input
              id="anoFabricacao"
              type="number"
              required
              placeholder="2018"
              value={anoFabricacao}
              onChange={(e) => setAnoFabricacao(e.target.value)}
              className="bg-background border border-border px-3 py-2.5 rounded-lg text-sm text-center"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="anoModelo" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ano Mod. *
            </label>
            <input
              id="anoModelo"
              type="number"
              required
              placeholder="2019"
              value={anoModelo}
              onChange={(e) => setAnoModelo(e.target.value)}
              className="bg-background border border-border px-3 py-2.5 rounded-lg text-sm text-center"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="quilometragem" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              KM *
            </label>
            <input
              id="quilometragem"
              type="number"
              required
              placeholder="120000"
              value={quilometragem}
              onChange={(e) => setQuilometragem(e.target.value)}
              className="bg-background border border-border px-3 py-2.5 rounded-lg text-sm"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="combustivel" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Combustível *
            </label>
            <input
              id="combustivel"
              type="text"
              required
              placeholder="Ex: Diesel"
              value={combustivel}
              onChange={(e) => setCombustivel(e.target.value)}
              className="bg-background border border-border px-3 py-2.5 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Descrição */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="descricao" className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Descrição do Veículo
          </label>
          <textarea
            id="descricao"
            rows={4}
            placeholder="Descreva detalhes como estofado, ar-condicionado, revisões feitas, documentação, etc."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="bg-background border border-border px-3 py-2.5 rounded-lg text-sm resize-none"
          />
        </div>

        {/* Upload de Fotos */}
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Fotos do Veículo
          </label>
          
          {/* Fotos já salvas (Edição) */}
          {isEditing && existingPhotos.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500">Fotos Salvas</span>
              <div className="flex flex-wrap gap-3">
                {existingPhotos.map((url, i) => (
                  <div key={i} className="relative h-20 aspect-video rounded-lg overflow-hidden border border-border">
                    <img src={url} alt="Foto veículo" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(url)}
                      className="absolute top-1 right-1 bg-red-600/90 text-white rounded-full p-1 hover:bg-red-700 transition-colors shadow"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Grid Area */}
          <div className="border-2 border-dashed border-border hover:border-accent rounded-xl p-6 transition-colors flex flex-col items-center justify-center cursor-pointer relative bg-slate-500/5 group">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="h-8 w-8 text-slate-400 group-hover:text-accent transition-colors mb-2" />
            <span className="text-sm font-semibold text-foreground">Clique para adicionar fotos</span>
            <span className="text-xs text-slate-400 mt-1">PNG, JPG ou WEBP de até 5MB</span>
          </div>

          {/* Selecionadas Locais */}
          {imageFiles.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500">Novas Fotos Selecionadas</span>
              <div className="flex flex-wrap gap-3">
                {imageFiles.map((file, i) => {
                  const url = URL.createObjectURL(file);
                  return (
                    <div key={i} className="relative h-20 aspect-video rounded-lg overflow-hidden border border-border">
                      <img src={url} alt="Nova foto selecionada" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeSelectedImage(i)}
                        className="absolute top-1 right-1 bg-primary/95 text-white rounded-full p-1 hover:bg-accent hover:text-primary transition-colors shadow"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Ações do Formulário */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border border-border text-slate-500 hover:bg-slate-500/5 font-semibold text-sm transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 bg-accent text-primary font-bold hover:bg-accent-hover disabled:opacity-50 px-6 py-2.5 rounded-lg text-sm shadow transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Salvar Veículo</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
