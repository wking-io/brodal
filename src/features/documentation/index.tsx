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
      <Typography style={{ fontWeight: 'bold', marginTop: 40 }} variant="h5" component="h3">Architecture</Typography>
      <p style={{ lineHeight: 1.6 }}>Okay, that feels a little pretentious sounding for the size of the project, buuut I did make some conscious decisions around "architecture" related items. I made decisions based on two factors:</p>
      <ol>
        <li style={{ marginTop: 8, lineHeight: 1.6 }}>This is a small app with a small set of features. So, lean toward explicitness and co-location for speed.</li>
        <li style={{ marginTop: 8, lineHeight: 1.6 }}>This is still a test project to see how I may work with a codebase that is clearly at scale. So, take a few places and "plan" for them to grow.</li>
      </ol>
      <Typography style={{ fontWeight: 'bold', marginTop: 40 }} variant="h5" component="h3">Codebase</Typography>
      <p style={{ lineHeight: 1.6 }}>The way I try to think about file organization is based on three concepts. </p>
      <ul>
        <li style={{ marginTop: 8, lineHeight: 1.6 }}><strong>Universal:</strong> Functionality that is completely abstracted from the call site. This is located in the <code>/utils</code> folder.</li>
        <li style={{ marginTop: 8, lineHeight: 1.6 }}><strong>Global:</strong> Functionality that is used across the project, but is very domain specific. This is located in the <code>/apps</code> folder.</li>
        <li style={{ marginTop: 8, lineHeight: 1.6 }}><strong>Local:</strong> Functionality that is tightly coupled to the constraints of where it is defined. This is located in the <code>/features</code> folder.</li>
      </ul>
      <p style={{ lineHeight: 1.6 }}>These three definitions map directly to one of the biggest considerations when working with a large, long-lived codebase. If I change this what might break? With the risk of accidentally breaking areas you didn't mean to decreasing as you move towards the local end of the spectrum.</p>
      <p style={{ lineHeight: 1.6 }}><em>PS - Love static types and using them helps a lot with this issue by enforcing the contracts across the call sites.</em></p>
      <Typography style={{ fontWeight: 'bold', marginTop: 40 }} variant="h5" component="h3">Impossible States</Typography>
      <p style={{ lineHeight: 1.6 }}>This is one of my favorite mantras and being able to leverage static types using Typescript was nice. This is my first experience using Typescript, but I am very familiar with static typing having used Elm in the past quite a bit.</p>
      <p style={{ lineHeight: 1.6 }}>I didn't identify every single case that I could have made sure types didn't allow for an impossible state, but I focused on two cases where I felt it mattered most.</p>
      <p style={{ lineHeight: 1.6 }}><strong>OptionRow</strong></p>
      <p style={{ lineHeight: 1.6 }}>By defining the three different states a row of options could be in using an Enum this allows us to more explicitly set the interactions the UI has available to each state.</p>

      <p style={{ lineHeight: 1.6 }}><em>Bonus: Because of the use of Suspense and ErrorBoundary we don't even need to include loading or error states making the implementation a lot more focused.</em></p>
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
      <Typography style={{ fontWeight: 'bold', marginTop: 40 }} variant="h5" component="h3">ErrorBoundary(s)</Typography>
      <p style={{ lineHeight: 1.6 }}>This is one of the areas where I decided to lean more towards the "build as if this were in a codebase that would scale" side.</p>
      <Typography style={{ fontWeight: 'bold', marginTop: 40 }} variant="h5" component="h3">Suspense</Typography>
      <p style={{ lineHeight: 1.6 }}>This is one of the areas where I decided to lean more towards the "build as if this were in a codebase that would scale" side.</p>
      <Typography style={{ fontWeight: 'bold', marginTop: 40 }} variant="h5" component="h3">Generator Configuration</Typography>
      <p style={{ lineHeight: 1.6 }}>This is one of the areas where I decided to lean more towards the "build as if this were in a codebase that would scale" side.</p>
      <Typography style={{ fontWeight: 'bold', marginTop: 40 }} variant="h5" component="h3">What I didn't do, but would do with more time.</Typography>
      <p style={{ lineHeight: 1.6 }}>This is one of the areas where I decided to lean more towards the "build as if this were in a codebase that would scale" side.</p>
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