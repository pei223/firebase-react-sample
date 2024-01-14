## react-firebase-sample
Reactでfirebase関連のサンプルを作る。

- firestore
  - https://firebase.google.com/docs/firestore?hl=ja
- firebase authentication
  - https://firebase.google.com/docs/auth?hl=ja


## 必要なツール
- npm/node
- firebase CLI


## 機能
- 認証
- Githubでの認証
- MFA設定・削除・ログイン
- 記事登録・更新・削除
- 記事検索・ソート
  - ユーザーIDでのみ
- プロフィール情報表示・更新
- ユーザー情報表示


## その他技術的なところで試したこと
- インデックス登録が必要な検索
- トランザクション
- 構成のCLIデプロイ


## 改善
- MFA周りのreCAPTCHAを一度閉じたらリロードしないと動かない問題
  - 趣旨から少し外れてるからどっちでもいい
- MFA登録・削除周りで再ログイン促す必要あるができてない
- 諸々コードが汚い
