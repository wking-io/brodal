import React, { useMemo, ChangeEvent } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';

// Material UI
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';

// Local
import { AsyncResourceState, Resource } from '../../app/types';
import { BreedOptionRow, selectOptions, addRow, setBreed, setSubBreed, setImageCount, BreedOptionsState } from './optionsSlice';
import { fetchBreedList, selectBreedList, BreedList } from './breedListSlice';
import { assertExhaustive } from '../../utils/index';

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
}));

const withResource = (Component: React.ElementType) => <T,>({ resource, ...props }: { resource: Resource<T> }) => {
  const data = resource.read();
  return (<Component data={data} {...props} />);
}

const BreedOptionsList = withResource(OptionsList);

export function Generator() {
  const dispatch = useAppDispatch();
  const breedList = useAppSelector(selectBreedList);

  const promise = useMemo(() => {
    return dispatch(fetchBreedList);
  }, [dispatch]);

  const breedListResource = useMemo<Resource<BreedList>>(() => ({
    read(): BreedList {
      if (breedList.status === AsyncResourceState.Loading) {
        throw promise;
      } else if (breedList.status === AsyncResourceState.Failed) {
        throw new Error('Failed to load the list of breeds');
      }

      return breedList.list;
    }
  }), [breedList.status, breedList.list, promise]);

  return (
    <Container maxWidth="md">
      <Typography variant="h3" component="h1">Brodal</Typography>
      <BreedOptionsList resource={breedListResource} />
    </Container>
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
      break;
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