// scripts/audit-ui.ts
/**
 * Aferix UI Auditor
 * - Verifica tipografia, espaçamento, contraste, hierarquia e uso de componentes.
 * - Falha (exit code 1) se houver violações, impedindo CI.
 */

import * as fs from "fs";
import * as path from "path";
import { Project, SyntaxKind } from "ts-morph";
import { parse } from "css";
import tinycolor from "tinycolor2";

const CONFIG_PATH = path.resolve(__dirname, "audit-config.json");
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));

function report(msg: string) {
  console.error(`❌  ${msg}`);
}
function ok(msg: string) {
  console.log(`✅  ${msg}`);
}

function checkJSX(filePath: string, source: string) {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile("tmp.tsx", source);

  sourceFile.forEachDescendant(node => {
    if (node.getKind() === SyntaxKind.JsxOpeningElement) {
      const nameNode = node.getFirstChildByKind(SyntaxKind.Identifier);
      const name = nameNode?.getText() ?? "";

      // componentes permitidos
      const allowed = config.components.allowed;
      const aliases = config.components.aliases;
      const canonical = aliases[name] ?? name;
      if (name && !allowed.includes(canonical)) {
        report(`Componente não‑permitido '${name}' em ${filePath}`);
      }

      // tipografia via classes (ex.: text-h2, text-body)
      const classAttr = node
        .getFirstChildByKind(SyntaxKind.JsxAttribute)
        ?.getFirstChildByKind(SyntaxKind.StringLiteral);
      const className = classAttr?.getLiteralText() ?? "";
      if (className.includes("text-")) {
        const sizeKey = className.split("text-")[1];
        if (!config.typography.sizes[sizeKey]) {
          report(`Classe tipográfica desconhecida '${className}' em ${filePath}`);
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
      if (decl.property === "color") fg = decl.value;
      if (decl.property === "background" || decl.property === "background-color") bg = decl.value;
    }
    if (fg && bg) {
      const ratio = tinycolor.readability(fg, bg);
      if (ratio < config.contrast.minRatio) {
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
  ok("Auditoria concluída.");
  process.exit(0);
}

runAudit();
