// material
import { Breakpoint, Theme, useMediaQuery } from '@mui/material';

// ----------------------------------------------------------------------
type Width = 'xsDown' | 'smDown' | 'mdDown' | 'lgDown' | 'xlDown' | 'xsUp' | 'smUp' | 'mdUp' | 'lgUp' | 'xlUp';

type MHiddenProps = {
  children: any,
  width: Width
};

const MHidden:React.FC<MHiddenProps> = ({ width, children }) => {
  const breakpoint = width.substring(0, 2) as Breakpoint;

  const hiddenUp = useMediaQuery((th: Theme) => {
      return (th.breakpoints.up(breakpoint));
  });
  const hiddenDown = useMediaQuery((th: Theme) => {
    return (th.breakpoints.down(breakpoint))
  });

  if (width.includes('Down')) {
    return hiddenDown ? null : children;
  }

  if (width.includes('Up')) {
    return hiddenUp ? null : children;
  }

  return null;
}


export default MHidden;