import { Draggable } from "react-beautiful-dnd";
import { Avatar, Box, ListItem, ListItemText, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { SupplierProductImage } from "../../../domain/supplier/SupplierProduct";
import { buildImageThumbnail } from "../../../utils/imagesCdn";

export type DraggableListItemProps = {
  item: SupplierProductImage;
  index: number;
  selected?: boolean;
  onSelectImg?: () => void;
};

const DraggableImageItem = ({
  item,
  index,
  selected,
  onSelectImg,
}: DraggableListItemProps) => {
  const coverImg = `${buildImageThumbnail(item.imageUrl)}?${Date.now()}`;

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <ListItem
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{
            maxWidth: 108,
            background: snapshot.isDragging ? "rgb(235,235,235)" : "",
            m: 1,
            borderRadius: 1,
            border: selected ? "1px solid" : "",
            borderColor: selected ? "text.disabled" : "transparent",
          }}
          onClick={onSelectImg}
        >
          <ListItemText
            primary={
              <>
                {index === 0 ? (
                  <Box sx={{ position: "relative" }}>
                    <StarIcon
                      sx={{
                        position: "absolute",
                        top: 24,
                        right: -12,
                        zIndex: 1000,
                      }}
                      color="info"
                    />
                  </Box>
                ) : null}
                <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                  <Typography
                    variant="subtitle2"
                    align="center"
                    sx={{ mr: 1, mt: 1 }}
                  >
                    {index + 1}
                  </Typography>
                  <Avatar src={coverImg} />
                </Box>
              </>
            }
            sx={{ mr: 1 }}
          />
        </ListItem>
      )}
    </Draggable>
  );
};

export default DraggableImageItem;
