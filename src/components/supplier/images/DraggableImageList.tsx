import { memo } from "react";
import {
  DragDropContext,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import DraggableImageItem from "./DraggableImageItem";
import { SupplierProductImage } from "../../../domain/supplier/SupplierProduct";

export type DraggableListProps = {
  items: SupplierProductImage[];
  onDragEnd: OnDragEndResponder;
  selectedImg: string | null;
  onSelectImg?: (v: string) => void;
};

const DraggableImageList = memo(
  ({ items, onDragEnd, selectedImg, onSelectImg }: DraggableListProps) => {
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable-list" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ display: "flex", flexDirection: "row" }}
            >
              {items.map((item, index) => (
                <DraggableImageItem
                  item={item}
                  index={index}
                  key={item.id}
                  selected={selectedImg === item.id}
                  onSelectImg={() => onSelectImg && onSelectImg(item.id)}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
);

export default DraggableImageList;
