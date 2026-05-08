-- Reposiciona o pipeline para advocacia.
-- Renomeia os estágios existentes e ajusta o default da coluna.
--
-- Mapeamento:
--   novo_lead         -> prospeccao
--   contato_feito     -> contato_inicial
--   negociacao        -> reuniao
--   proposta_enviada  -> proposta
--   fechado_ganhou    -> cliente_ativo
--   perdido           -> arquivado

update leads set stage = case stage
  when 'novo_lead'         then 'prospeccao'
  when 'contato_feito'     then 'contato_inicial'
  when 'negociacao'        then 'reuniao'
  when 'proposta_enviada'  then 'proposta'
  when 'fechado_ganhou'    then 'cliente_ativo'
  when 'perdido'           then 'arquivado'
  else stage
end
where stage in (
  'novo_lead', 'contato_feito', 'negociacao',
  'proposta_enviada', 'fechado_ganhou', 'perdido'
);

alter table leads alter column stage set default 'prospeccao';
