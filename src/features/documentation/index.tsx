import React from 'react';

// Code Highlighter
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { xonokai as dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Material UI
import { Container, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    color: '#fff',
    marginTop: 48,
    opacity: 0.75,
  }
}));

export function Documentation() {
  const classes = useStyles();
  return (
    <Container maxWidth="sm" className={classes.container}>
      <Typography style={{ fontWeight: 'bold' }} variant="h4" component="h2">Documentation</Typography>
      <p style={{ lineHeight: 1.6 }}>You can absolutely crawl through the codebase, but I thought it would be a little easier to review if I called out a few key areas and explained my thought process.</p>
      <Typography style={{ fontWeight: 'bold', marginTop: 40 }} variant="h5" component="h3">Redux</Typography>
      <p style={{ lineHeight: 1.6 }}>This is one of the areas where I decided to lean more towards the "build as if this were in a codebase that would scale" side.</p>
      <p style={{ lineHeight: 1.6 }}>I went ahead and leveraged `createSlice` to breakdown the root store object into the individual actions/reducers that specifically operated on those pieces of data. It feels good for the `optionsSlice`, but feels overkill for the `showBrodalSlice`.</p>
      <p style={{ lineHeight: 1.6 }}>Used a Higher Order Function to wrap all of the option row reducers. This let the reducer specific functions focus on the row being updated and let the overhead of pulling that row and inserting it back into the state be handled in one reusable call.</p>
      <CodeBlock code={`// Higher Order Function
function withOptionRow(updater: (optionRow: BreedOptionRow, value: string) => BreedOptionRow) {
  return function(state: BreedOptionsState, { payload }: PayloadAction<BreedOptionPayload>) {
    state[payload.index] = updater(state[payload.index], payload.value);
  };
}

// Updater Function
function setBreedOption(optionRow: BreedOptionRow, value: string): BreedOptionRow {
  switch (optionRow.type) {
    case OptionsRowType.Empty:
    case OptionsRowType.BreedSub:
      return { type: OptionsRowType.BreedAll, breed: value, count: 10 };
    case OptionsRowType.BreedAll:
      return { ...optionRow, breed: value };
    default:
      assertExhaustive(optionRow);
  }
}`} />
    </Container>
  );
}

function CodeBlock({ code }: { code: string }) {

  return (
    <div style={{ marginTop: 24 }}>
      <SyntaxHighlighter language="typescript" style={dark}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
};