# TDEE計算ツール

このフォルダは、そのまま Vercel に公開しやすい Vite + React + TypeScript 構成です。

## ローカル起動

```bash
npm install
npm run dev
```

## 本番ビルド

```bash
npm run build
```

## Vercel公開

1. このフォルダを GitHub にアップロード
2. Vercel でそのリポジトリを Import
3. Framework Preset は Vite のままでOK
4. Build Command は `npm run build`
5. Output Directory は `dist`
6. Deploy

## メモ

元のコードは shadcn/ui のエイリアスやコンポーネントに依存していたため、そのままだと単体公開しにくい状態でした。
この版では依存を減らして、公開しやすい形に整理しています。
