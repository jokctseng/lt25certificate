# Google Forms + Apps Script 證書自動產生與驗證系統
Combine form to generate certificates with a simple verification mechanism.

這是一個基於 **Google 表單 + Google Apps Script + Google Slides + Gmail** 打造的線上證書自動發送與驗證工具。  
能夠自動產生 PDF 證書、Email 寄送、QR Code 驗證、發證記錄保存，不需強大的Coding技術也能搞定喔～

---

## ✨ 功能特色

- ✅ Google 表單送出後自動產生個人化證書
- ✅ 證書內容包含姓名、發證日期、編號
- ✅ 產出 PDF 並以 Gmail 附件方式寄出
- ✅ Email 內嵌 QR Code 可掃碼驗證證書
- ✅ 提供簡單驗證頁面，顯示姓名、活動、編號、發證日
- ✅ 所有資料自動記錄於 Google Sheet，無需外部伺服器

---

## 📁 專案結構

| 檔案 | 說明 |
|------|------|
| `Code.gs` | 主程式邏輯，處理證書產生、發信、驗證查詢等功能 |
| `index.html` | 證書驗證頁面前端，使用者輸入識別碼後查詢結果 |

---

## 🛠️ 使用步驟

### 1. 建立 Google 表單
- 至少包含欄位：「姓名」、「Email」
- 請留意符合個資法規範，說明個資使用範圍與時間
- 請以「說明」取代複雜的題目名稱，題目名稱請保持「姓名」、「Email」如圖
  
![](/Sample_form.png)


### 2. 建立對應的 Google 試算表
- 表單送出連接至 Google Sheets
- 新增工作表"record"，作為發證紀錄用，欄位依序為：`姓名`	`Email`	`CertID`	`Date`	`URL`

### 3. 準備 Slides 證書模板
- 使用文字佔位符：`{{name}}`, `{{date}}`, `{{id}}`
- 如果你就是2025青年好政的團隊，請直接[建立這份簡報的副本](https://docs.google.com/presentation/d/1SuZodeeqhWdcz-GbO8b-RcNl4_0Vnbv1WCYETEvxTxk/edit?usp=sharing)到自己或團隊的雲端硬碟，請將團隊名稱與活動名稱編輯為自己場次版本，其餘欄位可不更改

### 4. 開啟 Apps Script 編輯器
- 新增 Google Apps Script 專案
- 貼上 `Code.gs` 與 `index.html`
- 請記得根據自己活動需求設定變數：
  ```js
  const SLIDE_TEMPLATE_ID = '你的簡報模板 ID';
  const FOLDER_ID = '儲存 PDF 的資料夾 ID';
  const VERIFICATION_PAGE_URL = '驗證頁網址（部署後複製）';
  const EVENT_NAME = '你的活動名稱';


### 5. 設定觸發條件
在Google Apps Script左方會看到一個碼表圖案，點擊並新增一個觸發條件，設定如下
- 選擇你要執行的功能：`onFormSubmit`  // 這表示與提交表單時的動作有關
- 在表單送出時自動執行設定觸發條件
在Google Apps Script左方會看到一個碼表圖案，點擊並新增一個觸發條件，設定如下
- 選擇你要執行的功能：`onFormSubmit`  // 這表示與提交表單時的動作有關
- 在表單送出時自動執行



### 6.部署為網頁應用程式
在Google Apps Script畫面右上方會看到一個藍色按鈕「部署」，點擊新增部署要求並依照下列說明設定：
- 選取類型：`網頁應用程式`
- 新增說明：選填，可簡單說明此版本/工具的功用，如：寄發證書與驗證
- 網頁應用程式執行身分： `我`
- 誰可以存取：`任何人`
- 複製網頁應用程式網址，貼於`Code.gs`的`VERIFICATION_PAGE_URL`

![](/Sample_verify.jpg)  

---

## ✉️ Email 示意
Email 會以 HTML 發送，內含：

* 使用者姓名
* 發證日期與證書編號
* QR Code 圖片
* PDF 證書附件（自動生成）

![](/Sample_mail.jpg)  

您可以透過Code.js中的HTML的語法設置來更改Email的樣式。
另外，PDF證書也會同步存於雲端硬碟中，但因應證書而生的臨時簡報副本不會保留。

---

## 🔐 未來延伸功能建議
本專案基於 Google Apps Script 設計，強調無需部署伺服器，適合快速導入與較無技術背景的使用者操作，但若您有更進一步的安全性或專業部署需求，可考慮下列功能。

### 直接在證書上加入驗證QR Code
* 由於 Google Apps Script（GAS）對 Google Slides 的圖像操作 API 功能有限至，插入圖片（insertImage(blob, x, y)) 需非常精確地傳入像素座標與 blob 型別
* GAS 無法完整控制圖層堆疊、絕對座標或自動對位（Slides 沒有像 HTML 那樣的布局引擎），圖片若需浮於文字之上或與設計元素完美貼合，可能需要固定模板尺寸與手動試誤
* 因此目前選擇只在 Email 中嵌入 QR Code，並在證書放入編號，保持系統穩定與低維護需求
* 若您需要 在 PDF 證書中直接嵌入可掃描 QR Code，可考慮Python + ReportLab / PIL / PyMuPDF或Node.js + PDFKit + qrcode，但這些方案可能需評估後端建置、儲存機制或評估寄送方式


### 其他提升安全性的措施
* 若您有更高安全需求，可評估使用 HMAC 編碼 QR Code URL 防止猜測，或將驗證資料部署至 Firebase / Supabase 等無伺部署環境等
* 發送加密後的證書 PDF 並提供驗證碼解鎖，或在 Slides 上加入防偽浮水印或識別暗碼（如：團隊縮寫圖層）
* 可限制驗證查詢次數避免被濫用或攻擊

---

## ❤️ 貢獻

歡迎 fork、star ⭐️ 本專案，若有修正方案或是實作上述版本，歡迎Fork後PR

---

## 🛡️ 授權說明

本專案使用 [GNU AGPLv3](https://www.gnu.org/licenses/agpl-3.0.html) 授權。  
您可以自由使用、修改、商業部署，但 **若您提供他人使用（例如：雲端服務、SaaS），必須將所有原始碼與修改內容一併開源**。

若需取得其他授權方式，請與作者聯繫。
