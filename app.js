// ===============================
// 自我评估系统 主脚本 app.js
// ===============================

// 音频解锁（PC有效，手机可能被屏蔽）
let audioUnlocked = false;

// -----------------------
// 初始化
// -----------------------
window.onload = function () {
    loadHistory();

    document.getElementById("saveBtn").onclick = saveRecord;
    document.getElementById("feedbackBtn").onclick = generateFeedback;
    document.getElementById("startMonitorBtn").onclick = startMonitoring;
    document.getElementById("stopMonitorBtn").onclick = stopMonitoring;
};

// -----------------------
// 保存记录
// -----------------------
function saveRecord() {
    const record = {
        timestamp: new Date().toLocaleString("zh-CN"),
        mood: document.getElementById("mood").value,
        moodLevel: Number(document.getElementById("moodLevel").value),
        doing: document.getElementById("doing").value.trim(),
        focusLevel: Number(document.getElementById("focusLevel").value),
        controlLevel: Number(document.getElementById("controlLevel").value),
        valuable: document.getElementById("valuable").value.trim()
    };

    if (!record.doing) {
        alert("你要写清楚你现在在干什么。");
        return;
    }

    let history = JSON.parse(localStorage.getItem("evalHistory") || "[]");
    history.push(record);
    localStorage.setItem("evalHistory", JSON.stringify(history));

    loadHistory();
    alert("记录完成。继续保持自觉。");
}

// -----------------------
// 加载历史
// -----------------------
function loadHistory() {
    const tableBody = document.querySelector("#historyTable tbody");
    tableBody.innerHTML = "";

    let history = JSON.parse(localStorage.getItem("evalHistory") || "[]");
    history.reverse().forEach(r => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${r.timestamp}</td>
            <td>${translateMood(r.mood)}</td>
            <td>${r.moodLevel}</td>
            <td>${r.doing}</td>
            <td>${r.focusLevel}</td>
            <td>${r.controlLevel}</td>
            <td>${r.valuable}</td>
        `;
        tableBody.appendChild(row);
    });
}

// -----------------------
// 情绪翻译
// -----------------------
function translateMood(m) {
    return {
        focus: "专注",
        calm: "平静",
        anxious: "焦虑",
        stress: "压力",
        out_of_control: "失控"
    }[m] || m;
}

// -----------------------
// 狠一点的反馈
// -----------------------
function generateFeedback() {
    let history = JSON.parse(localStorage.getItem("evalHistory") || "[]");
    if (history.length === 0) {
        alert("你还没有任何记录。");
        return;
    }

    const r = history[history.length - 1];
    let fb = "【系统反馈】\n";

    // 情绪强度判断
    if (r.moodLevel <= 2) fb += "你的情绪很稳，这种状态非常难得，保持。\n";
    else if (r.moodLevel <= 5) fb += "情绪开始有点波动，但还能控制住，注意别让自己掉下坡。\n";
    else if (r.moodLevel <= 7) fb += "你的情绪已经影响效率了，必须休息一下再继续。\n";
    else fb += "⚠ 你的情绪已经失控边缘，必须立刻停下、深呼吸、离开屏幕。\n";

    // 专注程度判断
    if (r.focusLevel <= 3) fb += "现在几乎不算在学习，你只是在拖时间。立刻收心。\n";
    else if (r.focusLevel <= 6) fb += "专注度一般，你能做得更好。\n";
    else if (r.focusLevel <= 8) fb += "不错，你的专注度是合格的。\n";
    else fb += "今天状态很顶，别让任何东西破坏你的节奏。\n";

    // 掌控度判断
    if (r.controlLevel <= 3) fb += "你几乎被情绪和外界牵着走，必须重新掌控自己的节奏。\n";
    else if (r.controlLevel <= 6) fb += "你勉强掌控状态，但还有明显提升空间。\n";
    else if (r.controlLevel <= 8) fb += "你在掌控自己的节奏，这是非常好的迹象。\n";
    else fb += "你完全掌控了自己的状态，继续保持这种强度。\n";

    // 是否最有价值
    if (["不是", "否", "一般", "不算"].includes(r.valuable)) {
        fb += "\n你现在做的事不是最有价值的。马上调整，不要浪费时间。\n";
    }

    document.getElementById("feedbackText").innerText = fb;
}

// -----------------------
// 系统日历提醒（你选的方案）
// -----------------------
async function startMonitoring() {
    alert("接下来会跳转到系统日历，请创建一个每小时提醒的事件.");

    const intentUrl = "intent://com.android.calendar/#Intent;scheme=content;end";
    try { window.location.href = intentUrl; } catch (e) {}

    document.getElementById("monitorStatus").innerText =
        "已交由系统日历提醒。";
}

function stopMonitoring() {
    alert("网页端监控关闭。如需取消系统提醒，请在日历中手动关闭。");
    document.getElementById("monitorStatus").innerText = "当前监控状态：未开启";
}
