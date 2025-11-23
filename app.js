// ===============================
// 自我评估系统 - 狠批型智能反馈 FINAL
// ===============================

// 页面加载时绑定事件与历史
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
    alert("记录完成了。保持自觉。");
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
// 狠批型情绪反馈（按情绪类别 + 强度）
// -----------------------
function moodCriticism(mood, level) {
    let t = "";

    if (mood === "out_of_control") {
        if (level <= 4) t += "你现在已经在崩溃边缘，还在硬撑？立刻停下来冷静。\n";
        else if (level <= 7) t += "你的情绪已经明显失控，继续硬扛只会更糟。\n";
        else t += "⚠ 完全失控。马上停止所有行为，深呼吸，冷静下来。\n";
    }

    if (mood === "stress") {
        if (level <= 4) t += "你表面看着稳，其实压力在暗中堆积。\n";
        else if (level <= 7) t += "压力正在控制你，你现在动作完全不流畅。\n";
        else t += "你被压力压着走，再坚持今天就废了。\n";
    }

    if (mood === "anxious") {
        if (level <= 3) t += "你现在有点不安，但还能止住，别让它扩大。\n";
        else if (level <= 6) t += "你现在明显焦虑，继续这样只会越做越乱。\n";
        else t += "你已经在焦虑里打转了，赶紧停下来重置状态。\n";
    }

    if (mood === "calm") {
        if (level <= 3) t += "你这不是平静，是懒散。别骗自己了。\n";
        else if (level <= 6) t += "平静不错，但你现在太松了。\n";
        else t += "状态不错，但需要主动推进任务，不要等动力自己来。\n";
    }

    if (mood === "focus") {
        if (level <= 4) t += "你这叫专注？你只是盯着东西而已。\n";
        else if (level <= 7) t += "还行，但你状态不稳。\n";
        else t += "你现在状态很好，不要被任何东西打断。\n";
    }

    return t;
}

// -----------------------
// 专注程度烈度反馈
// -----------------------
function focusCriticism(level) {
    if (level <= 3) return "你的专注度低得离谱，说白了就是在浪费时间。\n";
    if (level <= 6) return "你现在的状态半吊子，你知道你能做得更好。\n";
    if (level <= 8) return "专注度不错，但你还可以更稳更狠。\n";
    return "你的专注度非常强，保持这种节奏。\n";
}

// -----------------------
// 掌控度狠批
// -----------------------
function controlCriticism(level) {
    if (level <= 3) return "你完全被情绪和杂念牵着走，连自己节奏都掌控不了。\n";
    if (level <= 6) return "你勉强掌控，但很容易被外界拉走。\n";
    if (level <= 8) return "你基本掌控了自己的状态，这是成熟表现。\n";
    return "你现在完全主宰自己的状态，继续保持这种强度。\n";
}

// -----------------------
// 行为内容分析
// -----------------------
function doingCriticism(doing) {
    doing = doing.trim();

    if (/视频|刷|短视频/.test(doing)) return "你现在是在逃避，而不是休息。越刷越麻木。\n";
    if (/玩|手机/.test(doing)) return "你现在不是在放松，你是在浪费未来。\n";
    if (/发呆/.test(doing)) return "你现在在消极拖延，不是休息。\n";
    if (/躺|床/.test(doing)) return "你这样不是休息，是拖延。\n";
    if (/学习|作业|project|读/.test(doing)) return "你在学习，但质量明显不够，需要进入深度状态。\n";

    return "";
}

// -----------------------
// 是否是最有价值
// -----------------------
function valueCriticism(v) {
    v = v.trim();

    if (["不是", "不", "否", "不算", "一般", "no"].includes(v))
        return "你现在做的事根本不是最重要的，继续只会拖垮你今天剩下的时间。\n";

    return "你在做正确的事，但你需要保证节奏和力度。\n";
}

// -----------------------
// 生成最终狠批反馈
// -----------------------
function generateFeedback() {
    let history = JSON.parse(localStorage.getItem("evalHistory") || "[]");
    if (history.length === 0) {
        alert("你还没有任何记录。");
        return;
    }

    const r = history[history.length - 1];
    let fb = "【系统狠批反馈】\n\n";

    fb += moodCriticism(r.mood, r.moodLevel);
    fb += focusCriticism(r.focusLevel);
    fb += controlCriticism(r.controlLevel);
    fb += doingCriticism(r.doing);
    fb += valueCriticism(r.valuable);

    fb += "\n现在问你自己一句：你在变强吗？\n如果答案不是“是”，那你现在的行为就必须改变。";

    document.getElementById("feedbackText").innerText = fb;
}

// -----------------------
// 系统日历提醒
// -----------------------
function startMonitoring() {
    alert("即将跳转到系统日历，请创建【每小时重复】事件。");

    const intentUrl = "intent://com.android.calendar/#Intent;scheme=content;end";
    try { window.location.href = intentUrl; } catch (e) { }

    document.getElementById("monitorStatus").innerText = "已交由系统日历提醒。";
}

function stopMonitoring() {
    alert("网页监控已关闭。如需取消系统提醒，请在日历中手动关闭。");
    document.getElementById("monitorStatus").innerText = "当前监控状态：未开启";
}
