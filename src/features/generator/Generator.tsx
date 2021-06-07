import React, { useMemo, ChangeEvent } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Material UI
import {
  CircularProgress,
  Typography,
  Container,
  Grid,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  TextField,
  Button,
  IconButton,
  Paper,
  Modal,
  GridListTile,
  GridList
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import blueGrey from '@material-ui/core/colors/blueGrey';


// Local
import { ErrorFallback, naiveErrorHandler } from '../../app/errors';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { AsyncResourceState, Resource } from '../../app/types';
import { BreedOptionRow, selectOptions, addRow, setBreed, setSubBreed, setImageCount, isEmpty } from './optionsSlice';
import { fetchBreedList, selectBreedList, BreedList } from './breedListSlice';
import { fetchImageList, selectImageList, ImageList } from './imageListSlice';
import { toggleBrodal, selectShowBrodal } from './showBrodalSlice';
import { assertExhaustive } from '../../utils/index';
import { useSelector } from 'react-redux';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    marginTop: 48,
    alignItems: 'start',
    justifyContent: 'center',
  },
  optionWrapper: {
    overflow: 'hidden',
    backgroundColor: blueGrey[800],
  },
  optionRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 0',
    '&:not(:first-child)': {
      borderTop: `1px solid ${blueGrey[500]}`,
    }
  },
  formControl: {
    minWidth: 120,
    width: '100%',
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  generateButton: {
    backgroundImage: `linear-gradient( to right, ${theme.palette.primary.light}, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    color: '#FFFFFF',
    borderRadius: 0,
    '&:disabled': {
      opacity: 0.5,
      color: '#FFF',
    }
  },
  modalContent: {
    position: 'absolute',
    backgroundColor: blueGrey[700],
    boxShadow: theme.shadows[10],
    padding: theme.spacing(4),
    overflowX: 'hidden',
    overflowY: 'auto',
    height: 450,
    width: 500,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  gridWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
}));

const withResource = (Component: React.ElementType) => <T,>({ resource, ...props }: { resource: Resource<T> }) => {
  const data = resource.read();
  return (<Component data={data} {...props} />);
}

const BreedOptionsList = withResource(OptionsList);
const BreedImageGrid = withResource(ImageGrid);

export function Generator() {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const breedList = useAppSelector(selectBreedList);
  const breedOptions = useAppSelector(selectOptions);
  const isOpen = useAppSelector(selectShowBrodal);

  const breedListPromise = useMemo(() => {
    return dispatch(fetchBreedList());
  }, [dispatch]);

  const breedListResource = useMemo<Resource<BreedList>>(() => ({
    read(): BreedList {
      if (breedList.status === AsyncResourceState.Loading) {
        throw breedListPromise;
      } else if (breedList.status === AsyncResourceState.Failed) {
        throw new Error('Failed to load the list of breeds');
      }

      return breedList.list;
    }
  }), [breedList.status, breedList.list, breedListPromise]);

  return (
    <Container className={classes.container} maxWidth="sm">
      <Paper elevation={4} className={classes.optionWrapper}>
        <div style={{ padding: 32 }}>
          <Typography style={{ fontWeight: 'bold' }} variant="h4" component="h1">The Brodal</Typography>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>The Brodal (breed + modal) is a generator that will take the dog breed options that you select below and turn them into images. After selecting valid breed options, these images will appear inside of a modal when you click the generate button.</p>
          <React.Suspense fallback={<OptionsListFallback />}>
            <BreedOptionsList resource={breedListResource} />
          </React.Suspense>
        </div>
        <Button fullWidth={true} className={classes.generateButton} size="large" disabled={isEmpty(breedOptions)} onClick={() => dispatch(toggleBrodal())}>
          Generate Images
        </Button>
      </Paper>
      { isOpen && <Brodal />}
    </Container >
  );
}

function OptionsListFallback() {
  const classes = useStyles();
  return (
    <div>
      <div key="breed-loading-row" className={classes.optionRow}>
        <Grid container spacing={3} alignItems="center" wrap='nowrap'>
          <Grid style={{ flex: 1 }} item>
            <OptionSelect label="Breed" disabled={true} />
          </Grid>
          <Grid style={{ flex: 1 }} item>
            <OptionSelect label="Sub-breed" disabled={true} />
          </Grid>
          <Grid item>
            <TextField
              id="breed-image-count"
              label="# of Images"
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
              disabled={true}
              value={0}
              size='small'
              style={{ maxWidth: 100 }}
            />
          </Grid>
        </Grid>
        <CircularProgress />
      </div>
    </div>
  );
}

function OptionsList({ data }: { data: BreedList }) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const breedOptions = useAppSelector(selectOptions);

  return (
    <div>
      {breedOptions.map((optionRow, i, arr) => (
        <div key={`breed-${i}-row`} className={classes.optionRow}>
          <OptionRow data={data} row={optionRow} rowIndex={i} />
          <IconButton style={{ marginLeft: 16, visibility: arr.length === (i + 1) ? 'visible' : 'hidden' }} aria-label="add row" disabled={optionRow.type === 'EMPTY'} color="primary" onClick={() => dispatch(addRow())}>
            <AddIcon />
          </IconButton>
        </div>
      ))}
    </div>
  );
}

type OptionRowProps = {
  data: BreedList;
  row: BreedOptionRow;
  rowIndex: number;
}

function OptionRow({ data = {}, row, rowIndex }: OptionRowProps) {
  const dispatch = useAppDispatch();
  // TODO: Make the fields responsive
  // TODO: Replace type with Enum
  switch (row.type) {
    case "EMPTY":
      return (
        <Grid container spacing={3} alignItems="center" wrap='nowrap'>
          <Grid style={{ flex: 1 }} item>
            <OptionSelect options={Object.keys(data)} label="Breed" handleChange={(value: string) => dispatch(setBreed({ value, index: rowIndex }))} />
          </Grid>
          <Grid style={{ flex: 1 }} item>
            <OptionSelect options={[]} disabled={true} label="Sub-breed" handleChange={(value: string) => dispatch(setSubBreed({ value, index: rowIndex }))} />
          </Grid>
          <Grid item>
            <TextField
              id="breed-image-count"
              label="# of Images"
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
              disabled={true}
              onChange={({ target }) => dispatch(setImageCount({ value: target.value, index: rowIndex }))}
              value={0}
              size='small'
              style={{ maxWidth: 100 }}
            />
          </Grid>
        </Grid>
      );

    case "BREED_ALL":
      return (
        <Grid container spacing={3} alignItems="center" wrap='nowrap'>
          <Grid style={{ flex: 1 }} item>
            <OptionSelect options={Object.keys(data)} label="Breed" handleChange={(value: string) => dispatch(setBreed({ value, index: rowIndex }))} value={row.breed} />
          </Grid>
          <Grid style={{ flex: 1 }} item>
            <OptionSelect options={["all", ...data[row.breed]]} label="Sub-breed" value="all" handleChange={(value: string) => dispatch(setSubBreed({ value, index: rowIndex }))} />
          </Grid>
          <Grid item>
            <TextField
              id="breed-image-count"
              label="# of Images"
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
              onChange={({ target }) => dispatch(setImageCount({ value: target.value, index: rowIndex }))}
              value={row.count}
              size='small'
              style={{ maxWidth: 100 }}
            />
          </Grid>
        </Grid>
      );

    case "BREED_SUB":
      return (
        <Grid container spacing={3} alignItems="center" wrap='nowrap'>
          <Grid style={{ flex: 1 }} item>
            <OptionSelect options={Object.keys(data)} label="Breed" handleChange={(value: string) => dispatch(setBreed({ value, index: rowIndex }))} value={row.breed} />
          </Grid>
          <Grid style={{ flex: 1 }} item>
            <OptionSelect options={["all", ...data[row.breed]]} label="Sub-breed" handleChange={(value: string) => dispatch(setSubBreed({ value, index: rowIndex }))} value={row.subBreed} />
          </Grid>
          <Grid item>
            <TextField
              id="breed-image-count"
              label="# of Images"
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
              onChange={({ target }) => dispatch(setImageCount({ value: target.value, index: rowIndex }))}
              value={row.count}
              size='small'
              style={{ maxWidth: 100 }}
            />
          </Grid>
        </Grid>
      );

    default:
      assertExhaustive(row);
  }
}

type OptionSelectProps = {
  formKey?: string;
  label: string;
  options?: string[];
  handleChange?(value: string): void;
  value?: string;
  disabled?: boolean;
}

function OptionSelect({ formKey = 'new', handleChange = () => { }, options = [], label, value = '', disabled = false }: OptionSelectProps) {
  const classes = useStyles();
  return (
    <FormControl variant="outlined" className={classes.formControl} disabled={disabled}
      size='small'>
      <InputLabel id={`breed-${formKey}-label`}>{label}</InputLabel>
      <Select
        labelId={`breed-${formKey}-label`}
        id={`breed-${formKey}`}
        value={value}
        onChange={(event: ChangeEvent<{ value: unknown }>) => handleChange(event.target.value as string)}
        label={label}
      >
        {options.map(option => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function Brodal() {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const imageList = useSelector(selectImageList);
  const breedOptions = useSelector(selectOptions);
  const isOpen = useAppSelector(selectShowBrodal);

  const imageListPromise = useMemo(() => {
    return dispatch(fetchImageList(breedOptions));
  }, [dispatch]);

  const imageListResource = useMemo<Resource<ImageList>>(() => ({
    read(): ImageList {
      if (imageList.status === AsyncResourceState.Loading) {
        throw imageListPromise;
      } else if (imageList.status === AsyncResourceState.Failed) {
        throw new Error('Failed to load the list of images');
      }

      return imageList.list;
    }
  }), [imageList.status, imageList.list, imageListPromise]);

  return (
    <Modal
      open={isOpen}
      onClose={() => dispatch(toggleBrodal())}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <div className={classes.modalContent}>
        <ErrorBoundary FallbackComponent={ErrorFallback} onError={naiveErrorHandler}>
          <React.Suspense fallback={<LoadingMessage message="Loading your images please wait." />}>
            <BreedImageGrid resource={imageListResource} />
          </React.Suspense>
        </ErrorBoundary>
      </div>
    </Modal>
  )
}

type ImageGridProps = {
  data: string[];
}

function ImageGrid<T>({ data }: ImageGridProps) {
  const classes = useStyles();
  return (
    <div className={classes.gridWrapper}>
      <GridList cellHeight={160} cols={3}>
        {data.map((imageUrl) => (
          <GridListTile key={imageUrl} cols={1}>
            <img src={imageUrl} alt="dog image" />
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
}

function LoadingMessage({ message = "Loading please wait." }: { message?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }} >
      <CircularProgress />
      <p style={{ marginTop: 12, color: '#fff' }}>{message}</p>
    </div>
  )
}