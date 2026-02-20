import { Box, Select, VStack, Text } from "@chakra-ui/react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
import CodeMirror from "@uiw/react-codemirror";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { sql } from "@codemirror/lang-sql";
import { cpp } from "@codemirror/lang-cpp";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { php } from "@codemirror/lang-php";
import { rust } from "@codemirror/lang-rust";
import { go } from "@codemirror/lang-go";

const LENGUAJES = [
  { label: "Bash", value: "bash" },
  { label: "C", value: "c" },
  { label: "C++", value: "cpp" },
  { label: "C#", value: "csharp" },
  { label: "CSS", value: "css" },
  { label: "Go", value: "go" },
  { label: "HTML", value: "html" },
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "JSON", value: "json" },
  { label: "Kotlin", value: "kotlin" },
  { label: "PHP", value: "php" },
  { label: "Rust", value: "rust" },
  { label: "SQL", value: "sql" },
  { label: "TypeScript", value: "typescript" },
  { label: "JSX", value: "jsx" },
  { label: "TSX", value: "tsx" },
];

const LENGUAJE_ALIAS = {
  "c++": "cpp",
  cpp: "cpp",
  "c#": "csharp",
  cs: "csharp",
  js: "javascript",
  ts: "typescript",
  shell: "bash",
  sh: "bash",
  py: "python",
};

const BloqueCodigo = ({ contenido, lenguaje, editable, onChange }) => {
  const handleLenguajeChange = (e) => {
    onChange({ lenguaje: e.target.value });
  };

  const lenguajeNormalizado =
    LENGUAJE_ALIAS[(lenguaje || "").toLowerCase()] || (lenguaje || "").toLowerCase() || "text";
  const lenguajeLabel =
    LENGUAJES.find((lang) => lang.value === lenguajeNormalizado)?.label || lenguajeNormalizado;
  const syntaxLanguage = lenguajeNormalizado;

  const getLanguageExtension = (lang) => {
    switch (lang) {
      case "javascript":
      case "jsx":
      case "typescript":
      case "tsx":
        return javascript({ jsx: lang === "jsx" || lang === "tsx", typescript: lang === "typescript" || lang === "tsx" });
      case "python":
        return python();
      case "java":
        return java();
      case "sql":
        return sql();
      case "cpp":
      case "c":
      case "csharp":
        return cpp();
      case "css":
        return css();
      case "html":
        return html();
      case "json":
        return json();
      case "php":
        return php();
      case "rust":
        return rust();
      case "go":
        return go();
      default:
        return [];
    }
  };

  return (
    <VStack align="stretch" spacing={3}>
      {editable ? (
        <Select value={lenguaje} onChange={handleLenguajeChange}>
          {LENGUAJES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </Select>
      ) : (
        <Text fontSize="sm" fontWeight="bold" color="gray.600">
          Lenguaje: {lenguajeLabel}
        </Text>
      )}

      {editable ? (
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
          <CodeMirror
            value={contenido || ""}
            height="220px"
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              highlightActiveLine: true,
              tabSize: 2,
            }}
            extensions={[getLanguageExtension(syntaxLanguage), keymap.of([indentWithTab])]}
            onChange={(value) => onChange({ contenido: value })}
          />
        </Box>
      ) : (
        <Box
          bg="gray.100"
          borderRadius="md"
          overflowX="auto"
        >
          <SyntaxHighlighter
            language={syntaxLanguage}
            style={coy}
            showLineNumbers
            customStyle={{ margin: 0, padding: "12px", background: "transparent" }}
            codeTagProps={{ style: { fontFamily: "monospace" } }}
          >
            {contenido || ""}
          </SyntaxHighlighter>
        </Box>
      )}
    </VStack>
  );
};

export default BloqueCodigo;
