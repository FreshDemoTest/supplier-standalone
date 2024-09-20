// material
import {
  Box,
  Grid,
  TableCell,
  TableRow,
  Typography,
  styled
} from '@mui/material';
// utils
import { fCurrency } from '../../utils/helpers';

// ----------------------------------------------------------------------

export const RowResultStyle = styled(TableRow)(({ theme }) => ({
  '& td': {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  }
}));

export const RemisionGridStyle = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  textAlign: 'left'
  // [theme.breakpoints.up('md')]: {
  //   textAlign: 'right'
  // }
}));

// ----------------------------------------------------------------------

type SummaryRowProps = {
  label: string;
  value: number | undefined;
  rowSx?: any;
  sx?: any;
  colSpan?: number;
  contentColSpan?: number;
};

export const SummaryRow = ({
  label,
  value,
  rowSx = {},
  sx = {},
  colSpan = 1,
  contentColSpan = 2
}: SummaryRowProps) => {
  return (
    <RowResultStyle sx={{ ...rowSx }}>
      <TableCell colSpan={colSpan} />
      <TableCell align="right" colSpan={contentColSpan}>
        <Box />
        <Typography variant="body2" sx={{ ...sx }}>
          {label}
        </Typography>
      </TableCell>
      <TableCell align="center" width={80}>
        <Box />
        <Typography variant="body1" sx={{ ...sx }}>
          {fCurrency(value)}
        </Typography>
      </TableCell>
    </RowResultStyle>
  );
};

export const SummaryRowPdf = ({
  label,
  value,
  rowSx = {},
  sx = {},
  colSpan = 2,
  contentColSpan = 2
}: SummaryRowProps) => {
  return (
    <TableRow sx={{ ...rowSx }}>
      <TableCell sx={{ pt: 0 }} colSpan={colSpan} />
      <TableCell sx={{ pt: 0 }} align="right" colSpan={contentColSpan}>
        <Typography variant="body2" sx={{ ...sx }}>
          {label}
        </Typography>
      </TableCell>
      <TableCell sx={{ pt: 0 }} align="center" width={80}>
        <Typography variant="body2" sx={{ ...sx }}>
          {fCurrency(value)}
        </Typography>
      </TableCell>
    </TableRow>
  );
};
