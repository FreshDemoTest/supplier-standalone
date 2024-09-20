import {
  Box,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import LoadingProgress from "./LoadingProgress";

// ----------------------------------------------------------------------

const WAIT_LOAD_TIME = 500;

// ----------------------------------------------------------------------

export type DynamicLoaderProps = {
  ContainerType?: React.ElementType;
  scrollIncrement?: number;
  elements: any[];
  containerSx?: any;
  headers?: React.ReactNode;
  children?: React.ReactNode;
  renderMap?: (el: any[]) => React.ReactNode[];
  colSpan?: number;
  appendable?: boolean;
};

export const DynamicLoader: React.FC<DynamicLoaderProps> = ({
  ContainerType = Container,
  scrollIncrement = 10,
  elements,
  containerSx,
  headers,
  children,
  renderMap,
  appendable = false,
}) => {
  const containerEl = useRef<any>(null);
  const [rows, setRows] = useState(elements.slice(0, scrollIncrement));
  const [loadingEls, setLoadingEls] = useState(false);
  const [distanceBottom, setDistanceBottom] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // set rows
  useEffect(() => {
    setRows([...elements.slice(0, scrollIncrement)]);
    // if appendable and elements are restarted -> reset hasMore
    if (appendable) {
      setHasMore(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements]);

  // - Loading Scroll
  const loadMore = useCallback(() => {
    const loadItems = async () => {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          const amount = rows.length + scrollIncrement;
          setRows([...elements.slice(0, amount)]);
          setLoadingEls(false);
          setHasMore(amount < elements.length);
          resolve();
        }, WAIT_LOAD_TIME);
      });
    };
    setLoadingEls(true);
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const scrollListener = useCallback(() => {
    let bottom =
      containerEl.current?.scrollHeight - containerEl.current?.clientHeight;
    if (!distanceBottom) {
      setDistanceBottom(Math.round(bottom * 1));
    }
    if (
      containerEl.current.scrollTop > bottom - distanceBottom &&
      hasMore &&
      !loadingEls
    ) {
      loadMore();
    }
  }, [hasMore, loadMore, loadingEls, distanceBottom]);

  useLayoutEffect(() => {
    const tableRef = containerEl.current;
    if (!tableRef?.scroll) return;
    tableRef.addEventListener("scroll", scrollListener);
    return () => {
      tableRef.removeEventListener("scroll", scrollListener);
    };
  }, [scrollListener]);

  return (
    <ContainerType
      ref={containerEl}
      sx={{
        minWidth: 280,
        maxHeight: 100,
        overflowY: "scroll",
        ...containerSx,
      }}
    >
      {headers}
      {renderMap ? renderMap(rows) : undefined}
      {loadingEls && (
        <Box textAlign={"center"}>
          <LoadingProgress sx={{ mt: 2 }} />
        </Box>
      )}
      {children}
    </ContainerType>
  );
};

export const DynamicTableLoader: React.FC<DynamicLoaderProps> = ({
  ContainerType = TableContainer,
  scrollIncrement = 10,
  elements,
  containerSx,
  headers,
  children,
  renderMap,
  colSpan = 2,
  appendable = false,
}) => {
  const containerEl = useRef<any>(null);
  const [rows, setRows] = useState(elements.slice(0, scrollIncrement));
  const [loadingEls, setLoadingEls] = useState(false);
  const [distanceBottom, setDistanceBottom] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // set rows
  useEffect(() => {
    // verify if rows is the same as elements
    if (appendable && rows.length === elements.length) return;
    // if elements updates and appendable -> reset rows to the same length as current
    if (appendable && rows.length > scrollIncrement) {
      setRows([...elements.slice(0, rows.length)]);
    } else {
      setRows([...elements.slice(0, scrollIncrement)]);
    }
    // if appendable and elements are restarted -> reset hasMore
    if (appendable) {
      setHasMore(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements]);

  // - Loading Scroll
  const loadMore = useCallback(() => {
    const loadItems = async () => {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          const amount = rows.length + scrollIncrement;
          setRows([...elements.slice(0, amount)]);
          setLoadingEls(false);
          setHasMore(amount < elements.length);
          resolve();
        }, WAIT_LOAD_TIME);
      });
    };
    setLoadingEls(true);
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  // scrollListener callback function
  const scrollListener = useCallback(() => {
    let bottom =
      containerEl.current?.scrollHeight - containerEl.current?.clientHeight;
    if (!distanceBottom) {
      setDistanceBottom(Math.round(bottom * 1));
    }
    if (
      containerEl.current.scrollTop > bottom - distanceBottom &&
      hasMore &&
      !loadingEls
    ) {
      loadMore();
    }
  }, [hasMore, loadMore, loadingEls, distanceBottom]);

  // Adds scroll listener to table container
  useLayoutEffect(() => {
    const tableRef = containerEl.current;
    if (!tableRef?.scroll) return;
    tableRef.addEventListener("scroll", scrollListener);
    return () => {
      tableRef.removeEventListener("scroll", scrollListener);
    };
  }, [scrollListener]);

  return (
    <ContainerType
      ref={containerEl}
      sx={{
        minWidth: 280,
        maxHeight: 100,
        overflowY: "scroll",
        ...containerSx,
      }}
    >
      <Table>
        {/* table head */}
        {headers}
        {/* table body */}
        <TableBody>
          {renderMap ? renderMap(rows) : undefined}
          {loadingEls && (
            <TableRow>
              <TableCell colSpan={colSpan} align="center">
                <LoadingProgress sx={{ mt: 2 }} />
              </TableCell>
            </TableRow>
          )}
          {children}
        </TableBody>
      </Table>
    </ContainerType>
  );
};


export const DynamicTableLoaderWithCheckBox: React.FC<DynamicLoaderProps> = ({
  ContainerType = TableContainer,
  scrollIncrement = 10,
  elements,
  containerSx,
  headers,
  children,
  renderMap,
  colSpan = 2,
  appendable = false,
}) => {
  const containerEl = useRef<any>(null);
  const [rows, setRows] = useState(elements.slice(0, scrollIncrement));
  const [loadingEls, setLoadingEls] = useState(false);
  const [distanceBottom, setDistanceBottom] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // set rows
  useEffect(() => {
    // verify if rows is the same as elements
    const areArraysEqual = rows.length === elements.length && rows.every((row, index) => row === elements[index]);
    if (appendable && areArraysEqual){
      return;
    }
    else {
      setRows([...elements.slice(0, scrollIncrement)]);
    }

    // if elements updates and appendable -> reset rows to the same length as current
    if (appendable && rows.length > scrollIncrement) {
      setRows([...elements.slice(0, rows.length)]);
    } else {
      setRows([...elements.slice(0, scrollIncrement)]);
    }
    // if appendable and elements are restarted -> reset hasMore
    if (appendable) {
      setHasMore(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements]);

  // - Loading Scroll
  const loadMore = useCallback(() => {
    const loadItems = async () => {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          const amount = rows.length + scrollIncrement;
          setRows([...elements.slice(0, amount)]);
          setLoadingEls(false);
          setHasMore(amount < elements.length);
          resolve();
        }, WAIT_LOAD_TIME);
      });
    };
    setLoadingEls(true);
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  // scrollListener callback function
  const scrollListener = useCallback(() => {
    let bottom =
      containerEl.current?.scrollHeight - containerEl.current?.clientHeight;
    if (!distanceBottom) {
      setDistanceBottom(Math.round(bottom * 1));
    }
    if (
      containerEl.current.scrollTop > bottom - distanceBottom &&
      hasMore &&
      !loadingEls
    ) {
      loadMore();
    }
  }, [hasMore, loadMore, loadingEls, distanceBottom]);

  // Adds scroll listener to table container
  useLayoutEffect(() => {
    const tableRef = containerEl.current;
    if (!tableRef?.scroll) return;
    tableRef.addEventListener("scroll", scrollListener);
    return () => {
      tableRef.removeEventListener("scroll", scrollListener);
    };
  }, [scrollListener]);

  return (
    <ContainerType
      ref={containerEl}
      sx={{
        minWidth: 280,
        maxHeight: 100,
        overflowY: "scroll",
        ...containerSx,
      }}
    >
      <Table>
        {/* table head */}
        {headers}
        {/* table body */}
        <TableBody>
          {renderMap ? renderMap(rows) : undefined}
          {loadingEls && (
            <TableRow>
              <TableCell colSpan={colSpan} align="center">
                <LoadingProgress sx={{ mt: 2 }} />
              </TableCell>
            </TableRow>
          )}
          {children}
        </TableBody>
      </Table>
    </ContainerType>
  );
};
