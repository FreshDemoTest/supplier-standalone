// material
import { Avatar, useTheme } from '@mui/material';

// ----------------------------------------------------------------------

type MAvatarProps = {
  src?: string;
  children?: any;
  sx?: any;
  alt?: string;
  color?: string;
  other?: Array<any>;
};

const MAvatar: React.FC<MAvatarProps> = ({
  src,
  color = 'default',
  sx,
  alt = '',
  children,
  ...other
}) => {
  const theme = useTheme();

  if (color === 'default') {
    return (
      <Avatar src={src} alt={alt} sx={sx} {...other}>
        {children}
      </Avatar>
    );
  }

  return (
    <Avatar
      src={src}
      alt={alt}
      sx={{
        fontWeight: theme.typography.fontWeightRegular,
        color: `${color}.contrastText`,
        backgroundColor: `${color}.main`,
        ...sx
      }}
      {...other}
    >
      {children}
    </Avatar>
  );
};

export default MAvatar;
