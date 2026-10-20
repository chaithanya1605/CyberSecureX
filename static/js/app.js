document.addEventListener("DOMContentLoaded", function () {
    const forms = document.querySelectorAll("form");

    forms.forEach((form) => {
        form.addEventListener("submit", function (e) {
            const action = form.getAttribute("action");

            if (
                [
                    "/analyze_email",
                    "/analyze_url",
                    "/analyze_instagram",
                    "/check_password",
                    "/analyze_message",
                    "/check_spam",
                    "/check_2fa",
                    "/scan_qr",
                    "/submit_quiz"
                ].includes(action)
            ) {
                e.preventDefault();
                handleSecurityScan(form, action);
            } else if (action === "/ask_ai") {
                e.preventDefault();
                handleAiChat(form);
            }
        });
    });
});

function handleSecurityScan(form, endpoint) {
    const formData = new FormData(form);
    const submitBtn = form.querySelector("button[type='submit']");
    const originalText = submitBtn.innerText;

    submitBtn.innerText = "⏳ Analyzing Threat Vectors...";
    submitBtn.disabled = true;

    fetch(endpoint, {
        method: "POST",
        body: formData,
    })
        .then((res) => res.json())
        .then((data) => {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;

            if (data.status === "success") {
                displayRiskResult(form, data);

                if (data.risk_level !== "INFO") {
                    let targetInput = form.querySelector("input[name='sender'], input[name='url'], input[name='Username'], input[name='phone'], input[name='password'], input[name='accountName']");
                    let targetValue = targetInput ? targetInput.value : "[Target Analyzed]";
                    let scanType = form.getAttribute("data-scan-type") || "Security Scan";

                    addRecordToHistoryTable(scanType, targetValue, data.risk_level, data.risk_score);
                }
            } else {
                alert("Error running analysis: " + (data.message || "Unknown error"));
            }
        })
        .catch((err) => {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            console.error(err);
        });
}

function displayRiskResult(form, data) {
    let resultContainer = form.querySelector(".scan-result-card");
    if (!resultContainer) {
        resultContainer = document.createElement("div");
        resultContainer.className = "scan-result-card";
        resultContainer.style.marginTop = "15px";
        resultContainer.style.padding = "14px";
        resultContainer.style.borderRadius = "8px";
        resultContainer.style.fontSize = "13px";
        form.appendChild(resultContainer);
    }

    // Quiz Special Response
    if (data.risk_level === "INFO") {
        const isCorrect = data.risk_score === 0;
        resultContainer.style.backgroundColor = isCorrect ? "rgba(15, 61, 41, 0.95)" : "rgba(92, 26, 27, 0.95)";
        resultContainer.style.border = `1px solid ${isCorrect ? "#2ecc71" : "#ff4d4d"}`;

        resultContainer.innerHTML = `
            <div style="font-size: 15px; font-weight: bold; color: ${isCorrect ? "#2ecc71" : "#ff4d4d"};">
                ${isCorrect ? "✅ Quiz Result: Correct Answer!" : "❌ Quiz Result: Incorrect Answer"}
            </div>
            <div style="margin-top: 6px; color: #ffffff;">
                ${data.details}
            </div>
        `;
        return;
    }

    const isHighRisk = data.risk_score >= 70;
    const isMediumRisk = data.risk_score >= 35 && data.risk_score < 70;

    let bgColor = isHighRisk
        ? "rgba(92, 26, 27, 0.95)"
        : isMediumRisk
        ? "rgba(120, 80, 0, 0.95)"
        : "rgba(15, 61, 41, 0.95)";
    let borderColor = isHighRisk ? "#ff4d4d" : isMediumRisk ? "#ffcc00" : "#2ecc71";

    resultContainer.style.backgroundColor = bgColor;
    resultContainer.style.border = `1px solid ${borderColor}`;

    let targetInput = form.querySelector("input[name='sender'], input[name='url'], input[name='Username'], input[name='phone'], input[name='accountName']");
    let targetVal = targetInput ? targetInput.value : "Target";
    let scanType = form.getAttribute("data-scan-type") || "Threat Scan";

    let reportUrl = `/view_report?case_id=${data.case_id}&scan_type=${encodeURIComponent(scanType)}&target_info=${encodeURIComponent(targetVal)}&risk_score=${data.risk_score}&risk_level=${data.risk_level}&details=${encodeURIComponent(data.details)}`;

    let highRiskActionsHTML = "";
    if (isHighRisk) {
        highRiskActionsHTML = `
            <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
                <div style="color: #ff9999; font-weight: bold; margin-bottom: 8px;">
                    🚨 HIGH RISK CRITICAL THREAT DETECTED
                </div>
                
                <a href="${reportUrl}" target="_blank" class="btn-action btn-blue" style="display: block; text-align: center; margin-bottom: 10px; padding: 8px; text-decoration: none;">
                    📄 View / Print Official Incident Report
                </a>

                <label style="color: #00eaff; font-weight: bold; margin-bottom: 4px; display: block;">
                    📩 Prepared Complaint Email Draft:
                </label>
                <textarea readonly style="height: 110px; font-size: 11px; background-color: #08101e; color: #71f5ff; margin-bottom: 8px; width:100%; border:1px solid #00eaff; border-radius:4px; padding:6px;">${data.email_body}</textarea>
                
                <button type="button" onclick="copyToClipboard('${data.case_id}_draft')" id="${data.case_id}_btn" class="btn-action btn-indigo" style="width: 100%;">
                    📋 Copy Complaint Email Draft
                </button>
                <input type="hidden" id="${data.case_id}_draft" value="${escapeHtml(data.email_body)}">
            </div>
        `;
    }

    resultContainer.innerHTML = `
        <div style="font-size: 15px; font-weight: bold; color: ${borderColor};">
            Risk Score: ${data.risk_score}% [${data.risk_level} RISK]
        </div>
        <div style="margin-top: 6px; color: #ffffff;">
            <strong>Details:</strong> ${data.details}
        </div>
        ${highRiskActionsHTML}
    `;
}

function copyToClipboard(inputId) {
    const hiddenInput = document.getElementById(inputId);
    if (hiddenInput) {
        navigator.clipboard.writeText(hiddenInput.value);
        alert("📋 Complaint email draft copied to clipboard!");
    }
}

function addRecordToHistoryTable(scanType, targetInfo, riskLevel, riskScore) {
    const tableBody = document.getElementById("history-table-body");
    if (!tableBody) return;

    const emptyRow = document.getElementById("no-history-row");
    if (emptyRow) emptyRow.remove();

    const now = new Date();
    const formattedDate = now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0") + " " +
        String(now.getHours()).padStart(2, "0") + ":" +
        String(now.getMinutes()).padStart(2, "0") + ":" +
        String(now.getSeconds()).padStart(2, "0");

    let btnClass = riskLevel === "HIGH" ? "btn-danger" : (riskLevel === "MEDIUM" ? "btn-indigo" : "btn-success");

    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${scanType}</td>
        <td>${escapeHtml(targetInfo)}</td>
        <td><span class="btn-action ${btnClass}">${riskLevel} (${riskScore}%)</span></td>
        <td>Completed</td>
    `;

    tableBody.insertBefore(row, tableBody.firstChild);
}

function handleAiChat(form) {
    const input = form.querySelector("input[name='question']");
    const userMsg = input.value.trim();
    if (!userMsg) return;

    const chatCard = form.closest(".dash-card");

    const userRow = document.createElement("div");
    userRow.className = "module-row";
    userRow.innerHTML = `<span class="module-name"><strong>You:</strong> ${escapeHtml(userMsg)}</span>`;
    chatCard.insertBefore(userRow, form);

    input.value = "";

    const formData = new FormData();
    formData.append("question", userMsg);

    fetch("/ask_ai", {
        method: "POST",
        body: formData,
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.status === "success") {
                const botRow = document.createElement("div");
                botRow.className = "module-row";
                botRow.style.borderColor = "#00eaff";
                botRow.innerHTML = `<span class="module-name">${data.response}</span>`;
                chatCard.insertBefore(botRow, form);
            }
        });
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}