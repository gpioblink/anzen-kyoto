# anzen-kyoto

## Instllation

### GASの初期設定

```
yarn install

: GASの設定
yarn clasp login
yarn clasp create

mv appscript.json src/
```

その後、`.clasp.json`内の`rootDir`を`src`に変更(フルパスじゃなくてOK)。

お好みで`appscript.json`の`timeZone`を`Asia/Tokyo`に変更。

### OPENAIの用意

OpenAIのサイトからAPIキーを発行し、クレジットカードで残高を追加してください。とりあえず最低入金額の5ドルで十分。オートリチャージオフ推薦。

あくまで従量課金の方なので、間違って月額のサブスクプラン契約しないように注意！

### LINE API

LINE BOTの公式サイトからAPIキーを発行。

### ログ保存用スプレッドシートの用意

http://spreadsheet.new から適当なスプレッドシートを作成。
**`Sheet1`と`examples`の名前のシートをそれぞれ追加** してください。

あとでシートのURLを.envファイルに入れます。

### .envファイルの用意(開発用)

プロジェクトルートに以下の内容を記載した`.env`を作成してください。

```
LINEAPI_TOKEN="jhno********"
REPLY_URL="https://api.line.me/v2/bot/message/reply"
OPENAI_APIKEY="sk-DE************"
TALK_LOG_SHEET_URL="https://docs.google.com/spreadsheets/d/************"
OPENAI_COMPLETIONS_URL="https://api.openai.com/v1/chat/completions"
```

### GASの初期設定

GASで`プロジェクトの設定 -> スクリプトプロパティ`に上で用意した環境変数を1件ずつコピペ。

## デプロイ方法

### GASにファイルを置く

```
yarn clasp push
```

### GASのサイト上でデプロイする

`デプロイ -> 新しいデプロイ -> ウェブアプリ -> デプロイ` で、出てきたURLをLINE BOTのエンドポイントに設定。

## 参考

- GAS + Typescript のいい感じのビルド環境を整える
  - https://zenn.dev/terass_dev/articles/a39ab8d0128eb1
