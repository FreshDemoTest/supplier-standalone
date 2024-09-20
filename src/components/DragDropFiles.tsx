import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Grid,
  List,
  ListItem,
  Typography,
  styled,
  useTheme,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// --------------------------------------------------

const DropZoneBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "200px",
  border: `1px solid ${theme.palette.grey[400]}`,
  borderRadius: theme.shape.borderRadius,
  padding: "2rem",
  cursor: "pointer",
}));

// --------------------------------------------------

type DragDropFilesProps = {
  filesVar: FileList | null;
  setFilesVar: (f: FileList | null) => void;
  acceptFiles?: string[];
  selectFilesMsg?: string;
  multiple?: boolean;
  sx?: any;
  squareImgs?: boolean;
};

const DragDropFiles: React.FC<DragDropFilesProps> = ({
  filesVar,
  setFilesVar,
  acceptFiles = ["image/png", "image/jpeg"],
  selectFilesMsg = "Selecciona tus archivos",
  multiple = true,
  sx,
}) => {
  const theme = useTheme();
  const [files, setFiles] = useState<FileList | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // hook - on change filesVar - update files
  useEffect(() => {
    setFiles(filesVar);
  }, [filesVar]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setFiles(event.dataTransfer.files);
    setFilesVar(event.dataTransfer.files);
  };

  const clearFiles = () => {
    setFiles(null);
    setFilesVar(null);
  };

  if (files)
    return (
      <Box sx={{ ...sx, width: "100%" }}>
        <List>
          {Array.from(files).map((file, idx) => (
            <ListItem key={idx}>
              <Box display={"flex"}>
                <Checkbox checked={true} />
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {file.name}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
        <Grid container>
          <Grid item xs={8} md={8} />
          <Grid item xs={4} md={2}>
            <Button
              size="small"
              color="info"
              variant="outlined"
              onClick={clearFiles}
            >
              Cancelar
            </Button>
          </Grid>
        </Grid>
      </Box>
    );

  return (
    <Box sx={sx}>
      <DropZoneBox
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => {
          if (inputRef.current) inputRef.current.click();
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CloudUploadIcon
            sx={{ fontSize: { xs: 40, md: 70 } }}
            color="disabled"
          />
        </Box>
        <input
          type="file"
          multiple={multiple}
          onChange={(event) => {
            setFiles(event.target.files);
            setFilesVar(event.target.files);
          }}
          hidden
          accept={acceptFiles.join(",")}
          ref={inputRef}
        />
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.grey[500],
            textTransform: "uppercase",
            width: "100%",
          }}
          align="center"
        >
          {selectFilesMsg}
        </Typography>
      </DropZoneBox>
    </Box>
  );
};

const DragDropImages: React.FC<DragDropFilesProps> = ({
  filesVar,
  setFilesVar,
  acceptFiles = ["image/png", "image/jpeg"],
  selectFilesMsg = "Selecciona tus archivos",
  multiple = true,
  sx,
  squareImgs = true,
}) => {
  const theme = useTheme();
  const [files, setFiles] = useState<FileList | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // hook - on change filesVar - update files
  useEffect(() => {
    setFiles(filesVar);
  }, [filesVar]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setFiles(event.dataTransfer.files);
    setFilesVar(event.dataTransfer.files);
  };

  const clearFiles = () => {
    setFiles(null);
    setFilesVar(null);
  };

  const displayImgSx = squareImgs
    ? { width: "200px", height: "200px" }
    : { width: "200px", height: "auto" };

  if (files)
    return (
      <Box sx={{ ...sx, width: "100%" }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <List>
            {Array.from(files).map((file, idx) => (
              <ListItem key={idx}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Box>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      style={displayImgSx}
                    />
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      {file.name}
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
        <Grid container>
          <Grid item xs={7} md={5} />
          <Grid item xs={4} md={2}>
            <Button
              size="small"
              color="info"
              variant="outlined"
              onClick={clearFiles}
            >
              Cancelar
            </Button>
          </Grid>
        </Grid>
      </Box>
    );

  return (
    <Box sx={{ ...sx, mx: 3 }}>
      <DropZoneBox
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => {
          if (inputRef.current) inputRef.current.click();
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CloudUploadIcon
            sx={{ fontSize: { xs: 40, md: 70 } }}
            color="disabled"
          />
        </Box>
        <input
          type="file"
          multiple={multiple}
          onChange={(event) => {
            setFiles(event.target.files);
            setFilesVar(event.target.files);
          }}
          hidden
          accept={acceptFiles.join(",")}
          ref={inputRef}
        />
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.grey[500],
            textTransform: "uppercase",
            width: "100%",
          }}
          align="center"
        >
          {selectFilesMsg}
        </Typography>
      </DropZoneBox>
    </Box>
  );
};

export default DragDropFiles;
export { DragDropImages };
