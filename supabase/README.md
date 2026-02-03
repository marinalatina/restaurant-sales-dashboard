# Supabase セットアップ

1. [Supabase](https://supabase.com/dashboard) でプロジェクトを作成する。
2. **SQL Editor** で `migrations/20250203000000_initial_sales_tables.sql` の内容を実行する。
3. **Settings > API** で Project URL と anon public key をコピーする。
4. プロジェクトルートに `.env.local` を作成し、`.env.local.example` を参考に以下を設定する。

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

5. `npm run dev` でアプリを起動する。CSV アップロード・目標の保存が Supabase に永続化される。

環境変数が未設定の場合は、これまで通りメモリ上のみで動作し、永続化は行われない。
