// 設定區
const SLIDE_TEMPLATE_ID = 'YOUR_SLIDE_ID'; //自己雲端硬碟的簡報ID
const FOLDER_ID = 'YOUR_FOLDER_ID'; // 儲存PDF的資料夾ID
const VERIFICATION_PAGE_URL = 'YOUR_APP_URL'; // QR code 導向的驗證頁
const EVENT_NAME = "青年好政Let's Talk｜測試場次"; // 主辦團隊可自行修改活動名稱

// 表單送出時觸發
function onFormSubmit(e) {
  const name = e.namedValues['姓名']?.[0] || '參與者';
  const email = e.namedValues['Email']?.[0];
  if (!email) return;

  const today = new Date();
  const formattedDate = Utilities.formatDate(today, Session.getScriptTimeZone(), "yyyy年MM月dd日");
  const random = Math.floor(1000 + Math.random() * 9000);
  const certId = `CERT-${Utilities.formatDate(today, Session.getScriptTimeZone(), "yyyyMMdd")}-${random}`;

  // 1. 複製簡報產生證書
  const template = DriveApp.getFileById(SLIDE_TEMPLATE_ID);
  const copy = template.makeCopy(`${name}_certificate`);
  const presentation = SlidesApp.openById(copy.getId());
  const slides = presentation.getSlides();
  for (const slide of slides) {
    slide.replaceAllText('{{name}}', name);
    slide.replaceAllText('{{date}}', formattedDate);
    slide.replaceAllText('{{id}}', certId);
  }
  presentation.saveAndClose();

  // 2. 匯出 PDF
  const pdf = DriveApp.getFileById(copy.getId()).getAs('application/pdf');
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const savedFile = folder.createFile(pdf);
  savedFile.setName(`${name}_certificate.pdf`);

  // 3. 準備 QR Code 連結
  const qrUrl = `${VERIFICATION_PAGE_URL}?cert=${certId}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;

  // 4. 寄送 Email（可修改HTML語法調整樣式）
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h2 style="color: #2a4d9b;">${name} 您好：</h2>
      <p>感謝您參與本次 ${EVENT_NAME}，您的參與證書已生成。</p>
      <p><strong>活動日期：</strong>${formattedDate}<br>
         <strong>證書編號：</strong>${certId}</p>
      <p>請查收附件，該檔案僅供您本人使用。</p>
      <p><strong>驗證方式：</strong>掃描下方 QR Code ：</p>
      <p style="text-align: center;">
        <img src="${qrImageUrl}" alt="QR Code 驗證" style="width: 160px; margin: 10px 0;"><br>
      </p>
      <p style="font-size: 0.9em; color: #999;">（此信為系統自動發送，請勿回覆）</p>
    </div>
  `;

  GmailApp.sendEmail(email, `青年好政｜您的${EVENT_NAME}參與證書已送達`, '', {
    htmlBody: htmlBody,
    attachments: [savedFile],
    name: '青年好政活動主辦團隊'
  });

  // 5. 紀錄發證資訊
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("record");
  logSheet.appendRow([name, email, certId, formattedDate, savedFile.getUrl()]);

  // 6. 清除簡報副本
  DriveApp.getFileById(copy.getId()).setTrashed(true);
}

// 顯示驗證頁（載入 index.html）
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

// 查詢證書驗證
function checkCertificate(certId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("record");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === certId) {
      const name = data[i][0];
      const date = data[i][3];
      return {
        success: true,
        message: `
          <strong>此證書有效！</strong><br><br>
          <strong>活動名稱：</strong>${EVENT_NAME}<br>
          <strong>姓名：</strong>${name}<br>
          <strong>發出日期：</strong>${date}<br>
          <strong>證書編號：</strong>${certId}<br>
          <em style="color: #777;">此頁僅供驗證用途，不提供下載。</em>
        `
      };
    }
  }
  return {
    success: false,
    message: `<strong>查無此證書。</strong>請確認輸入是否正確。`
  };
}
