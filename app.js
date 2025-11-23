// ===============================
// 自我评估系统主脚本 app.js
// ===============================

// -----------------------
// 一些基础配置
// -----------------------
const MONITOR_INTERVAL_MS = 10 * 1000; // 每小时提醒，可改短测试
let monitorTimer = null;

// -----------------------
// 页面加载初始化
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
// 通知权限请求
// -----------------------
function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission();
    }
}

// -----------------------
// 通知 + 震动提醒
// -----------------------
function notifyUser(message) {

    // 系统通知
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("自我评估提醒", {
            body: message,
            icon: "icons/icon-192.png"
        });

        // 震动
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]); // 双震动
        }
        return;
    }

    // alert 作为兜底
    alert(message);

    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
    }
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

    // 存储到 localStorage
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

    // 倒序显示
    history.reverse().forEach(record => {
        const row = document.createElement("tr");

        // 情绪颜色
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
// 情绪中文名
// -----------------------
function translateMood(mood) {
    switch (mood) {
        case "focus": return "专注";
        case "calm": return "平静";
        case "anvious": return "焦虑";
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
    let doing = last.doing;
    let valuable = last.valuable;

    let feedback = "【系统反馈】\n";

    switch (mood) {
        case "focus":
            feedback += "你现在状态不错，保持住这个势头，不要松劲。\n";
            break;

        case "calm":
            feedback += "你的状态稳定，但要小心进入低效舒适区。保持一点紧迫感。\n";
            break;

        case "anxious":
            feedback += "你现在明显焦虑。深呼吸十秒，喝点水，稍微走动一下。别让情绪压着你。\n";
            break;

        case "stress":
            feedback += "你现在压力过大，状态已经影响效率。去散步 5 分钟，或者闭上眼睛缓一缓。\n";
            break;

        case "out_of_control":
            feedback += "⚠ 你现在处于【失控】状态。\n";
            feedback += "停下你正在做的事情，马上洗把脸，听几分钟轻音乐，让自己冷静下来。\n你现在的方向完全偏了，必须立即调整。\n";
            break;
    }

    if (valuable === "不是" || valuable === "否" || valuable === "不算" || valuable === "一般") {
        feedback += "\n顺便提醒你：你现在做的事情并不是最有价值的。\n";
        feedback += "你必须立刻问自己：我现在应该做的最重要的事是什么？然后马上去做。\n";
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
        notifyUser("时间到了，该记录你的状态了。");
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
function playDing() {
    const audio = new Audio("audio/ding.wav");
    audio.play();
}

