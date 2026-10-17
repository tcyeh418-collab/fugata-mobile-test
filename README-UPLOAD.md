# Fugata Room 1–6 手機測試站

這是 2026-10-17 的 Room 1–6 與直式 Ending 手機操作測試版本，不是正式 release。

## 測試入口

`https://tcyeh418-collab.github.io/fugata-mobile-test/mobile/index.html?mobile=room1`

請透過 HTTPS 開啟，不要使用 `file://`。角色建立採直式操作，確認進入 Room 1 後再轉成橫式遊玩。

## 手機操作

- 左側按住並拖曳：動態虛擬搖桿。
- 右側菱形按鈕：依目前關卡與互動位置顯示聆聽、確認、測試及取消等動作。
- iPhone Safari：建議加入主畫面後測試橫式與 safe area。
- Android Chrome：可使用「全螢幕遊玩」。

## 測試範圍

請由標題畫面與角色建立正常進入遊戲，依序測試 Room 1–6；完成 Room 6 後，Ending 會切換為直式閱讀。

真機請特別確認：

1. 快速點擊場景不會誤觸搖桿。
2. 左手持續移動時，右手按鈕仍可操作。
3. 放開搖桿後角色立即停止。
4. Room 1 拿取素材後仍能聽到片段。
5. Room 4 聲部播放與排列操作正常。
6. Room 5 三段節奏、測試及最終啟動音訊正常。
7. Room 6 的聆聽、選取、確認提交與取消選取都能分開操作。
8. 完成 Room 6 後，Ending 會提示旋轉為直式並可完整捲動閱讀。
9. 對話不被控制器遮住。
10. 瀏海、Dynamic Island 與 Home Indicator 不遮住 HUD 或按鈕。
11. 遊戲中旋轉回直式會顯示橫式提示。

Chromium 自動化結果不等同於 iPhone 或 Android 真機測試。

## 快取

GitHub Pages 與 Safari 可能短暫保留舊檔。若仍看到舊版，請等待數分鐘後重新整理；必要時清除該網站資料或以無痕視窗開啟。
