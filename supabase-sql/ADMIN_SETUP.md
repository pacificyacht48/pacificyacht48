# Yönetici kurulumu

1. Supabase Authentication bölümünde yalnızca yönetici olacak kullanıcıyı oluşturun.
2. Kullanıcının UUID değerini kopyalayın.
3. SQL Editor içinde aşağıdaki komutu kendi UUID değerinizle çalıştırın:

```sql
insert into public.admin_users (user_id)
values ('KULLANICI-UUID-BURAYA')
on conflict (user_id) do nothing;
```

Admin ekranı normal sitede bağlantı olarak gösterilmez. Adresin sonuna `#admin` ekleyerek açılır. Yetkisi olmayan Supabase kullanıcıları giriş yapsa bile RLS tarafından engellenir ve oturumları kapatılır.

