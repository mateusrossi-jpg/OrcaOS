import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist/**", "node_modules/**", "android/**", "ios/**", "docs/**", "test-results/**", "playwright-report/**"]
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      }
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    }
  },
  {
    files: ["src/app/**/*.tsx", "src/app/**/*.ts", "src/features/**/*.tsx", "src/features/**/components/**/*.tsx", "src/features/**/hooks/**/*.ts", "src/pages/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "no-restricted-imports": ["error", {
        paths: [
          {
            name: "dexie",
            message: "VIOLAÇÃO ARQUITETURAL: UI e Hooks NÃO podem importar Dexie. Use Services."
          }
        ],
        patterns: [
          {
            group: ["**/repositories/*", "**/repositories"],
            message: "VIOLAÇÃO ARQUITETURAL: UI e Hooks NÃO podem importar Repositories. Arquitetura: UI -> Hooks -> Services -> Repositories -> Storage."
          },
          {
            group: ["**/storage/*"],
            message: "VIOLAÇÃO ARQUITETURAL (LEGADO): UI e Hooks não devem acessar storage legado (localStorage) diretamente. Use Services."
          }
        ]
      }],
      "no-restricted-syntax": ["error",
        {
          selector: "MemberExpression[object.name='window'][property.name='localStorage']",
          message: "VIOLAÇÃO ARQUITETURAL: UI e Hooks não podem acessar window.localStorage."
        },
        {
          selector: "Identifier[name='localStorage']",
          message: "VIOLAÇÃO ARQUITETURAL: UI e Hooks não podem acessar localStorage."
        }
      ]
    }
  },
  {
    files: ["src/services/**/*.ts"],
    rules: {
      "no-restricted-syntax": ["error",
        {
          selector: "MemberExpression[object.name='window'][property.name='localStorage']",
          message: "VIOLAÇÃO ARQUITETURAL: Services não podem acessar window.localStorage diretamente. Use Repositories."
        },
        {
          selector: "Identifier[name='localStorage']",
          message: "VIOLAÇÃO ARQUITETURAL: Services não podem acessar localStorage. Use Repositories."
        }
      ],
      "no-restricted-imports": ["error", {
        paths: [
          {
            name: "dexie",
            message: "VIOLAÇÃO ARQUITETURAL: Services não podem importar Dexie. Arquitetura: Services -> Repositories -> Storage."
          }
        ]
      }]
    }
  },
  {
    files: ["src/repositories/**/*.ts"],
    rules: {
      "no-restricted-syntax": ["error",
        {
          selector: "MemberExpression[object.name='window'][property.name='localStorage']",
          message: "VIOLAÇÃO ARQUITETURAL: Repositories (Dexie) não devem acessar localStorage."
        }
      ]
    }
  }
);
