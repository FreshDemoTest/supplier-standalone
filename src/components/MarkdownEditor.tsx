import ReactQuill from "react-quill";
// @mui
import { SxProps, styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
//
import EditorToolbar, {
  formats,
  redoChange,
  undoChange,
} from "./EditorToolbar";

// ----------------------------------------------------------------------

const RootStyle = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  border: `solid 1px ${theme.palette.grey[500]}`,
  "& .ql-container.ql-snow": {
    borderColor: "transparent",
    ...theme.typography.body1,
    fontFamily: theme.typography.fontFamily,
  },
  "& .ql-editor": {
    minHeight: 200,
    maxHeight: 640,
    "&.ql-blank::before": {
      fontStyle: "normal",
      color: theme.palette.text.disabled,
    },
    "& pre.ql-syntax": {
      ...theme.typography.body2,
      padding: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.grey[900],
    },
  },
}));

// ----------------------------------------------------------------------

type MarkdownEditorProps = {
  id?: string;
  label: string;
  value: string;
  onChange: (data: any) => void;
  error: boolean;
  helperText: React.ReactNode;
  simple: boolean;
  placeholder: string;
  sx?: SxProps;
  other?: any;
};

export default function MarkdownEditor({
  id = "minimal-quill",
  label,
  error,
  value,
  onChange,
  simple = false,
  helperText,
  placeholder,
  sx,
  ...other
}: MarkdownEditorProps) {
  const modules = {
    toolbar: {
      container: `#${id}`,
      handlers: {
        undo: undoChange,
        redo: redoChange,
      },
    },
    history: {
      delay: 500,
      maxStack: 100,
      userOnly: true,
    },
    syntax: false,
    clipboard: {
      matchVisual: false,
    },
  };

  return (
    <div>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
        {label}
      </Typography>
      <RootStyle
        sx={{
          ...(error && {
            border: (theme) => `solid 1px ${theme.palette.error.main}`,
          }),
          ...sx,
        }}
      >
        <EditorToolbar id={id} isSimple={simple} />
        <ReactQuill
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          {...other}
        />
      </RootStyle>

      {helperText && helperText}
    </div>
  );
}
