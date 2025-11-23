// ===============================
// 自我评估系统 主脚本 app.js
// ===============================

// 监控间隔（1 小时）
const MONITOR_INTERVAL_MS = 60 * 60 * 1000;
let monitorTimer = null;

// -----------------------
// 初始化
// -----------------------
window.onload = function () {
    loadHistory();
    requestNotificationPermission();

    document.getElementById("saveBtn").onclick = saveRecord;
    document.getElementById("feedbackBtn").onclick = generateFeedback;
    document.getElementById("startMonitorBtn").onclick = startMonitoring;
    document.getElementById("stopMonitorBtn").onclick = stopMonitoring;
};

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
    const audio = new Audio("audio/ding.wav");
    audio.play();
}

// -----------------------
// 通知 + 音效提醒
// -----------------------
function notifyUser(message) {

    // 系统通知
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("自我评估提醒", {
            body: message,
            icon: "icons/icon-192.png"
        });

        playDing(); // 播放提示音
        return;
    }

    // alert 作为兜底
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

    const now = new Date();
    const timestamp = now.toLocaleString("zh-CN");

    const record = {
        timestamp,
        mood,
        doing,
        valuable
    };

    let history = JSON.parse(localStorage.getItem("evalHistory") || "[]");
    history.push(record);
    localStorage.setItem("evalHistory", JSON.stringify(history));

    loadHistory();
    notifyUser("记录已保存。继续坚持，Maolin。");
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
        case "focus": return "#22c55e";   // 绿色
        case "calm": return "#3b82f6";    // 蓝色
        case "anxious": return "#fbbf24"; // 黄色
        case "stress": return "#ef4444";  // 红色
        case "out_of_control": return "#8b5cf6"; // 紫色
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
// 生成反馈（狠一点）
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
            feedback += "你现在状态不错，保持住这个势头，不要松懈。\n";
            break;

        case "calm":
            feedback += "你现在很平静，但不要陷入舒适区。保持一点推进力。\n";
            break;

        case "anxious":
            feedback += "你现在焦虑得有点明显。深呼吸十秒，喝点水，站起来走两步。\n";
            break;

        case "stress":
            feedback += "你的压力已经影响到状态了。离开屏幕几分钟，做点放松动作。\n";
            break;

        case "out_of_control":
            feedback += "⚠ 你处于【失控】状态。\n";
            feedback += "立刻停下来，去洗把脸、听轻音乐，强制冷静 3 分钟。\n";
            break;
    }

    if (valuable === "不是" || valuable === "否" || valuable === "不算" || valuable === "一般") {
        feedback += "\n你现在做的事情不是最有价值的。\n马上提醒自己：我现在应该做的最重要的事是什么？然后去做。\n";
    }

    document.getElementById("feedbackText").innerText = feedback;
}

// -----------------------
// 开始监控
// -----------------------
function startMonitoring() {
    if (monitorTimer) {
        notifyUser("监控已经在运行中。");
        return;
    }

    monitorTimer = setInterval(() => {
        notifyUser("该记录你的状态了。");
    }, MONITOR_INTERVAL_MS);

    document.getElementById("monitorStatus").innerText =
        "当前监控状态：已开启";
}

// -----------------------
// 停止监控
// -----------------------
function stopMonitoring() {
    if (monitorTimer) {
        clearInterval(monitorTimer);
        monitorTimer = null;
        notifyUser("监控已关闭。");
    }

    document.getElementById("monitorStatus").innerText =
        "当前监控状态：未开启";
}
