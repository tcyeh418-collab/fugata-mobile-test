# Fugata Room 1 手機版 v2｜手動上傳說明

這是 Room 1 手機操作介面的獨立測試包，不是正式 release，也不包含 Room 2–6 的完整圖片與音訊素材。

## 上傳方式

1. 解壓 ZIP。
2. 將解壓後的 **全部內容** 上傳到同一個網站目錄；請保留 `index.html`、`mobile/`、`css/`、`js/`、`assets/`、`outputs/` 的相對目錄結構。
3. 手機入口格式：`https://你的網域/你的目錄/mobile/index.html?mobile=room1`
4. 網站必須透過 HTTP 或 HTTPS 提供，不能直接以 `file://` 開啟。建議使用 HTTPS，Fullscreen、Web App 與加入主畫面的相容性較完整。

伺服器必須正確提供以下 MIME types：

- HTML：`text/html`
- JavaScript：`text/javascript` 或 `application/javascript`
- CSS：`text/css`
- JSON：`application/json`
- Web App Manifest：`application/manifest+json`
- WOFF2：`font/woff2`
- PNG：`image/png`
- JPEG：`image/jpeg`
- MP3：`audio/mpeg`

## 手機提示

- iPhone Safari：建議先選擇「加入主畫面」，再以橫式遊玩。
- Android Chrome：可在遊戲 HUD 點擊「全螢幕遊玩」，並測試進入與退出。
- 更新測試包後若仍看到舊版，請清除該網站的快取／網站資料，或上傳到新的目錄名稱再開啟。

這份包的自動驗證使用 Chromium 模擬 viewport 與 Pointer Events；**這不是真機測試結果**。

## 真機手動檢查清單

1. iPhone Safari 快速點擊場景不會誤觸搖桿。
2. iPhone 加入主畫面後 safe area 正常。
3. Android Chrome 可以進入及退出全螢幕。
4. 左手持續移動時，右手四個按鈕都能操作。
5. 放開搖桿後角色立即停止。
6. 對話開啟時控制器不遮住正文。
7. 瀏海、Dynamic Island 與 Home Indicator 不遮住 HUD 或按鈕。
8. 旋轉回直式時會顯示橫式提示。

封裝識別：`fugata-room1-mobile-v2-playtest-2026-10-14-3`
