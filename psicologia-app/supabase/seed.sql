insert into psychologists (name, crp, email, phone, specialties, status)
values
  ('Dra. Maria Santos', '06/123456', 'maria@clinica.com', '(11) 99999-0001', array['TCC', 'Ansiedade', 'Depressão'], 'ativo'),
  ('Dr. João Oliveira', '06/654321', 'joao@clinica.com', '(11) 99999-0002', array['Psicanálise', 'Trauma', 'Luto'], 'ativo'),
  ('Dra. Ana Costa', '06/111222', 'ana@clinica.com', '(11) 99999-0003', array['Infantil', 'Família', 'Casal'], 'ativo')
on conflict (crp) do nothing;

insert into patients (
  name,
  email,
  phone,
  cpf,
  birth_date,
  gender,
  address,
  emergency_contact,
  emergency_phone,
  status,
  plan,
  psychologist_id,
  start_date,
  notes,
  diagnosis,
  cid
)
select
  'Carlos Alberto Silva',
  'carlos@email.com',
  '(11) 98765-4321',
  '123.456.789-00',
  '1990-05-15',
  'Masculino',
  'Rua das Flores, 123 - São Paulo/SP',
  'Maria Silva',
  '(11) 91234-5678',
  'ativo',
  'mensal',
  p.id,
  '2024-01-10',
  'Paciente com quadro de ansiedade generalizada',
  'Transtorno de Ansiedade Generalizada',
  'F41.1'
from psychologists p
where p.crp = '06/123456'
on conflict (cpf) do nothing;

insert into patients (
  name, email, phone, cpf, birth_date, gender, address, emergency_contact, emergency_phone, status, plan, psychologist_id, start_date, notes, diagnosis, cid
)
select
  'Fernanda Oliveira', 'fernanda@email.com', '(11) 97654-3210', '987.654.321-00', '1985-08-22', 'Feminino', 'Av. Paulista, 456 - São Paulo/SP', 'Pedro Oliveira', '(11) 92345-6789', 'ativo', 'anual', p.id, '2023-06-15', 'Acompanhamento por depressão moderada', 'Episódio Depressivo Moderado', 'F32.1'
from psychologists p
where p.crp = '06/654321'
on conflict (cpf) do nothing;

insert into patients (
  name, email, phone, cpf, birth_date, gender, address, emergency_contact, emergency_phone, status, plan, psychologist_id, start_date, notes, diagnosis, cid
)
select
  'Roberto Mendes', 'roberto@email.com', '(11) 96543-2100', '456.789.123-00', '1978-12-03', 'Masculino', 'Rua Augusta, 789 - São Paulo/SP', 'Ana Mendes', '(11) 93456-7890', 'ativo', 'mensal', p.id, '2024-03-01', 'Paciente em processo de luto', 'Reação ao Luto', 'F43.2'
from psychologists p
where p.crp = '06/123456'
on conflict (cpf) do nothing;
