import * as React from 'react';
import { useTheme } from '@mui/material';
import Button from '@mui/material/Button';
import { SxProps, styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  minHeight: '50vh',
  '& .MuiDialogTitle-root': {
    padding: theme.spacing(3, 4)
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2, 6),
    borderTop: '0px rgba(0,0,0,0)',
    borderBottom: '0px rgba(0,0,0,0)'
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(3)
  },
  [theme.breakpoints.down('md')]: {
    '& .MuiDialogTitle-root': {
      padding: theme.spacing(3, 2)
    },
    '& .MuiDialogContent-root': {
      padding: theme.spacing(2, 3)
    },
    '& .MuiDialogActions-root': {
      padding: theme.spacing(2)
    }
  }
}));

interface BasicDialogTitleProps {
  children?: React.ReactNode;
  onClose: () => void;
  closeMark: boolean;
}

function BasicDialogTitle(props: BasicDialogTitleProps) {
  const { children, onClose, closeMark, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {closeMark ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

export type BasicDialogActionProps = {
  active: Boolean;
  actionFn?: () => void;
  msg?: string;
};

interface BasicDialogProps {
  open: boolean;
  onClose?: () => void;
  title: string;
  msg?: string | React.ReactNode;
  continueAction?: BasicDialogActionProps;
  backAction?: BasicDialogActionProps;
  closeMark?: boolean;
  verticalButtons?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
  props?: SxProps;
}

const BasicDialog: React.FC<BasicDialogProps> = ({
  open,
  onClose = () => {},
  title,
  msg = '',
  continueAction = { active: false, msg: 'Continuar', actionFn: () => {} },
  backAction = { active: false, msg: 'Regresar', actionFn: () => {} },
  closeMark = true,
  verticalButtons = true,
  fullWidth = false,
  children,
  props
}) => {
  const theme = useTheme();
  return (
    <BootstrapDialog fullWidth={fullWidth} onClose={onClose} open={open} sx={props}>
      <BasicDialogTitle onClose={onClose} closeMark={closeMark}>
        {title}
      </BasicDialogTitle>
      <DialogContent>
        {msg && <Typography>{msg}</Typography>}
        {children}
      </DialogContent>
      {(backAction.active || continueAction.active) && (
        <DialogActions>
          {/* Both action buttons active */}
          {backAction.active && continueAction.active && (
            <Grid container spacing={verticalButtons ? 2 : 0}>
              {backAction.active && (
                <Grid
                  item
                  xs={verticalButtons ? 12 : 6}
                  lg={6}
                  sx={{ px: theme.spacing(1) }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    color="info"
                    onClick={backAction.actionFn}
                  >
                    {backAction.msg}
                  </Button>
                </Grid>
              )}
              {continueAction.active && (
                <Grid
                  item
                  xs={verticalButtons ? 12 : 6}
                  lg={6}
                  sx={{ px: theme.spacing(1) }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={continueAction.actionFn}
                  >
                    {continueAction.msg}
                  </Button>
                </Grid>
              )}
            </Grid>
          )}
          {/* Only one of both action buttons active */}
          {(backAction.active || continueAction.active) &&
            !(backAction.active && continueAction.active) && (
              <Grid container>
                {backAction.active && (
                  <Grid item xs={12} lg={12} sx={{ px: theme.spacing(1) }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="info"
                      onClick={backAction.actionFn}
                    >
                      {backAction.msg}
                    </Button>
                  </Grid>
                )}
                {continueAction.active && (
                  <Grid item xs={12} lg={12} sx={{ px: theme.spacing(1) }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={continueAction.actionFn}
                    >
                      {continueAction.msg}
                    </Button>
                  </Grid>
                )}
              </Grid>
            )}
        </DialogActions>
      )}
    </BootstrapDialog>
  );
};

export default BasicDialog;
