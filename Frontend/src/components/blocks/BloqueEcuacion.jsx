import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Center,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  Wrap,
  WrapItem,
  VStack,
} from "@chakra-ui/react";
import "mathlive";

const AUTOCOMPLETE_LATEX = [
  "alpha",
  "beta",
  "theta",
  "pi",
  "lambda",
  "omega",
  "frac",
  "sqrt",
  "sum",
  "int",
  "infty",
  "sin",
  "cos",
  "tan",
  "log",
  "ln",
  "vec",
  "cdot",
  "times",
  "div",
  "rightarrow",
  "left",
  "right",
];

const findLatexPrefix = (text, cursorPos) => {
  const safePos = Math.max(0, cursorPos ?? 0);
  const chunk = text.slice(0, safePos);
  const match = chunk.match(/\\[a-zA-Z]*$/);
  if (!match) return null;

  return {
    command: match[0].slice(1),
    start: safePos - match[0].length,
    end: safePos,
  };
};

const BloqueEcuacion = ({ contenido, editable, onChange }) => {
  const [sugerencias, setSugerencias] = useState([]);
  const [prefijoInfo, setPrefijoInfo] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const inputRef = useRef(null);
  const editorRef = useRef(null);
  const previewEditableRef = useRef(null);
  const previewReadOnlyRef = useRef(null);

  useEffect(() => {
    const mf = editorRef.current;
    if (!mf) return;

    const handleInput = () => {
      const latex = mf.getValue ? mf.getValue("latex") : "";
      onChange({ contenido: latex });
    };

    mf.addEventListener("input", handleInput);
    return () => mf.removeEventListener("input", handleInput);
  }, [onChange]);

  useEffect(() => {
    const mf = editorRef.current;
    if (!mf) return;

    if (window.MathfieldElement) {
      window.MathfieldElement.locale = "es";
      window.MathfieldElement.fontsDirectory = "https://unpkg.com/mathlive/dist/fonts";
    }
  }, []);

  useEffect(() => {
    const mf = editorRef.current;
    if (!mf || tabIndex !== 1) return;

    const value = contenido || "";
    const current = mf.getValue ? mf.getValue("latex") : "";
    if (current !== value && mf.setValue) {
      mf.setValue(value, { silenceNotifications: true });
    }
  }, [contenido, tabIndex]);

  useEffect(() => {
    const value = contenido || "";
    const previews = [previewEditableRef.current, previewReadOnlyRef.current];
    previews.forEach((preview) => {
      if (!preview || !preview.setValue) return;
      const current = preview.getValue ? preview.getValue("latex") : "";
      if (current !== value) {
        preview.setValue(value, { silenceNotifications: true });
      }
    });
  }, [contenido]);

  const applyTextUpdate = (nextValue, nextCursor) => {
    onChange({ contenido: nextValue });
    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      inputRef.current.focus();
      if (typeof nextCursor === "number") {
        inputRef.current.setSelectionRange(nextCursor, nextCursor);
      }
    });
  };

  const handleChange = (value, cursorPos) => {
    onChange({ contenido: value });

    const prefijo = findLatexPrefix(value, cursorPos);
    if (!prefijo || prefijo.command.length === 0) {
      setSugerencias([]);
      setPrefijoInfo(null);
      return;
    }

    const filtered = AUTOCOMPLETE_LATEX.filter((cmd) => cmd.startsWith(prefijo.command)).slice(0, 6);
    setSugerencias(filtered);
    setPrefijoInfo(prefijo);
  };

  const aplicarSugerencia = (cmd) => {
    if (!prefijoInfo) return;
    const actual = contenido || "";
    const nuevo = `${actual.slice(0, prefijoInfo.start)}\\${cmd} ${actual.slice(prefijoInfo.end)}`;
    const nuevaPos = prefijoInfo.start + cmd.length + 2;

    setSugerencias([]);
    setPrefijoInfo(null);
    applyTextUpdate(nuevo, nuevaPos);
  };

  if (!editable) {
    return (
      <Center>
        <Box
          bg="gray.50"
          px={3}
          py={2}
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          w="full"
        >
          <math-field
            ref={previewReadOnlyRef}
            read-only
            virtual-keyboard-mode="off"
            className="mf-claro"
            style={{
              minHeight: "70px",
              width: "100%",
              fontSize: "1.1rem",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              background: "#FFFFFF",
              color: "#1A202C",
              ["--caret-color"]: "transparent",
            }}
          >
            {contenido || ""}
          </math-field>
        </Box>
      </Center>
    );
  }

  return (
    <VStack align="stretch" spacing={3}>
      {tabIndex === 0 ? (
        <Box
          bg="gray.50"
          px={3}
          py={2}
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
        >
          <math-field
            ref={previewEditableRef}
            read-only
            virtual-keyboard-mode="off"
            className="mf-claro"
            style={{
              minHeight: "70px",
              width: "100%",
              fontSize: "1.1rem",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              background: "#FFFFFF",
              color: "#1A202C",
              ["--caret-color"]: "transparent",
            }}
          >
            {contenido || ""}
          </math-field>
        </Box>
      ) : (
        <Box
          border="1px solid"
          borderColor="blue.100"
          borderRadius="md"
          px={3}
          py={2}
          bg="blue.50"
        >
          <math-field
            ref={editorRef}
            className="mf-claro"
            virtual-keyboard-mode="onfocus"
            style={{
              minHeight: "84px",
              width: "100%",
              fontSize: "1.1rem",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #BEE3F8",
              background: "#FFFFFF",
              color: "#1A202C",
              boxShadow: "inset 0 0 0 1px #EBF8FF",
              ["--caret-color"]: "#2563EB",
              ["--selection-background-color"]: "#DBEAFE",
            }}
            smart-mode
          >
            {contenido || ""}
          </math-field>
          <Text mt={2} fontSize="xs" color="blue.700">
            Editor visual activo: escribe directo o usa el teclado del sistema.
          </Text>
        </Box>
      )}

      <Tabs variant="enclosed" index={tabIndex} onChange={setTabIndex}>
        <TabList>
          <Tab>Codigo LaTeX</Tab>
          <Tab>Editor Visual</Tab>
        </TabList>

        <TabPanels mt={3}>
          <TabPanel p={0}>
            <VStack align="stretch" spacing={2}>
              <Textarea
                ref={inputRef}
                value={contenido}
                onClick={(e) => handleChange(e.target.value, e.target.selectionStart)}
                onKeyUp={(e) => handleChange(e.currentTarget.value, e.currentTarget.selectionStart)}
                onChange={(e) => handleChange(e.target.value, e.target.selectionStart)}
                placeholder="Escribe codigo LaTeX..."
                fontFamily="mono"
                fontSize="md"
                borderRadius="md"
                p={2}
                minH="110px"
                aria-label="Editor de ecuacion en LaTeX"
              />

              {sugerencias.length > 0 && (
                <Wrap spacing={2}>
                  <WrapItem>
                    <Text fontSize="xs" color="gray.600">
                      Autocompletar:
                    </Text>
                  </WrapItem>
                  {sugerencias.map((cmd) => (
                    <WrapItem key={cmd}>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="blue"
                        onClick={() => aplicarSugerencia(cmd)}
                      >
                        \{cmd}
                      </Button>
                    </WrapItem>
                  ))}
                </Wrap>
              )}
            </VStack>
          </TabPanel>

          <TabPanel p={0}>
            <Text fontSize="sm" color="gray.600">
              El editor visual reemplaza el teclado personalizado para una experiencia mas limpia.
            </Text>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default BloqueEcuacion;
