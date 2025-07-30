import React, { useState, useEffect } from 'react';
import { Box, Button, Flex, Text, VStack,HStack, Menu, MenuButton, MenuList, MenuItem, useOutsideClick,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody, } from '@chakra-ui/react';
import { getImageUrl } from '../api/problemService';
import BloqueTexto from './blocks/BloqueTexto';
import BloqueImagen from './blocks/BloqueImagen';
import BloqueCodigo from './blocks/BloqueCodigo';
import BloqueEcuacion from './blocks/BloqueEcuacion';
import BloqueLista from './blocks/BloqueLista';
import BloqueTabla from './blocks/BloqueTabla';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';

const BlockRenderer = ({ contenido = [], onBlockChange = () => {}, onArchivo = () => {} }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(null);
  const menuRef = React.useRef();

  useOutsideClick({
    ref: menuRef,
    handler: () => setMenuAbierto(null),
  });

  const editable = true;

  const handleChange = (index, cambio) => {
  const nuevos = [...contenido];

  // Mezclamos el bloque actual con los cambios que vienen
  nuevos[index] = { ...nuevos[index], ...cambio };

  // Si viene un archivo, actualizamos además la preview/nombre
  if (cambio.file) {
    nuevos[index].url = cambio.nombre;
    nuevos[index].preview = cambio.urlPreview;
    onArchivo(cambio.file);
  }

  onBlockChange(nuevos);
};

  const handleDeleteBlock = (index) => {
    const copia = [...contenido];
    copia.splice(index, 1);

    if (copia.length === 0) {
      copia.push({ tipo: 'texto', contenido: '' });
    }

    onBlockChange(copia);
  };

  const handleInsertImage = (index) => {
    const nuevoBloque = {
      id: uuidv4(),
      tipo: 'imagen',
      url: '',
      preview: '',
    };
    const copia = [...contenido];
    copia.splice(index + 1, 0, nuevoBloque);
    onBlockChange(copia);
    setMenuAbierto(null);
  };

  const handleInsertBlock = (index) => {
    const nuevoBloque = {
      id: uuidv4(),
      tipo: 'texto',
      contenido: '',
    };
    const copia = [...contenido];
    copia.splice(index + 1, 0, nuevoBloque);
    onBlockChange(copia);
    setMenuAbierto(null);
  };

  const handleConvertBlock = (index, nuevoTipo) => {
    const actual = contenido[index];
    const id = actual.id;
    let nuevoBloque;

    switch (nuevoTipo) {
      case 'texto':
        nuevoBloque = { id, tipo: 'texto', contenido: '' };
        break;
      case 'codigo':
        nuevoBloque = { id, tipo: 'codigo', lenguaje: 'python', contenido: '' };
        break;
      case 'ecuacion':
        nuevoBloque = { id, tipo: 'ecuacion', contenido: '' };
        break;
      case 'lista':
        nuevoBloque = { id, tipo: 'lista', estilo: 'viñetas', items: [''] };
        break;
      case 'tabla':
        nuevoBloque = { id, tipo: 'tabla', encabezados: [''], filas: [['']] };
        break;
      default:
        return;
    }

    const copia = [...contenido];
    copia[index] = nuevoBloque;
    onBlockChange(copia);
  };

  const handleContextMenu = (e, index) => {
    e.preventDefault();
    setMenuAbierto(index);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(contenido);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    onBlockChange(items);
  };

  const renderBlock = (bloque, index) => {
    const props = {
      ...bloque,
      editable,
      onChange: (cambios) => handleChange(index, cambios),
    };

    switch (bloque.tipo) {
      case 'texto':
        return <BloqueTexto key={index} {...props} />;
      case 'imagen':
        return (
          <BloqueImagen
            key={index}
            editable={editable}
            url={bloque.preview || getImageUrl(bloque.url)}
            onChange={(cambio) => handleChange(index, cambio)}
          />
        );
      case 'codigo':
        return <BloqueCodigo key={index} {...props} />;
      case 'ecuacion':
        return <BloqueEcuacion key={index} {...props} />;
      case 'lista':
        return <BloqueLista key={index} {...props} />;
      case 'tabla':
        return <BloqueTabla key={index} {...props} />;
      default:
        return (
          <Text key={index} color="red.500">
            (Bloque no soportado: {bloque.tipo})
          </Text>
        );
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="bloques">
        {(provided) => (
          <VStack {...provided.droppableProps} ref={provided.innerRef} spacing={4} align="stretch">
            {contenido.map((bloque, index) => (
              <Draggable draggableId={bloque.id} index={index} key={bloque.id}>
                {(draggableProvided) => (
                  <Box
                    ref={draggableProvided.innerRef}
                    {...draggableProvided.draggableProps}
                    {...draggableProvided.dragHandleProps}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onContextMenu={(e) => handleContextMenu(e, index)}
                    position="relative"
                  >
                    <Popover offset={[0, 0]} trigger="hover" placement="left-start" closeOnBlur>
                      <PopoverTrigger>
                        <Box>
                          {renderBlock(bloque, index)}

                          {menuAbierto === index && (
                            <Box
                              ref={menuRef}
                              position="absolute"
                              top="40px"
                              left="20px"
                              bg="white"
                              border="1px solid"
                              borderColor="gray.200"
                              shadow="md"
                              p={2}
                              zIndex={10}
                              rounded="md"
                            >
                              <Menu isLazy>
                                <MenuButton as={Button} size="sm" width="100%">
                                  Convertir en
                                </MenuButton>
                                <MenuList>
                                  {['texto', 'codigo', 'ecuacion', 'lista', 'tabla'].map((tipo) => (
                                    <MenuItem
                                      key={tipo}
                                      onClick={() => {
                                        handleConvertBlock(index, tipo);
                                        setMenuAbierto(null);
                                      }}
                                    >
                                      {tipo}
                                    </MenuItem>
                                  ))}
                                </MenuList>
                              </Menu>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleInsertImage(index)}
                                mt={2}
                              >
                                Añadir imagen
                              </Button>

                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDeleteBlock(index)}
                                mt={1}
                              >
                                Eliminar
                              </Button>
                            </Box>
                          )}
                        </Box>
                      </PopoverTrigger>
                      <PopoverContent border="none" boxShadow="none" bg="white" width="auto" p={2}>
                        <PopoverBody>
                          <HStack spacing={1}>
                            <Button size="xs" onClick={() => handleInsertBlock(index)}>
                              +
                            </Button>
                            <Text fontSize="xs" color="gray.500" cursor="grab">
                              #
                            </Text>
                          </HStack>
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                    

                    
                  </Box>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </VStack>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default BlockRenderer;
