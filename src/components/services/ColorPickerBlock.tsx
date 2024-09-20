import React, { useState, useRef } from 'react';
import { Grid, Box, Button } from '@mui/material';
import { BlockPicker, ColorResult } from 'react-color';
import { useTheme } from "@mui/material";

type ColorPickerBlockProps = {
  colors: string[];
  size: number;
  setColors: React.Dispatch<React.SetStateAction<string[]>>;
};

const ColorPickerBlock: React.FC<ColorPickerBlockProps> = ({ colors, size, setColors }) => {
  const [currentColor, setCurrentColor] = useState(colors[0]);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const theme = useTheme();
  const [pickerPosition, setPickerPosition] = useState<{ top: number; left: number } | null>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleClick = (index: number) => {
    setCurrentColor(colors[index]);
    setSelectedBlock(index);

    const block = blockRefs.current[index];
    if (block) {
      const rect = block.getBoundingClientRect();
      setPickerPosition({
        top: rect.top + window.scrollY + size + 10,
        left: rect.left + window.scrollX - 70
      });
    }
    setShowColorPicker(true);
  };

  const handleCloseColorPicker = () => {
    setShowColorPicker(false);
    setSelectedBlock(null);
    setPickerPosition(null);
  };

  const handleColorChange = (color: ColorResult) => {
    setCurrentColor(color.hex);
  };

  const handleSaveColor = () => {
    if (selectedBlock !== null) {
      const newColors = [...colors];
      newColors[selectedBlock] = currentColor;
      setColors(newColors);
      handleCloseColorPicker();
    }
  };

  return (
    <Grid container spacing={2} sx = {{px: {xs : 4, md: 3}}}>
      {colors.map((color, index) => (
        <Grid item key={index} xs = {6} md={4} sx = {{display: 'flex', justifyContent: 'center'}}>
          <div
            ref={(el) => (blockRefs.current[index] = el)}
            style={{
              width: size,
              height: size,
              backgroundColor: color,
              cursor: 'pointer',
              border: `1px solid ${theme.palette.text.secondary}`,
	            borderRadius: 2
            }}
            onClick={() => handleClick(index)}
          />
        </Grid>
      ))}
      {showColorPicker && pickerPosition && (
        <Box
          position="absolute"
          top={pickerPosition.top}
          left={pickerPosition.left}
          zIndex={1000}
          bgcolor="white"
          p={2}
          borderRadius={1}
          boxShadow={0}
        >
          <BlockPicker
            color={currentColor}
            onChange={handleColorChange}
            width='150px'
            colors={[
              "#000000", "#545454", "#737373", "#A6A6A6", "#D9D9D9", "#FFFFFF",
              "#EA473E", "#EC635E", "#ED70C0", "#BE71DF", "#866BF6", "#5F5FE2",
              "#4294AE", "#57BDDB", "#81DEE4", "#5FB3F8", "#5870F6", "#1C48A6",
              "#55BC6C", "#93D668", "#CAEF85", "#F9DF6F", "#F5BF6A", "#F0975B"
          ]}
          />
          <Button
            variant="contained"
            size="medium"
            onClick={handleSaveColor}
            style={{ width: '70%', marginTop: '8px' }} // Adjust marginTop as needed
          >
            Aplicar color
          </Button>
          <Button
            variant="contained"
            size="medium"
            onClick={handleCloseColorPicker}
            color="error"
            style={{ width: '70%', marginTop: '8px' }} // Adjust marginTop as needed
          >
            Cancelar
          </Button>
        </Box>
      )}
    </Grid>
  );
};

export default ColorPickerBlock;