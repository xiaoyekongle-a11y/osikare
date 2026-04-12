# 🌸 オシカレ

推しのライブ・リリースをカレンダーでまとめて管理できるPWAアプリ。

## 技術スタック

- **Next.js 15** (App Router)
- **Supabase** (Auth / PostgreSQL / RLS)
- **Tailwind CSS v4**
- **Vercel** (ホスティング)
- **iTunes Search API** (アーティスト検索)
- **date-fns** (日付操作)

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/xiaoyekongle-a11y/osikare.git
cd osikare
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. Supabase プロジェクト作成

1. [supabase.com](https://supabase.com) でプロジェクトを作成
2. `supabase/schema.sql` の内容を **SQL Editor** で実行
3. **Authentication > Providers** で Google OAuth を有効化

### 4. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集して Supabase の URL と ANON KEY を設定：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 5. 開発サーバー起動

```bash
pnpm dev
```

http://localhost:3000 で確認。

## Vercel デプロイ

1. GitHubリポジトリをVercelと連携
2. Vercelの環境変数に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定
3. `main` ブランチにpushすると自動デプロイ

## Google OAuth 設定

1. [Google Cloud Console](https://console.cloud.google.com) でOAuthクライアントを作成
2. 承認済みリダイレクトURIに追加：
   - `https://xxxx.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (開発用)
3. SupabaseダッシュボードのGoogle Providerに Client ID / Secret を設定

## アイコン

`public/icons/` に以下を配置：
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)

## ディレクトリ構成

```
src/
├── app/
│   ├── (auth)/login/     # ログイン画面
│   ├── (app)/            # 認証済みページ
│   │   ├── home/         # ホーム
│   │   ├── calendar/     # カレンダー
│   │   ├── oshi/         # 推し管理
│   │   └── settings/     # 設定
│   └── auth/callback/    # OAuth コールバック
├── components/
│   └── BottomNav.tsx
└── lib/
    ├── supabase/          # Supabaseクライアント
    └── types.ts           # 型定義
```
