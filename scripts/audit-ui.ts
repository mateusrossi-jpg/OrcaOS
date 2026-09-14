// scripts/audit-ui.ts
/**
 * Aferix UI Auditor
 * - Verifica tipografia, espaçamento, contraste, hierarquia e uso de componentes.
 * - Falha (exit code 1) se houver violações, impedindo CI.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { Node, Project, SourceFile, SyntaxKind } from "ts-morph";
import { parse } from "css";
import tinycolor from "tinycolor2";

type OptionalNames = {
  getNameNode?: () => Node | undefined;
  getDeclarationName?: () => Node | undefined;
  getName?: () => string;
};
const optional = (node: Node) => node as Node & OptionalNames;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.resolve(__dirname, "audit-config.json");
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));

let violations = 0;
function report(msg: string) {
  violations++;
  console.error(`❌  ${msg}`);
}
function ok(msg: string) {
  console.log(`✅  ${msg}`);
}

const HTML_TAGS = new Set([
  "div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li",
  "a", "button", "img", "svg", "path", "input", "select", "option", "optgroup",
  "datalist", "textarea", "label", "form", "fieldset", "legend", "output",
  "section", "article", "header", "footer", "main", "aside", "nav",
  "table", "thead", "tbody", "tfoot", "tr", "td", "th", "caption", "col",
  "colgroup", "strong", "em", "small", "i", "br", "hr", "pre", "code",
  "figure", "figcaption", "details", "summary", "blockquote", "time", "abbr",
  "u", "b", "s", "mark", "sub", "sup", "wbr", "ruby", "rt", "rp", "bdi",
  "bdo", "data", "del", "ins", "kbd", "q", "samp", "address", "cite", "dfn",
  "audio", "video", "source", "track", "canvas", "progress", "meter", "dialog",
  "template", "slot", "iframe", "object", "param", "embed", "area", "map",
  "picture", "portal", "body", "html", "head", "title", "meta", "link", "base",
  "defs", "linearGradient", "radialGradient", "stop", "clipPath", "mask",
  "symbol", "marker", "filter", "tspan", "textPath", "use", "g", "circle",
  "rect", "line", "polyline", "polygon", "ellipse", "foreignObject",
  "pattern", "feGaussianBlur", "feMerge", "feMergeNode", "feOffset",
  "feFlood", "feComposite", "feBlend", "feDropShadow", "feTurbo",
]);

function collectDeclaredIdentifiers(sourceFile: SourceFile): Set<string> {
  const declared = new Set<string>();
  for (const node of sourceFile.getDescendants()) {
    const kind = node.getKind();
    const addName = (n: Node | string | undefined) => {
      if (!n) return;
      const name = typeof n === 'string' ? n : n.getText();
      if (name && /^[A-Za-z_$][\w$]*$/.test(name)) declared.add(name);
    };
    if (kind === SyntaxKind.VariableDeclaration ||
        kind === SyntaxKind.FunctionDeclaration ||
        kind === SyntaxKind.ClassDeclaration ||
        kind === SyntaxKind.TypeAliasDeclaration ||
        kind === SyntaxKind.Parameter ||
        kind === SyntaxKind.BindingElement ||
        kind === SyntaxKind.CatchClause) {
      const named = optional(node);
      addName(named.getNameNode?.() ?? named.getDeclarationName?.() ?? named.getName?.());
    }
    if (kind === SyntaxKind.ImportSpecifier || kind === SyntaxKind.ImportClause) {
      addName(optional(node).getName?.());
    }
  }
  return declared;
}

function resolveColor(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^var\(--([\w-]+)/);
  if (match) {
    const resolved = config.contrast.vars?.[`--${match[1]}`];
    if (resolved) return resolved;
  }
  return trimmed;
}

function colorAlpha(value: string): number | null {
  const m = value.trim().match(/rgba?\(([^)]+)\)|hsla?\(([^)]+)\)/);
  const parts = (m?.[1] ?? m?.[2] ?? "").split(/[\s,]+/).map(Number);
  if (parts.length >= 4 && Number.isFinite(parts[3])) return parts[3];
  if (m?.[0]?.startsWith("rgba") || m?.[0]?.startsWith("hsla")) return 1;
  const hex = value.trim().match(/^#([0-9a-f]{8})$/i);
  if (hex) return parseInt(hex[1].slice(6, 8), 16) / 255;
  return null;
}

function hasContrast(fg: string, bg: string): boolean | null {
  const resolvedFg = resolveColor(fg);
  const resolvedBg = resolveColor(bg);
  if (!tinycolor(resolvedFg).isValid() || !tinycolor(resolvedBg).isValid()) return null;
  const fgAlpha = colorAlpha(resolvedFg);
  const bgAlpha = colorAlpha(resolvedBg);
  if ((fgAlpha !== null && fgAlpha < 0.97) || (bgAlpha !== null && bgAlpha < 0.97)) return null;
  const ratio = tinycolor.readability(resolvedFg, resolvedBg);
  return ratio >= (config.contrast.minRatio ?? 4.5);
}

function checkJSX(filePath: string, source: string) {
  const project = new Project({ useInMemoryFileSystem: true });
  const ext = filePath.endsWith(".ts") ? "tmp.ts" : "tmp.tsx";
  const sourceFile = project.createSourceFile(ext, source);

  const imported = new Set<string>();
  for (const decl of sourceFile.getImportDeclarations()) {
    for (const spec of decl.getNamedImports()) imported.add(spec.getName());
  }
  const declared = collectDeclaredIdentifiers(sourceFile);

  sourceFile.forEachDescendant(node => {
    if (node.getKind() !== SyntaxKind.JsxOpeningElement) return;
    const nameNode = node.getFirstChildByKind(SyntaxKind.Identifier);
    const name = nameNode?.getText() ?? "";
    if (!name) return;

    const allowed = config.components.allowed;
    if (allowed.includes(name)) return;
    if (!HTML_TAGS.has(name) && !imported.has(name) && !declared.has(name)) {
      report(`Componente não‑importado (possível tecla/token indevido ou primitiva de fora do design system) '${name}' em ${filePath}`);
    }

    for (const attr of node.getAttributes()) {
      const attrName = attr.getFirstChildByKind(SyntaxKind.Identifier)?.getText();
      if (attrName !== "className") continue;
      const literal = attr.getFirstChildByKind(SyntaxKind.StringLiteral);
      if (!literal) continue;
      const className = literal.getLiteralText();
      for (const token of className.split(/\s+/)) {
        const m = token.match(/^text-(h1|h2|h3|body|caption)$/);
        if (m && !config.typography.sizes[m[1]]) {
          report(`Classe tipográfica fora do scale '${token}' em ${filePath}`);
        }
      }
    }
  });
}

function checkCSS(filePath: string, cssContent: string) {
  const ast = parse(cssContent);
  for (const rule of ast.stylesheet?.rules ?? []) {
    if (rule.type !== "rule") continue;
    const declarations = (rule as any).declarations;
    let fg = "";
    let bg = "";
    for (const decl of declarations) {
      if (!decl.property) continue;
      if (decl.property === "color") fg = decl.value;
      if (decl.property === "background" || decl.property === "background-color") bg = decl.value;
    }
    if (fg && bg) {
      const ok = hasContrast(fg, bg);
      if (ok === false) {
        const resolvedFg = resolveColor(fg);
        const resolvedBg = resolveColor(bg);
        const ratio = tinycolor.readability(resolvedFg, resolvedBg);
        report(`Contraste insuficiente (${ratio.toFixed(2)}:1) em ${filePath} → ${rule.selectors?.join(", ")}`);
      }
    }
  }
}

function runAudit() {
  const srcRoot = path.resolve(__dirname, "..", "src");
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))
        checkJSX(full, fs.readFileSync(full, "utf-8"));
      else if (entry.name.endsWith(".css") || entry.name.endsWith(".module.css"))
        checkCSS(full, fs.readFileSync(full, "utf-8"));
    }
  };
  walk(srcRoot);
  if (violations > 0) {
    console.error(`❌ Auditoria UI falhou com ${violations} violação(ões).`);
    process.exit(1);
  }
  ok("Auditoria concluída sem violações.");
  process.exit(0);
}

runAudit();
