# 符翻堂 — 麻雀点数計算トレーニング

スマホのホーム画面から全画面・オフラインで起動できるPWA。GitHub Pagesにそのまま置ける構成です。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `index.html` | アプリ本体（単一ファイル完結・学習履歴は localStorage に保存） |
| `manifest.json` | アプリ名・アイコン・全画面表示の定義 |
| `sw.js` | Service Worker。初回アクセス後は通信なしで動作 |
| `icon-192.png` / `icon-512.png` | ホーム画面・スプラッシュ用アイコン |
| `apple-touch-icon.png` | iOS用アイコン |
| `engine.js` | 点数・符計算エンジン（Node用モジュール版。`index.html` 内の `Engine` と同一ロジック） |
| `test.js` | エンジンの自動テスト158件。`node test.js` で実行 |

`engine.js` と `test.js` はアプリの動作には不要です。開発用に置いておくだけで構いません。

## GitHub Pages で公開する

```bash
git init
git add .
git commit -m "符翻堂 初回公開"
git branch -M main
git remote add origin https://github.com/<ユーザー名>/<リポジトリ名>.git
git push -u origin main
```

その後、リポジトリの **Settings → Pages** で
Source を **Deploy from a branch**、Branch を **main / (root)** に設定。
1〜2分で `https://<ユーザー名>.github.io/<リポジトリ名>/` が公開されます。

**リポジトリは Public にしてください。** Private だと GitHub Pages は有料プランが必要です。

## ホーム画面に追加する

- **iPhone（Safari）** — 共有ボタン → 「ホーム画面に追加」
- **Android（Chrome）** — メニュー → 「アプリをインストール」

追加後はアドレスバーのない全画面で起動し、機内モードでも動きます。

## 更新するとき

`index.html` を変更したら、**`sw.js` の `CACHE` の版数を必ず上げてください**（`fuhando-v1` → `fuhando-v2`）。
上げ忘れると、端末にキャッシュされた古い版が表示され続けます。
HTMLは network-first で取得するため、通常はアプリを開き直せば新しい版になります。

## 学習履歴について

`localStorage` に端末内保存。サーバーには何も送信しません。
そのため **端末ごと・ブラウザごとに別の記録**になり、Safariの履歴削除やプライベートモードでは消えます。
複数端末で共有したい場合は、Firebase や Supabase などの外部保存が必要になります。

## 実装済みの機能

- **点数クイズ** — Lv.1〜5（Lv.5は15秒制限）。回答後に「符×翻 → 基本点 → ×4/×6 → 切り上げ → 点数」を段階表示
- **符計算** — STEP1「パーツ1個の符」、STEP2「符コインを積み上げて切り上げ」
- **フラッシュ** — 60秒アタック（子のロン固定の反射練習）
- **暗記表** — 親子×ロンツモ切替、流れで覚えるチェーン、満貫ライン一覧、計算根拠
- **成績** — 正解率・平均回答時間・最高連続正解・累計問題数・弱点分析・苦手復習

## 点数計算エンジンの仕様

```js
calculateScore({ playerType:'dealer'|'child', winType:'ron'|'tsumo',
                 han, fu, yakumanMultiplier?, kiriageMangan?, honba? })
// → { basePoints, rank, rankKey, total, fromDealer, fromChild, fromRonPlayer, notation, capped }
```

- 基本点 = 符 × 2^(翻+2)、2000以上は満貫に頭打ち
- 5翻=満貫 / 6-7=跳満 / 8-10=倍満 / 11-12=三倍満 / 13以上=数え役満
- 支払いは**各支払いごとに**100点単位切り上げ（ツモの親分・子分を個別に切り上げ）
- `kiriageMangan` で切り上げ満貫（30符4翻・60符3翻）を任意に有効化
- 20符はツモのみ、25符（七対子）は2翻以上、として出題側でバリデート

```js
calculateFu({ menzen, winType, melds:[{type,terminal,open,label}],
              head:'yakuhai'|'other', wait, pinfu?, chiitoitsu? })
// → { fu, rawFu, parts:[{label,fu}] }
```

## ルールの前提

日本式リーチ麻雀。連風牌の雀頭は2符/4符で流派が分かれるため出題から除外。切り上げ満貫は既定でオフ。

## 次にやること

1. 役の学習モード（役名・翻数・食い下がり・○×クイズ）
2. 手牌を表示する実戦形式（牌姿 → 役判定 → 翻 → 符 → 点数）
3. 実績・レベル進行の可視化
