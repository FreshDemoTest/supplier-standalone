// material
import { keyframes, styled } from '@mui/material';
import React from 'react';

// ----------------------------------------------------------------------

type ImgLogoProps = {
  width?: number;
  height?: number;
  sx?: Object;
};

const ImgKeyframes = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const ImgLogoStyle = styled('img')(({ theme }) => ({
  pointerEvents: 'none',
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${ImgKeyframes} infinite 20s linear`
  }
}));

const ImagoType: React.FC<ImgLogoProps> = ({
  width = 200,
  height = 200,
  sx = { borderRadius: '50%' }
}) => {
  return (
    <ImgLogoStyle
      src="/static/assets/alima/alima-leaf.jpg"
      height={height}
      width={width}
      sx={sx}
    />
  );
};

export default ImagoType;
