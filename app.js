// ===============================
// 自我评估系统 主脚本 app.js
// ===============================

// 监控间隔（1 小时）
// 提醒现在由系统计时器负责，不再依靠 JS 定时器
const MONITOR_INTERVAL_MS = 10 * 1000;
let monitorTimer = null;

// 音频是否解锁（华为手机必须用户交互）
let audioUnlocked = false;

// -----------------------
// 初始化
// -----------------------
window.onload = function () {
    loadHistory();
    requestNotificationPermission();

    document.getElementById("saveBtn").onclick = userInteractionInitAudio(saveRecord);
    document.getElementById("feedbackBtn").onclick = userInteractionInitAudio(generateFeedback);
    document.getElementById("startMonitorBtn").onclick = userInteractionInitAudio(startMonitoring);
    document.getElementById("stopMonitorBtn").onclick = stopMonitoring;
};

// -----------------------
// 用户点击任意按钮时自动解锁音频
// -----------------------
function userInteractionInitAudio(fn) {
    return function () {
        if (!audioUnlocked) initAudio();
        fn();
    }
}

function initAudio() {
    const testAudio = new Audio("audio/ding.wav");
    testAudio.play().then(() => {
        audioUnlocked = true;
        console.log("音效已解锁");
    }).catch(() => {
        console.log("音效解锁失败，用户需要继续点击任意按钮");
    });
}

// -----------------------
// 请求通知权限
// -----------------------
function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission();
    }
}

// -----------------------
// 播放叮声
// -----------------------
function playDing() {
    if (!audioUnlocked) return;
    const audio = new Audio("audio/ding.wav");
    audio.play();
}

// -----------------------
// 通知 + 音效提醒
// -----------------------
function notifyUser(message) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("自我评估提醒", {
            body: message,
            icon: "icons/icon-192.png"
        });
        playDing();
        return;
    }

    alert(message);
    playDing();
}

// -----------------------
// 保存记录
// -----------------------
function saveRecord() {
    const mood = document.getElementById("mood").value;
    const doing = document.getElementById("doing").value.trim();
    const valuable = document.getElementById("valuable").value.trim();

    if (!doing || !valuable) {
        alert("请填写完整信息再保存。");
        return;
    }

    const timestamp = new Date().toLocaleString("zh-CN");

    const record = { timestamp, mood, doing, valuable };

    let history = JSON.parse(localStorage.getItem("evalHistory") || "[]");
    history.push(record);
    localStorage.setItem("evalHistory", JSON.stringify(history));

    loadHistory();
    notifyUser("记录已保存。继续坚持。");
}

// -----------------------
// 加载历史记录
// -----------------------
function loadHistory() {
    const tableBody = document.querySelector("#historyTable tbody");
    tableBody.innerHTML = "";

    let history = JSON.parse(localStorage.getItem("evalHistory") || "[]");
    history.reverse().forEach(record => {
        const row = document.createElement("tr");
        const color = moodColor(record.mood);

        row.innerHTML = `
            <td>${record.timestamp}</td>
            <td style="font-weight:bold;color:${color};">${translateMood(record.mood)}</td>
            <td>${record.doing}</td>
            <td>${record.valuable}</td>
        `;

        tableBody.appendChild(row);
    });
}

// -----------------------
// 情绪颜色
// -----------------------
function moodColor(mood) {
    switch (mood) {
        case "focus": return "#22c55e";
        case "calm": return "#3b82f6";
        case "anxious": return "#fbbf24";
        case "stress": return "#ef4444";
        case "out_of_control": return "#8b5cf6";
    }
    return "#000";
}

// -----------------------
// 情绪中文翻译
// -----------------------
function translateMood(mood) {
    switch (mood) {
        case "focus": return "专注";
        case "calm": return "平静";
        case "anxious": return "焦虑";
        case "stress": return "压力";
        case "out_of_control": return "失控";
    }
    return mood;
}

// -----------------------
// 生成反馈
// -----------------------
function generateFeedback() {
    let history = JSON.parse(localStorage.getItem("evalHistory") || "[]");
    if (history.length === 0) {
        alert("没有记录，无法生成反馈。");
        return;
    }

    const last = history[history.length - 1];
    let mood = last.mood;
    let valuable = last.valuable;

    let feedback = "【系统反馈】\n";

    switch (mood) {
        case "focus":
            feedback += "你现在状态不错，保持住别松劲。\n";
            break;
        case "calm":
            feedback += "你现在平静，但别陷入低效舒适区。\n";
            break;
        case "anxious":
            feedback += "你焦虑了。深呼吸十秒，喝点水，走两步。\n";
            break;
        case "stress":
            feedback += "你的压力已经明显上来了，放松三分钟再继续。\n";
            break;
        case "out_of_control":
            feedback += "⚠ 你处于【失控】状态。\n停止一切动作，洗把脸冷静一下。\n";
            break;
    }

    if (["不是", "否", "不算", "一般"].includes(valuable)) {
        feedback += "\n你现在做的事不是最有价值的。\n马上问自己：最重要的事是什么？去做。\n";
    }

    document.getElementById("feedbackText").innerText = feedback;
}

// -----------------------
// 开始监控（系统计时器方案）
// -----------------------
function startMonitoring() {
    notifyUser("即将跳转到系统计时器，请点击“开始计时”。");

    // 🚀 核心：调用华为系统计时器（1 小时倒计时）
    window.location.href = "hwclock://addtimer?minute=60&repeat=1";

    document.getElementById("monitorStatus").innerText =
        "当前监控状态：已交由系统计时器处理";
}

// -----------------------
// 停止监控（网页端不再负责）
// -----------------------
function stopMonitoring() {
    notifyUser("监控已关闭（系统计时器仍需你手动停止）。");

    document.getElementById("monitorStatus").innerText =
        "当前监控状态：未开启";
}
