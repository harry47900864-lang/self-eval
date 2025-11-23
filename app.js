// 加载历史记录
function loadRecords() {
    const data = localStorage.getItem("self_eval_records");
    return data ? JSON.parse(data) : [];
}

// 保存历史记录
function saveRecords(records) {
    localStorage.setItem("self_eval_records", JSON.stringify(records));
}

// 更新历史记录表
function updateHistoryTable() {
    const tableBody = document.querySelector("#historyTable tbody");
    tableBody.innerHTML = "";

    const records = loadRecords().reverse();

    records.forEach(record => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${record.time}</td>
            <td>${record.mood}</td>
            <td>${record.doing}</td>
            <td>${record.valuable}</td>
        `;

        tableBody.appendChild(tr);
    });
}

// 点击保存按钮
document.getElementById("saveBtn").onclick = () => {
    const mood = document.getElementById("mood").value;
    const doing = document.getElementById("doing").value.trim();
    const valuable = document.getElementById("valuable").value.trim();

    const record = {
        time: new Date().toLocaleString(),
        mood: mood,
        doing: doing,
        valuable: valuable
    };

    const records = loadRecords();
    records.push(record);
    saveRecords(records);

    alert("记录已保存！");
    updateHistoryTable();
};

// 初始化
updateHistoryTable();
