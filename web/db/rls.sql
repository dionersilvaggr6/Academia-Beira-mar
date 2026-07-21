-- Fase 2A — Row Level Security (RLS) para a área de aluno.
-- Aplicar no Supabase (SQL Editor) ou via a connection string do projeto.

alter table profiles enable row level security;
alter table treinos enable row level security;
alter table exercicios enable row level security;

-- Função segura: o utilizador atual é instrutor?
create or replace function is_instrutor() returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists(
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'instrutor'
  );
$$;

-- profiles: cada um lê o seu; instrutor lê/gere todos; cada um atualiza o seu
drop policy if exists profiles_read on profiles;
create policy profiles_read on profiles for select
  using (id = auth.uid() or is_instrutor());

drop policy if exists profiles_instrutor_write on profiles;
create policy profiles_instrutor_write on profiles for all
  using (is_instrutor()) with check (is_instrutor());

drop policy if exists profiles_self_update on profiles;
create policy profiles_self_update on profiles for update
  using (id = auth.uid());

-- treinos: aluno lê os seus; instrutor gere todos
drop policy if exists treinos_read on treinos;
create policy treinos_read on treinos for select
  using (aluno_id = auth.uid() or is_instrutor());

drop policy if exists treinos_instrutor_all on treinos;
create policy treinos_instrutor_all on treinos for all
  using (is_instrutor()) with check (is_instrutor());

-- exercicios: seguem o dono do treino
drop policy if exists exercicios_read on exercicios;
create policy exercicios_read on exercicios for select
  using (
    is_instrutor()
    or exists(select 1 from treinos t where t.id = treino_id and t.aluno_id = auth.uid())
  );

drop policy if exists exercicios_instrutor_all on exercicios;
create policy exercicios_instrutor_all on exercicios for all
  using (is_instrutor()) with check (is_instrutor());
