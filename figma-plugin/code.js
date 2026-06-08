figma.showUI(__html__, { width: 360, height: 450  });

async function validateFrame(node, issues=[]) {
    if (node.layoutMode === 'NONE' && node.children && node.children.length>0 && (node.type==='COMPONENT' || (node.type==="FRAME" && !(node.parent.type === 'PAGE')))) {
        const alreadyExists = issues.some(i => i.message.includes(node.name) && i.type.includes("error") && i.message.includes("Auto Layout"));
        if (!alreadyExists){
            issues.push({
                type: 'error',
                message: `"${node.name}" не использует Auto Layout`,
                fix: 'Выделите фрейм и нажмите Shift+A',
            });
        }
    }
    
    if ((node.type === 'FRAME' && node.parent.type === 'PAGE') && (!/^[A-Z]/.test(node.name) || /\s/.test(node.name))) {
        const alreadyExists = issues.some(i => i.message.includes(node.name) && i.type.includes("error") && i.message.includes("c большой буквы"));
        if (!alreadyExists){
            issues.push({
                type: 'error',
                message: `Название ${node.name} должно начинаться с большой буквы на английском без пробелов`,
                fix: 'Переименуйте в PascalCase'
            });
        }
    }

    if (((node.type==="FRAME" && !(node.parent.type === 'PAGE')) || node.type==="COMPONENT") && !/^[a-z][a-z0-9-]*$/.test(node.name)){
        const alreadyExists = issues.some(i => i.message.includes(node.name) && i.type.includes("error") && i.message.includes("kebab-case"));
        if (!alreadyExists){
            issues.push({
                type: 'error',
                message: `Слой "${node.name}" должен наименоваться в kebab-case `,
                fix: 'пример: hero-section'
            });
        }
    };

    if (node.children && node.children.length){
        for (const child of node.children){
            await validateFrame(child, issues);
        } 
    }
    return issues;
}

function collectMetadata(node) {
     if (node.type === 'TEXT') {
        // Получаем стили текста
        const fontName = node.fontName;
        const fills = node.fills;
        let color = '#000000';
        
        if (fills && fills.length > 0 && fills[0].type === 'SOLID') {
            const rgb = fills[0].color;
            color = `rgb(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)})`;
        }
        
        return {
            nodeId: node.id,
            nodeName: node.name,
            nodeType: 'TEXT',
            characters: node.characters,
            fontSize: node.fontSize,
            fontWeight: node.fontWeight,
            fontFamily: fontName.family || 'Inter',
            color: color,
            lineHeight: node.lineHeight.value || 'normal',
            textAlign: node.textAlignHorizontal
        };
    }
    const metadata = {
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
    };

    if ('layoutMode' in node && node.layoutMode !== 'NONE') {
        metadata.autoLayoutMode = node.layoutMode;
        metadata.gap = node.itemSpacing;
        metadata.padding = {
            top: node.paddingTop,
            right: node.paddingRight,
            bottom: node.paddingBottom,
            left: node.paddingLeft
        };
    }

    if ('children' in node && node.children && node.children.length) {
        metadata.children = node.children.map(function(child) {
            return collectMetadata(child);
        });
    }

    return metadata;
}

figma.ui.onmessage = async function(msg) {
    var selection = figma.currentPage.selection;
    
    if (msg.type==='resize'){
        figma.ui.resize(360, msg.height);
    }
    if (msg.type === 'check') {
        if (selection.length === 0) {
            figma.ui.postMessage({ type: 'error', message: 'Выделите фрейм' });
            return;
        }
        
        var frame = selection[0];
        var issues = await validateFrame(frame);
        figma.ui.postMessage({ type: 'validation-result', issues: issues });
    }
    
    if (msg.type === 'export') {

        if (selection.length === 0) {
            figma.ui.postMessage({ type: 'error', message: 'Выделите фрейм' });
            return;
        }
        var frame = selection[0];
        var rootNode = collectMetadata(frame);
        var ownerId = 'figma-user';
        if (figma.currentUser && figma.currentUser.id) {
            ownerId = figma.currentUser.id;
        }
        var projectName = figma.root.name;
        var componentName = selection[0].name;
        try {
            var response = await fetch('http://localhost:3001/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rootNode: rootNode, ownerId: ownerId, projectName: projectName, componentName: componentName})
            });
            var data = await response.json();
            
            if (data.success) {
                console.log('Share URL from server:', data.URL);
                figma.ui.postMessage({ type: 'export-success', shareUrl: data.URL });
            } else {
                figma.ui.postMessage({ type: 'error', message: data.error });
            }
        } catch (err) {
            figma.ui.postMessage({ type: 'error', message: String(err) });
        }
    }
};