import { CodeGenerator } from '../codeGenerator';

describe('CodeGenerator', () => {
  let generator: CodeGenerator;

  beforeEach(() => {
    generator = new CodeGenerator();
  });

  describe('sanitizeClassName', () => {
    it('преобразует имя в kebab-case', () => {
      const result = (generator as any).sanitizeClassName('Hero Section');
      expect(result).toBe('hero-section');
    });

    it('удаляет спецсимволы и дефисы в конце', () => {
      const result = (generator as any).sanitizeClassName('Button!@#');
      expect(result).toBe('button');
    });

    it('заменяет пробелы на дефисы', () => {
      const result = (generator as any).sanitizeClassName('My Awesome Component');
      expect(result).toBe('my-awesome-component');
    });
  });

  describe('sanitizeComponentName', () => {
    it('делает первую букву заглавной', () => {
      const result = (generator as any).sanitizeComponentName('button');
      expect(result).toBe('Button');
    });

    it('удаляет спецсимволы', () => {
      const result = (generator as any).sanitizeComponentName('My@Component!');
      expect(result).toBe('MyComponent');
    });

    it('возвращает Component для пустого имени', () => {
      const result = (generator as any).sanitizeComponentName('');
      expect(result).toBe('Component');
    });
  });

  describe('generateReactComponent', () => {
    it('генерирует простой React компонент', () => {
      const node = {
        nodeId: '1',
        nodeName: 'Container',
        nodeType: 'FRAME',
        children: [],
      };
      const result = generator.generateCode(node, 'MyComponent');
      expect(result.reactCode).toContain('import React from');
      expect(result.reactCode).toContain('const MyComponent');
      expect(result.reactCode).toContain('export default MyComponent');
    });

    it('обрабатывает TEXT узлы', () => {
      const node = {
        nodeId: '1',
        nodeName: 'Text',
        nodeType: 'TEXT',
        characters: 'Hello World',
      };
      const result = generator.generateCode(node, 'TextComponent');
      expect(result.reactCode).toContain('Hello World');
    });

    it('игнорирует пустые TEXT узлы', () => {
      const node = {
        nodeId: '1',
        nodeName: 'Text',
        nodeType: 'TEXT',
        characters: '   ',
      };
      const result = generator.generateCode(node, 'TextComponent');
      expect(result.reactCode).not.toContain('undefined');
    });

    it('обрабатывает Auto Layout (VERTICAL) — стили в CSS', () => {
      const node = {
        nodeId: '1',
        nodeName: 'Column',
        nodeType: 'FRAME',
        autoLayoutMode: 'VERTICAL' as const,
        gap: 16,
        padding: { top: 10, right: 10, bottom: 10, left: 10 },
        children: [],
      };
      const result = generator.generateCode(node, 'Column');
      expect(result.cssCode).toContain('display: flex');
      expect(result.cssCode).toContain('flex-direction: column');
      expect(result.cssCode).toContain('gap: 16px');
    });

    it('обрабатывает Auto Layout (HORIZONTAL) — стили в CSS', () => {
      const node = {
        nodeId: '1',
        nodeName: 'Row',
        nodeType: 'FRAME',
        autoLayoutMode: 'HORIZONTAL' as const,
        children: [],
      };
      const result = generator.generateCode(node, 'Row');
      expect(result.cssCode).toContain('display: flex');
      expect(result.cssCode).toContain('flex-direction: row');
    });

    it('обрабатывает вложенные узлы', () => {
      const node = {
        nodeId: '1',
        nodeName: 'Parent',
        nodeType: 'FRAME',
        children: [
          {
            nodeId: '2',
            nodeName: 'Child',
            nodeType: 'FRAME',
            children: [
                {
                    nodeId: '3',
                    nodeName: 'Text',
                    nodeType: 'TEXT',
                    characters: 'Hello',  // Текст нужен, чтобы узел не был пустым
                },
            ],
          },
        ],
      };
      const result = generator.generateCode(node, 'Parent');
      expect(result.reactCode).toContain('child');
      expect(result.reactCode).toContain('Hello');
    });
  });

  describe('generateHTML', () => {
    it('генерирует HTML из узла', () => {
      const node = {
        nodeId: '1',
        nodeName: 'Container',
        nodeType: 'FRAME',
        children: [
          {
            nodeId: '2',
            nodeName: 'Text',
            nodeType: 'TEXT',
            characters: 'Hello',
          },
        ],
      };
      const result = generator.generateCode(node, 'Comp');
      expect(result.htmlCode).toContain('<div class="container">');
      expect(result.htmlCode).toContain('Hello');
    });
  });

  describe('generateCSS', () => {
    it('генерирует CSS для Auto Layout', () => {
      const node = {
        nodeId: '1',
        nodeName: 'FlexContainer',
        nodeType: 'FRAME',
        autoLayoutMode: 'VERTICAL' as const,
        gap: 20,
        padding: { top: 15, right: 15, bottom: 15, left: 15 },
      };
      const result = generator.generateCode(node, 'Comp');
      expect(result.cssCode).toContain('.flexcontainer');
      expect(result.cssCode).toContain('display: flex');
      expect(result.cssCode).toContain('flex-direction: column');
      expect(result.cssCode).toContain('gap: 20px');
    });

    it('не генерирует CSS для узлов без стилей', () => {
      const node = {
        nodeId: '1',
        nodeName: 'Plain',
        nodeType: 'FRAME',
      };
      const result = generator.generateCode(node, 'Comp');
      expect(result.cssCode).toBe('');
    });
  });
});