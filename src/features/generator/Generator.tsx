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
  GridList,
  Hidden
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import blueGrey from '@material-ui/core/colors/blueGrey';


// Local
import { ErrorFallback, naiveErrorHandler } from '../../app/errors';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { AsyncResourceState, Resource } from '../../app/types';
import { BreedOptionState, BreedOptionRow, selectOptions, addRow, setBreed, setSubBreed, setImageCount, isEmpty } from './optionsSlice';
import { fetchBreedList, selectBreedList, BreedList } from './breedListSlice';
import { fetchImageList, selectImageList, ImageList } from './imageListSlice';
import { toggleBrodal, selectShowBrodal } from './showBrodalSlice';
import { assertExhaustive } from '../../utils/index';
import { useSelector } from 'react-redux';
import classes from '*.module.css';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
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
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 0',
    '&:not(:first-child)': {
      borderTop: `1px solid ${blueGrey[500]}`,
    }
  },
  optionRowFields: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  option: {
    width: '100%',
    '&:not(:last-child)': {
      flex: 1,
    }
  },
  addRowButton: {
    margin: '8px 0 0 0',
  },
  hideButton: {
    display: 'none',
  },
  '@media screen and (min-width: 640px)': {
    optionRow: {
      flexDirection: 'row',
    },
    optionRowFields: {
      flexDirection: 'row',
    },
    addRowButton: {
      margin: '0 0 0 16px',
    },
    option: {
      '&:last-child': {
        maxWidth: 120,
        flex: 'initial',
      },
    },
    hideButton: {
      display: 'block',
      visibility: 'hidden',
    },
  },
  formControl: {
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
        <Grid className={classes.optionRowFields} container spacing={3} alignItems="center" wrap='nowrap'>
          <Grid className={classes.option} item>
            <OptionSelect label="Breed" disabled={true} />
          </Grid>
          <Grid className={classes.option} item>
            <OptionSelect label="Sub-breed" disabled={true} />
          </Grid>
          <Grid className={classes.option} item>
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
        <CircularProgress style={{ marginLeft: 12 }} size={24} />
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
          <IconButton className={`${classes.addRowButton} ${arr.length !== (i + 1) ? classes.hideButton : ''}`} aria-label="add row" disabled={optionRow.type === BreedOptionState.Empty} color="primary" onClick={() => dispatch(addRow())}>
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
  const classes = useStyles();
  const dispatch = useAppDispatch();
  switch (row.type) {
    case BreedOptionState.Empty:
      return (
        <Grid className={classes.optionRowFields} container spacing={3} alignItems="center" wrap='nowrap'>
          <Grid className={classes.option} item>
            <OptionSelect formKey={`breed-${rowIndex}`} options={Object.keys(data)} label="Breed" handleChange={(value: string) => dispatch(setBreed({ value, index: rowIndex }))} />
          </Grid>
          <Grid className={classes.option} item>
            <OptionSelect formKey={`breed-${rowIndex}`} options={[]} disabled={true} label="Sub-breed" handleChange={(value: string) => dispatch(setSubBreed({ value, index: rowIndex }))} />
          </Grid>
          <Grid className={classes.option} item>
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
              style={{ width: '100%' }}
            />
          </Grid>
        </Grid>
      );

    case BreedOptionState.BreedAll:
      return (
        <Grid className={classes.optionRowFields} container spacing={3} alignItems="center" wrap='nowrap'>
          <Grid className={classes.option} item>
            <OptionSelect formKey={`breed-${rowIndex}`} options={Object.keys(data)} label="Breed" handleChange={(value: string) => dispatch(setBreed({ value, index: rowIndex }))} value={row.breed} />
          </Grid>
          <Grid className={classes.option} item>
            <OptionSelect formKey={`sub-breed-${rowIndex}`} options={["all", ...data[row.breed]]} label="Sub-breed" value="all" handleChange={(value: string) => dispatch(setSubBreed({ value, index: rowIndex }))} />
          </Grid>
          <Grid className={classes.option} item>
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
              style={{ width: '100%' }}
            />
          </Grid>
        </Grid>
      );

    case BreedOptionState.BreedSub:
      return (
        <Grid className={classes.optionRowFields} container spacing={3} alignItems="center" wrap='nowrap'>
          <Grid className={classes.option} item>
            <OptionSelect formKey={`breed-${rowIndex}`} options={Object.keys(data)} label="Breed" handleChange={(value: string) => dispatch(setBreed({ value, index: rowIndex }))} value={row.breed} />
          </Grid>
          <Grid className={classes.option} item>
            <OptionSelect formKey={`sub-breed-${rowIndex}`} options={["all", ...data[row.breed]]} label="Sub-breed" handleChange={(value: string) => dispatch(setSubBreed({ value, index: rowIndex }))} value={row.subBreed} />
          </Grid>
          <Grid className={classes.option} item>
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
              style={{ width: '100%' }}
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

export function OptionSelect({ formKey = 'new', handleChange = () => { }, options = [], label, value = '', disabled = false }: OptionSelectProps) {
  const classes = useStyles();
  return (
    <FormControl variant="outlined" className={classes.formControl} disabled={disabled}
      size='small'>
      <InputLabel id={`${formKey}-label`}>{label}</InputLabel>
      <Select
        labelId={`${formKey}-label`}
        data-testid={`select-${formKey}`}
        id={`${formKey}`}
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
  }, [dispatch, breedOptions]);

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

function ImageGrid({ data }: { data: string[] }) {
  const classes = useStyles();
  return (
    <div className={classes.gridWrapper}>
      <GridList cellHeight={160} cols={3}>
        {data.map((imageUrl) => (
          <GridListTile key={imageUrl} cols={1}>
            <img src={imageUrl} alt="dog breed" />
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