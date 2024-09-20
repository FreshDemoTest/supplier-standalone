// material
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme,
  Checkbox
} from '@mui/material';
// hooks

// ----------------------------------------------------------------------
type SelectCardItemProps = {
  title: string;
  subtitle: string;
  rightTag?: { key?: string; label: string; bgColor?: string };
  onClick?: () => void;
  checked: boolean;
};

const SelectCardItem: React.FC<SelectCardItemProps> = ({
  title,
  subtitle,
  rightTag,
  onClick = () => {},
  checked
}) => {
  const theme = useTheme();
  const midColSize = rightTag ? 6 : 10;
  const rightColSize = rightTag ? 4 : 0;
  return (
    <Card
      sx={{
        mb: theme.spacing(0.5),
        boxShadow: theme.shadows[4]
      }}
      onClick={onClick}
    >
      <CardContent sx={{ cursor: 'pointer' }}>
        <Grid container spacing={0} sx={{ mt: theme.spacing(0.5) }}>
          {/* Left column */}
          <Grid
            item
            xs={2}
            lg={2}
            sx={{ mt: { xs: theme.spacing(1), md: theme.spacing(1) } }}
          >
            <Checkbox checked={checked} sx={{ px: theme.spacing(0) }} />
          </Grid>
          {/* Mid column */}
          <Grid item xs={midColSize} lg={6}>
            <Typography variant="subtitle1">
              {title}
            </Typography>
            <Typography variant="body2" color={'text.secondary'} noWrap>
              {subtitle}
            </Typography>
          </Grid>
          {/* Right column */}
          <Grid item xs={rightColSize} lg={3} sx={{ textAlign: 'right' }}>
            <Box sx={{ mt: theme.spacing(2) }}>
              {rightTag && (
                <Typography
                  variant="subtitle2"
                  sx={{ color: theme.palette.info.main }}
                  noWrap
                >
                  <u>{rightTag?.label}</u>
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SelectCardItem;
