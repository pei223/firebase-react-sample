## firebaseのsetup
ここに従う
https://firebase.google.com/docs/firestore/quickstart?hl=ja

web用の設定値はここ
https://support.google.com/firebase/answer/7015592?hl=ja#web&zippy=%2C%E3%81%93%E3%81%AE%E8%A8%98%E4%BA%8B%E3%81%AE%E5%86%85%E5%AE%B9

## firebase構成の管理
firebase CLIを使用
https://firebase.google.com/docs/rules/manage-deploy?hl=ja

terraformはまだbetaらしい
https://registry.terraform.io/providers/hashicorp/google-beta/latest/docs/resources/firebase_project

### setup
firestoreの構成ファイルをフェッチ
```
firebase login
firebase init firestore
(Use an existing projectを選択)
```

### deploy
```
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```


## firestoreの概念的なやつ
### 概要
NoSQL、階層

### collection/document
コレクションはフォルダ、ドキュメントはファイルみたいなもの

### セキュリティルール
データ検証やアクセス制御ができるスクリプト。
https://firebase.google.com/docs/firestore/security/get-started?hl=ja


## RDBとの比較
### 検索機能
inや等号とかは使えるがLIKEが使えない.
https://firebase.google.com/docs/firestore/query-data/queries?hl=ja

また、検索とソートに別のキーを使用する場合は複合インデックスの登録が必要
https://firebase.google.com/docs/firestore/query-data/index-overview?hl=ja

また、`DELETE FROM table WHERE ...;`相当のものもない,

### joinはできるか
できない.
NoSQLの戦略として正規化しなかったり冗長にデータを持つとかしたほうが良さそう.

### transaction
ある
https://firebase.google.com/docs/firestore/manage-data/transactions?hl=ja

### インデックス
TODO そんなにまだしっかり調べられてない.

指定しないとソートや検索ができないことがある
https://firebase.google.com/docs/firestore/query-data/index-overview?hl=ja


## その他懸念
### ドキュメントの型はどうするか
とりあえず妥協でasにしている。
firebaseのAPI自体にはできなそうなので、ajvとかzodでチェック・変換してあげると良さそう。


### APIキーは晒していいか
操作や参照はバックエンドも介することもできるが、参照のリアルタイム性を損なったりするのでフロントエンドから操作できた方がよく、APIキーは晒すことになる。
非公開ではないらしいので良さそう。
https://firebase.google.com/support/guides/security-checklist?hl=ja#understand_api_keys

参照系以外はバックエンドでも良さそう。

セキュリティはセキュリティルールで担保する必要があるはず。
https://firebase.google.com/support/guides/security-checklist?hl=ja#security_rules


## OAuthのセットアップ
クライアントID, secret, コールバックURL設定するだけ
https://docs.github.com/ja/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app

## MFAセットアップ
https://firebase.google.com/docs/auth/web/multi-factor?hl=ja#enabling_multi-factor_authentication