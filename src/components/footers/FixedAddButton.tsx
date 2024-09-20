import { Icon, IconifyIcon } from "@iconify/react";
import AddFill from "@iconify/icons-ic/add";
// material
import { Button, useTheme } from "@mui/material";
// styles
import { FooterBox } from "../../styles/footers/poweredBy";

type FixedAddButtonProps = {
  onClick: () => void;
  buttonSize?: "small" | "medium" | "large";
  buttonIcon?: IconifyIcon;
  buttonMsg?: string;
  sx?: any;
  iconButtonSx?: any;
  other?: any;
};

const FixedAddButton: React.FC<FixedAddButtonProps> = ({
  onClick,
  buttonSize = "medium",
  buttonMsg = "Agregar",
  buttonIcon = AddFill,
  sx,
  iconButtonSx,
  ...other
}) => {
  const theme = useTheme();
  const sizeMap = {
    small: { left: "47%", diam: 24, bottom: "4%" },
    medium: { left: { xs: "36%", md: "42%" }, diam: 28, bottom: "5%" },
    large: { left: "42%", diam: 48, bottom: "8%" },
  };
  return (
    <FooterBox
      position={"fixed"}
      sx={{
        left: sizeMap[buttonSize].left,
        bottom: sizeMap[buttonSize].bottom,
        zIndex: 1000,
        ...sx,
      }}
    >
      <Button
        startIcon={
          <Icon
            icon={buttonIcon}
            width={sizeMap[buttonSize].diam}
            height={sizeMap[buttonSize].diam}
          />
        }
        onClick={onClick}
        size={buttonSize}
        sx={{
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.text.secondary,
          boxShadow: theme.shadows[2],
          px: theme.spacing(2),
          ...iconButtonSx,
        }}
        {...other}
      >
        {buttonMsg}
      </Button>
    </FooterBox>
  );
};

export default FixedAddButton;
