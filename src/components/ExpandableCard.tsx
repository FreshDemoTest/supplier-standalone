import { useRef, useState } from "react";
// material
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";

import IconButton, { IconButtonProps } from "@mui/material/IconButton";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MenuPopover from "./MenuPopover";
import { MenuItem } from "@mui/material";

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

type ExpandableCardProps = {
  title: string | React.ReactNode;
  subtitle: string | React.ReactNode;
  avatar: React.ReactNode;
  actions: React.ReactNode;
  expandedContent?: React.ReactNode;
  options?: { label: string; onClick?: () => void }[];
  menuSize?: { width: number };
  onClick?: () => void;
};

const ExpandableCard: React.FC<ExpandableCardProps> = (props) => {
  const {
    title,
    subtitle,
    avatar,
    actions,
    expandedContent,
    options,
    menuSize = 180,
    onClick,
  } = props;
  const anchorRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <MenuPopover
        open={openMenu}
        onClose={() => setOpenMenu(false)}
        anchorEl={anchorRef.current || undefined}
        sx={menuSize}
      >
        {options?.map((option) => {
          const { label, onClick } = option;
          return (
            <MenuItem
              key={label}
              onClick={() => {
                if (onClick) {
                  onClick();
                }
                setOpenMenu(false);
              }}
              sx={{ typography: "body2", py: 1, px: 2.5 }}
            >
              {label}
            </MenuItem>
          );
        })}
      </MenuPopover>
      <Card sx={{ maxWidth: "100%", cursor: onClick ? "pointer" : "default" }}>
        <CardHeader
          avatar={avatar}
          action={
            <IconButton
              aria-label="settings"
              sx={{
                visibility: options ? "visible" : "hidden",
              }}
              ref={anchorRef}
              onClick={() => {
                setOpenMenu(true);
              }}
            >
              <MoreVertIcon />
            </IconButton>
          }
          title={title}
          subheader={subtitle}
          onClick={onClick}
        />
        <CardActions disableSpacing>
          {actions}
          {expandedContent && (
            <ExpandMore
              expand={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          )}
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>{expandedContent}</CardContent>
        </Collapse>
      </Card>
    </>
  );
};

export default ExpandableCard;
