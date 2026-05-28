drop policy if exists "Allow anon read psychologists during development" on psychologists;
drop policy if exists "Allow anon write psychologists during development" on psychologists;
drop policy if exists "Allow anon read patients during development" on patients;
drop policy if exists "Allow anon write patients during development" on patients;
drop policy if exists "Allow anon read sessions during development" on sessions;
drop policy if exists "Allow anon write sessions during development" on sessions;
drop policy if exists "Allow anon read payments during development" on payments;
drop policy if exists "Allow anon write payments during development" on payments;

create policy "Allow anon read psychologists during development"
on psychologists for select
to anon
using (true);

create policy "Allow anon write psychologists during development"
on psychologists for all
to anon
using (true)
with check (true);

create policy "Allow anon read patients during development"
on patients for select
to anon
using (true);

create policy "Allow anon write patients during development"
on patients for all
to anon
using (true)
with check (true);

create policy "Allow anon read sessions during development"
on sessions for select
to anon
using (true);

create policy "Allow anon write sessions during development"
on sessions for all
to anon
using (true)
with check (true);

create policy "Allow anon read payments during development"
on payments for select
to anon
using (true);

create policy "Allow anon write payments during development"
on payments for all
to anon
using (true)
with check (true);
