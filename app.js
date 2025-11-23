// ========== 本地存储 ==========

function loadRecords() {
    const data = localStorage.getItem("self_eval_records");
    return data ? JSON.parse(data) : [];
}

function saveRecords(records) {
    localStorage.setItem("self_eval_records", JSON.stringify(records));
}

// ========== 反馈系统核心逻辑（等价 Python 版） ==========

function generateFeedback(records) {
    if (records.length === 0) {
        return "目前没有任何记录，可以先写一条，让我更了解你。";
    }

    const last = records[records.length - 1];
    const mood = last.mood;
    const doing = (last.doing || "").trim();
    const valuable = (last.valuable || "").trim();

    let fb = [];

    // ===== 情绪反馈 =====
    if (mood === "focus") {
        fb.push("你现在状态不错，可以趁机保持节奏。如果愿意，可以给自己设一个小任务继续推进。");
    }
    else if (mood === "calm") {
        fb.push("你现在情绪平稳，很适合做一些需要耐心的工作，可以尝试进入一个轻量专注阶段。");
    }
    else if (mood === "anxious") {
        fb.push("你现在有些紧张，可以做几次深呼吸，喝点水，或整理一下桌面，会让你舒服不少。");
        fb.push("如果焦虑持续，可以试着听一点轻音乐，让心情柔和下来。");
    }
    else if (mood === "stress") {
        fb.push("你似乎承受了一些压力，可以轻轻活动肩颈，站起来走几步，让身体缓一缓。");
        fb.push("闭上眼睛几秒钟，也会帮助大脑恢复镇定。");
    }
    else if (mood === "out_of_control") {
        fb.push("你现在有点失控或过度兴奋，可能一下子有了很多冲动或想法。先让自己慢下来一点会更好。");
        fb.push("可以深呼吸三次、喝一口水，让身体稳定下来。");
        fb.push("如果脑子很乱，可以写下此刻最重要的一件事，把注意力放在一个方向上。");
        fb.push("这种状态不适合频繁切换任务，轻轻推进一小步就足够了。");
    }
    else {
        fb.push("暂时无法判断当前情绪，但你可以先观察一下自己的状态。");
    }

    // ===== 行为反馈 =====
    const lowValueKeywords = ["刷", "摸鱼", "发呆", "短视频", "游戏"];
    const isLowValue =
        lowValueKeywords.some(k => doing.includes(k)) ||
        ["不是", "不算", "一般"].some(k => valuable.includes(k));

    if (doing) {
        fb.push(`你现在做的是：『${doing}』。`);
    } else {
        fb.push("你没有写正在做什么，如果记录下来，会更帮助你反思状态。");
    }

    if (valuable) {
        fb.push(`你的评价是：『${valuable}』。`);
    }

    if (isLowValue) {
        fb.push("如果愿意，你可以想想：现在有没有更值得推进的事情？可以从最简单的一小步开始。");
    } else {
        fb.push("你正在做的事情看起来挺重要，可以保持一个短短的小专注段，让节奏稳定下来。");
    }

    // ===== 最近 3 条趋势 =====
    if (records.length >= 3) {
        const recent = records.slice(-3);

        let not_val_count = 0;
        for (let r of recent) {
            let d = r.doing || "";
            let v = r.valuable || "";
            if (
                lowValueKeywords.some(k => d.includes(k)) ||
                ["不是", "不算", "一般"].some(k => v.includes(k))
            ) {
                not_val_count++;
            }
        }

        if (not_val_count >= 2) {
            fb.push("最近几次记录中，你似乎有点偏离目标，可以从一个轻松的小起点重新开始，例如整理桌面或写下下一件要做的事。");
        }
    }

    return fb.join("\n\n");
}

// ========== 更新历史表 ==========

function updateHistoryTable() {
    const table = document.querySelector("#historyTable tbody");
    table.innerHTML = "";

    const records = loadRecords().reverse();

    records.forEach(record => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${record.time}</td>
            <td>${record.mood}</td>
            <td>${record.doing}</td>
            <td>${record.valuable}</td>
        `;
        table.appendChild(tr);
    });
}

// ========== 保存按钮 ==========

document.getElementById("saveBtn").onclick = () => {
    const mood = document.getElementById("mood").value;
    const doing = document.getElementById("doing").value.trim();
    const valuable = document.getElementById("valuable").value.trim();

    const record = {
        time: new Date().toLocaleString(),
        mood,
        doing,
        valuable
    };

    const records = loadRecords();
    records.push(record);
    saveRecords(records);

    alert("记录已保存！");
    updateHistoryTable();
};

// ========== 反馈按钮 ==========

document.getElementById("feedbackBtn").onclick = () => {
    const records = loadRecords();
    const feedback = generateFeedback(records);

    document.getElementById("feedbackText").innerText = feedback;
};

// 初始化历史数据
updateHistoryTable();
