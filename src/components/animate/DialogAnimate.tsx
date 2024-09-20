import { motion, AnimatePresence } from "framer-motion";
// material
import { Dialog } from "@mui/material";
import { varFadeInUp } from "./variants";

// ----------------------------------------------------------------------

type DialogAnimateProps = {
  open: boolean;
  animate?: any;
  onClose?: () => void;
  children?: React.ReactNode;
  other?: any;
};

const DialogAnimate: React.FC<DialogAnimateProps> = ({
  open = false,
  animate,
  onClose,
  children,
  ...other
}) => {
  return (
    <AnimatePresence>
      {open && (
        <Dialog
          fullWidth
          maxWidth="xs"
          open={open}
          onClose={onClose}
          PaperComponent={motion.div as React.JSXElementConstructor<any>}
          PaperProps={{
            sx: {
              borderRadius: 2,
              bgcolor: "background.paper",
            },
            ...(animate || varFadeInUp),
          }}
          {...other}
        >
          {children}
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default DialogAnimate;
