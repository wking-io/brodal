import React, { useMemo, ChangeEvent } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';

// Material UI
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Paper from '@material-ui/core/Paper';
import Modal from '@material-ui/core/Modal';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

// Local
import { AsyncResourceState, Resource } from '../../app/types';
import { BreedOptionRow, selectOptions, addRow, setBreed, setSubBreed, setImageCount, isEmpty } from './optionsSlice';
import { fetchBreedList, selectBreedList, BreedList } from './breedListSlice';
import { fetchImageList, selectImageList, ImageList } from './imageListSlice';
import { toggleBrodal, selectShowBrodal } from './showBrodalSlice';
import { assertExhaustive } from '../../utils/index';
import { useSelector } from 'react-redux';

const useStyles = makeStyles((theme) => ({
  optionRow: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 16
  },
  formControl: {
    minWidth: 120,
    width: '100%',
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    width: 500,
    height: 450,
  },
}));

const withResource = (Component: React.ElementType) => <T,>({ resource, ...props }: { resource: Resource<T> }) => {
  const data = resource.read();
  return (<Component data={data} {...props} />);
}

const BreedOptionsList = withResource(OptionsList);
const BreedImageGrid = withResource(ImageGrid);

export function Generator() {
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
    <Container maxWidth="md">
      <Paper elevation={3} variant="outlined">
        <Typography variant="h3" component="h1">Brodal</Typography>
        <React.Suspense fallback="Breed List is loading">
          <BreedOptionsList resource={breedListResource} />
          <Button size="large" disabled={isEmpty(breedOptions)} onClick={() => dispatch(toggleBrodal())}>
            Generate Images
        </Button>
        </React.Suspense>
      </Paper>
      {isOpen && <Brodal />}
    </Container >
  );
}

function OptionsList({ data }: { data: BreedList }) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const breedOptions = useAppSelector(selectOptions);

  return (
    <>
      {breedOptions.map((optionRow, i, arr) => (
        <div key={`breed-#{i}-row`} className={classes.optionRow}>
          <OptionRow data={data} row={optionRow} rowIndex={i} />
          <IconButton style={{ marginLeft: 16, visibility: arr.length === (i + 1) ? 'visible' : 'hidden' }} aria-label="add row" disabled={optionRow.type === 'EMPTY'} color="primary" onClick={() => dispatch(addRow())}>
            <AddIcon />
          </IconButton>
        </div>
      ))}
    </>
  );
}

type OptionRowProps = {
  data: BreedList;
  row: BreedOptionRow;
  rowIndex: number;
}

function OptionRow({ data, row, rowIndex }: OptionRowProps) {
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
  options: string[];
  handleChange(value: string): void;
  value?: string;
  disabled?: boolean;
}

function OptionSelect({ formKey = 'new', handleChange, options, label, value = '', disabled = false }: OptionSelectProps) {
  const classes = useStyles();
  return (
    <FormControl variant="outlined" className={classes.formControl} disabled={disabled}>
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
      <React.Suspense fallback="Waiting for images...">
        <BreedImageGrid resource={imageListResource} />
      </React.Suspense>
    </Modal>
  )
}

type ImageGridProps = {
  data: string[];
}

function ImageGrid<T>({ data }: ImageGridProps) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <GridList cellHeight={160} className={classes.gridList} cols={3}>
        {data.map((imageUrl) => (
          <GridListTile key={imageUrl} cols={1}>
            <img src={imageUrl} alt="dog image" />
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
}