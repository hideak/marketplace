-- Enable insert, update, and delete for everyone (for now)
create policy "Items can be created by everyone."
  on items for insert
  with check ( true );

create policy "Items can be updated by everyone."
  on items for update
  using ( true );

create policy "Items can be deleted by everyone."
  on items for delete
  using ( true );
