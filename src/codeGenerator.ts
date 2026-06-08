interface FigmaNode {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  autoLayoutMode?: 'HORIZONTAL' | 'VERTICAL';
  gap?: number;
  padding?: { top: number; right: number; bottom: number; left: number };
  children?: FigmaNode[];
  characters?: string;
}

export class CodeGenerator {
  generateCode(rootNode: FigmaNode, componentName: string): {
    reactCode: string;
    htmlCode: string;
    cssCode: string;
  } {
    const reactComponent = this.generateReactComponent(rootNode, componentName);
    const htmlCode = this.generateHTML(rootNode);
    const cssCode = this.generateCSS(rootNode);

    return { reactCode: reactComponent, htmlCode, cssCode };
  }

  private generateReactComponent(node: FigmaNode, componentName: string, depth: number = 0): string {
    const indent = '   '.repeat(depth);
    const className = this.sanitizeClassName(node.nodeName);
    const validComponentName = this.sanitizeComponentName(componentName);

    // Если это корневой узел — оборачиваем в полноценный React-компонент
    if (depth === 0) {
      const childrenCode = this.generateReactComponentChildren(node, validComponentName, depth);
      return `import React from 'react';\nimport './${validComponentName}.css';\n\nconst ${validComponentName} = () => {\n  return (\n${childrenCode}\n  );\n};\n\nexport default ${validComponentName};`;
    }

    // Для вложенных узлов — обычная JSX-разметка
    return this.generateReactComponentChildren(node, validComponentName, depth);
  }

  private generateReactComponentChildren(node: FigmaNode, componentName: string, depth: number = 0): string {
    const indent = '   '.repeat(depth);
    const className = this.sanitizeClassName(node.nodeName);

    if (node.nodeType === 'TEXT') {
      if (node.characters?.startsWith('{{') && node.characters?.endsWith('}}')) {
        const propName = node.characters.slice(2, -2);
        return `${indent}{${propName}}`;
      }
      // Фильтруем пустые текстовые узлы (только пробелы, переносы строк)
      const text = node.characters?.trim();
      if (!text) return '';
      return `${indent}${text}`;
    }

    // Фильтруем пустые узлы без детей и без текста
    if (!node.children?.length && node.nodeType !== 'TEXT') {
      return '';
    }

    const styles = this.generateStyleObject(node);
    const stylesString = Object.keys(styles).length > 0 ? ` style={${JSON.stringify(styles)}}` : '';
    const childrenCode = node.children
      ?.map(child => this.generateReactComponentChildren(child, componentName, depth + 1))
      .filter(child => child !== '')
      .join('\n') || '';

    // Если нет детей и нет содержимого — пропускаем
    if (!childrenCode && node.nodeType !== 'TEXT') {
      return '';
    }

    return `${indent}<div className="${className}"${stylesString}>\n${childrenCode}\n${indent}</div>`;
  }

  private generateHTML(node: FigmaNode, depth: number = 0): string {
    const indent = '   '.repeat(depth);
    const className = this.sanitizeClassName(node.nodeName);

    if (node.nodeType === 'TEXT') {
      const text = node.characters?.trim();
      if (!text) return '';
      return `${indent}${text}`;
    }

    if (!node.children?.length && node.nodeType !== 'TEXT') {
      return '';
    }

    const childrenCode = node.children
      ?.map(child => this.generateHTML(child, depth + 1))
      .filter(child => child !== '')
      .join('\n') || '';

    if (!childrenCode) {
      return '';
    }

    return `${indent}<div class="${className}">\n${childrenCode}\n${indent}</div>`;
  }

  private generateCSS(node: FigmaNode): string {
    let css = '';
    const className = this.sanitizeClassName(node.nodeName);

    // Пропускаем узлы без стилей и пустые
    if (!node.autoLayoutMode && !node.gap && !node.padding && !node.children?.length) {
      // Если нет стилей и нет детей с CSS, не генерируем пустой класс
      if (!node.children?.some(child => this.hasStyles(child))) {
        return '';
      }
    }

    css += `.${className} {\n`;

    if (node.autoLayoutMode === 'VERTICAL') {
      css += '  display: flex;\n  flex-direction: column;\n';
    } else if (node.autoLayoutMode === 'HORIZONTAL') {
      css += '  display: flex;\n  flex-direction: row;\n';
    }

    if (node.gap) {
      css += `  gap: ${node.gap}px;\n`;
    }

    if (node.padding) {
      const { top, right, bottom, left } = node.padding;
      css += `  padding: ${top}px ${right}px ${bottom}px ${left}px;\n`;
    }

    css += '}\n\n';

    if (node.children) {
      for (const child of node.children) {
        css += this.generateCSS(child);
      }
    }

    return css;
  }

  private generateStyleObject(node: FigmaNode): Record<string, string | number> {
    const styles: Record<string, string | number> = {};

    if (node.autoLayoutMode === 'VERTICAL') {
      styles.display = 'flex';
      styles.flexDirection = 'column';
    } else if (node.autoLayoutMode === 'HORIZONTAL') {
      styles.display = 'flex';
      styles.flexDirection = 'row';
    }

    if (node.gap) {
      styles.gap = `${node.gap}px`;
    }

    if (node.padding) {
      const { top, right, bottom, left } = node.padding;
      styles.padding = `${top}px ${right}px ${bottom}px ${left}px`;
    }

    return styles;
  }

  private sanitizeClassName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')  // заменяем спецсимволы на дефис
      .replace(/-+/g, '-')          // множественные дефисы -> один
      .replace(/^-|-$/g, '');       // удаляем дефисы в начале и конце 🆕
  }
  private sanitizeComponentName(name: string): string {
    // Убираем пробелы, спецсимволы, делаем первую букву заглавной
    const cleaned = name.replace(/[^a-zA-Z0-9]/g, '');
    if (!cleaned) return 'Component';
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  private hasStyles(node: FigmaNode): boolean {
    return !!(node.autoLayoutMode || node.gap || node.padding);
  }
}