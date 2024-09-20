import { PaletteColor, Theme } from "@mui/material"

export const getColor = (theme:Theme, color:string):PaletteColor => {
    const colorOptions = Object.entries(theme.palette);
    const selectedColor = colorOptions.find((vs) => vs[0] === color);
    if (selectedColor === undefined || selectedColor === null ) {
        return theme.palette.info;  // This is a default value to avoid runtime issues
    } 
    return selectedColor[1];
};