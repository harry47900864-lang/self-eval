// ===============================
// 自我评估系统 主脚本 app.js
// ===============================

// 监控间隔（1 小时）——现在真正的提醒交给系统日历，这里只是状态显示
const MONITOR_INTERVAL_MS = 60 * 60 * 1000;
let monitorTimer = null;

// 音频是否解锁（PC端可用，华为手机可能被限制）
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
// 用户点击时尝试解锁音频（桌面端可响）
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
        console.log("音效解锁失败（手机端可能被系统限制），继续执行逻辑。");
    });
}

// -----------------------
// 通知权限
// -----------------------
function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission();
    }
}

// -----------------------
// 播放叮声（仅在支持设备上有效）
// -----------------------
function playDing() {
    if (!audioUnlocked) return;
    try {
        const audio = new Audio("audio/ding.wav");
        audio.play();
    } catch (e) {
        console.log("播放音效失败：", e);
    }
}

// -----------------------
// 通知 + 提示（PC 有声，手机至少有弹窗）
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
// 加载历史记录（倒序+颜色）
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
        case "focus": return "#22c55e";         // 绿色
        case "calm": return "#3b82f6";          // 蓝色
        case "anxious": return "#fbbf24";       // 黄色
        case "stress": return "#ef4444";        // 红色
        case "out_of_control": return "#8b5cf6";// 紫色
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
// 生成反馈（稍微狠一点）
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
            feedback += "你现在状态不错，别自己把节奏打断。\n";
            break;
        case "calm":
            feedback += "你现在很平静，但别一直停在舒适区里发呆。\n";
            break;
        case "anxious":
            feedback += "你现在明显有点焦虑。先缓一缓，再继续推进事情，不要一边焦虑一边假装在忙。\n";
            break;
        case "stress":
            feedback += "压力已经开始压垮你的状态了。离开屏幕几分钟，调整呼吸，整理一下接下来的优先级。\n";
            break;
        case "out_of_control":
            feedback += "⚠ 你处于【失控】状态。\n马上停下，远离手机和电脑，洗把脸或者走一圈，把自己从这种状态里拽出来。\n";
            break;
    }

    if (["不是", "否", "不算", "一般"].includes(valuable)) {
        feedback += "\n你现在做的事并不是最有价值的。\n别再拖了，立刻问自己：我现在最应该做的那件事是什么？然后就去做。\n";
    }

    document.getElementById("feedbackText").innerText = feedback;
}

// -----------------------
// 开始监控：交给系统日历
// -----------------------
async function startMonitoring() {
    // 1. 准备日历事件内容
    const title = "自我评估提醒";
    const description = "请立即记录你的情绪状态。";

    // 2. 尝试把文字复制到剪贴板，方便你在日历里粘贴备注
    const textToCopy = `标题：${title}\n备注：${description}`;
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(textToCopy);
            alert("已将日历事件内容复制到剪贴板，等会可以直接在日历备注里粘贴。");
        } else {
            alert("浏览器不支持自动复制，请等会手动输入：自我评估提醒 / 请立即记录你的情绪状态。");
        }
    } catch (e) {
        alert("复制到剪贴板失败，请等会手动输入：自我评估提醒 / 请立即记录你的情绪状态。");
    }

    // 3. 提示你即将打开系统日历
    notifyUser("接下来会尝试打开系统日历，请在日历里新建一个标题为「自我评估提醒」的事件，并设置为每 1 小时提醒。");

    // 4. 尝试使用 intent:// 打开系统日历（部分浏览器支持）
    const intentUrl = "intent://com.android.calendar/#Intent;scheme=content;end";

    let jumped = false;
    try {
        window.location.href = intentUrl;
        jumped = true;
    } catch (e) {
        jumped = false;
    }

    // 5. 无论是否成功，更新状态说明
    document.getElementById("monitorStatus").innerText =
        "当前监控状态：请在系统日历中设置「自我评估提醒」为每 1 小时提醒一次。";
}

// -----------------------
// 停止监控：只在页面层面提示
// -----------------------
function stopMonitoring() {
    notifyUser("网页端监控已关闭。若你在系统日历中设置了定时提醒，需要你自己在日历中手动关闭。");
    document.getElementById("monitorStatus").innerText = "当前监控状态：未开启";
}
