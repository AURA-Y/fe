import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import unusedImports from "eslint-plugin-unused-imports";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([
  // LCP, 이미지 최적화 등)
  ...nextVitals,
  ...nextTs,
  // 어떤 파일을 검사에서 제외할지 정의
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    files: ["**/*.{ts,tsx}"], // TS/TSX 파일에만 적용
    plugins: {
      "unused-imports": unusedImports,
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    //import/order를 설정하면 여러 개발자가 협업해도 파일 상단의 import 순서가 항상 일정하게 유지되어 가독성이 비약적으로 상승합니다.
    rules: {
      ...prettierConfig.rules, // Prettier와 충돌하는 ESLint 규칙 끄기
      "prettier/prettier": [
        { singleQuote: false }, // ← Prettier 옵션 강제 적용
      ],
      "no-console": "warn", // 상용 코드에 console.log 남기지 않기
      "@typescript-eslint/no-explicit-any": "error", // any 타입 엄격 금지
      "unused-imports/no-unused-imports": "error", // 안 쓰는 import는 에러로 처리
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal"],
          alphabetize: { order: "asc" },
        },
      ],
      quotes: ["error", "double"], // ' ' 강제
    },
  },
]);

export default eslintConfig;
