import React from 'react';
import { Stack, Text } from '@chakra-ui/react';
import BloqueTexto from './blocks/BloqueTexto';
import BloqueImagen from './blocks/BloqueImagen';
import BloqueCodigo from './blocks/BloqueCodigo';
import BloqueEcuacion from './blocks/BloqueEcuacion';
import BloqueLista from './blocks/BloqueLista';
import BloqueTabla from './blocks/BloqueTabla';
import { getImageUrl } from '../api/problemService';

const BlockRenderer = ({ contenido = [] }) => {
  const renderBlock = (bloque, index) => {
    const props = { ...bloque, editable: false };

    switch (bloque.tipo) {
      case 'texto':
        return <BloqueTexto key={index} {...props} />;
      case 'imagen':
        return (
          <BloqueImagen
            key={index}
            editable={false}
            url={getImageUrl(bloque.url)}
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

  return <Stack spacing={4}>{contenido.map((bloque, i) => renderBlock(bloque, i))}</Stack>;
};

export default BlockRenderer;
