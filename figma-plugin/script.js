const exportBtn = document.getElementById('exportBtn');
const checkBtn = document.getElementById('checkBtn');
const resultsDiv = document.getElementById('results');
const projectLink = document.getElementById('projectsLink');

if (!resultsDiv){
    const resultDiv = document.createElement('div');
    resultDiv.className = 'results';
    document.querySelector('.main-content').insertBefore(resultDiv, document.getElementById('exportBtn'));
}

if (projectLink){
    projectLink.style.display='none';
}

checkBtn.onclick=()=>{
    parent.postMessage({pluginMessage: {type: 'check'}}, '*');
};
exportBtn.onclick=()=>{
    parent.postMessage({pluginMessage: {type: 'export'}}, '*');
};


window.onmessage = (event)=>{
    const msg = event.data.pluginMessage;
    const container = document.getElementById('results');
    if (!container){
        return;
    }
    if (msg?.type ==='validation-result'){
        const errors = msg.issues.filter(i=>i.type === 'error');
        let html='';

        if(errors.length){
            html+=`<div style="margin-bottom: 8px;"><strong>❌ Ошибки (${errors.length})</strong></div>`;
                errors.forEach(e => {
                    html += `<div class="error">• ${e.message}<br><small>→ ${e.fix}</small></div>`;
                });
        }

        if (errors.length===0){
            html+='<div class="success">✅ Ошибок нет! Макет готов к экспорту.</div>';
            if (projectLink){
                projectLink.style.display='block';
            }
        }
        else{
            if (projectLink){
                projectLink.style.display='none';
            }
        }
        container.innerHTML = html;
        exportBtn.disabled = errors.length > 0;
    }

    if (msg?.type === 'export-success'){
        container.innerHTML=`<div class="success">
        ✅ Экспорт выполнен!<br><br>
        </div>`;
        exportBtn.disabled = false;
    }
    if (msg?.type === 'error') {
        container.innerHTML = `<div class="error">❌ Ошибка: ${msg.message}</div>`;
    }
};