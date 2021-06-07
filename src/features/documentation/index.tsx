import React from 'react';

// Code Highlighter
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { xonokai as dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Material UI
import { Container, Typography, Link } from '@material-ui/core';
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
      <p style={{ lineHeight: 1.6 }}>You can absolutely crawl through the <Link href="https://github.com/wking-io/brodal" target="_blank" rel="noopener noreferrer">codebase</Link>, but I thought it would be a little easier to review if I called out a few key areas and explained my thought process.</p>
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
      <CodeBlock code={`// Enum used to define the breed options
export enum BreedOptionState {
  Empty,
  BreedAll,
  BreedSub,
}

// How they are used to define explicit UI state
      `} />
      <p style={{ lineHeight: 1.6 }}><em>Bonus: Because of the use of Suspense and ErrorBoundary we don't even need to include loading or error states making the implementation a lot more focused.</em></p>
      <p style={{ lineHeight: 1.6 }}><strong>AsyncResourceStatus</strong></p>
      <p style={{ lineHeight: 1.6 }}>This is the same concept but it applies to loading an async resource. It is used on loading the initial breed list and for the image list.</p>
      <Typography style={{ fontWeight: 'bold', marginTop: 40 }} variant="h5" component="h3">Redux</Typography>
      <p style={{ lineHeight: 1.6 }}>This is one of the areas where I decided to lean more towards the "build as if this were in a codebase that would scale" side.</p>
      <p style={{ lineHeight: 1.6 }}>I went ahead and leveraged <code>createSlice</code> to breakdown the root store object into the individual actions/reducers that specifically operated on those pieces of data. It feels good for the <code>optionsSlice</code>, but feels overkill for the <code>showBrodalSlice</code>.</p>
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
      <p style={{ lineHeight: 1.6 }}>There are two error boundaries that I added that make sure that our application never gets into a state where the end user experiences a total crash with no information.</p>
      <p style={{ lineHeight: 1.6 }}><strong>App Level</strong></p>
      <p style={{ lineHeight: 1.6 }}>This handles errors thrown from fetching the BreedList. Since the app cannot function without that list I have made it a top level boundary.</p>
      <CodeBlock code={`<ErrorBoundary FallbackComponent={ErrorFallback} onError={naiveErrorHandler}>
  <Generator />
  <Documentation />
</ErrorBoundary>`} />
      <p style={{ lineHeight: 1.6 }}><strong>ImageList Level</strong></p>
      <p style={{ lineHeight: 1.6 }}>This handles errors thrown while fetching the images based on the image options. It is isolated to the modal so that they can back out and try again without losing the rest of the application state.</p>
      <CodeBlock code={`<ErrorBoundary FallbackComponent={ErrorFallback} onError={naiveErrorHandler}>
  <React.Suspense fallback={<LoadingMessage message="Loading your images please wait." />}>
    <BreedImageGrid resource={imageListResource} />
  </React.Suspense>
</ErrorBoundary>`} />
      <Typography style={{ fontWeight: 'bold', marginTop: 40 }} variant="h5" component="h3">Suspense</Typography>
      <p style={{ lineHeight: 1.6 }}>Really enjoyed working with Suspense. I decided to just roll my own simple wrapper around the calls so that I could show a Higher Order Component that would use the API expected from the Suspense component. I did this using the code below to build a <code>withResource</code> HOC. It can then be used to extend components that are expecting data without them having to care about the exact implementation of how that data is read.</p>
      <CodeBlock code={`const withResource = (Component: React.ElementType) => <T,>({ resource, ...props }: { resource: Resource<T> }) => {
  const data = resource.read();
  return (<Component data={data} {...props} />);
}

const BreedOptionsList = withResource(OptionsList);
const BreedImageGrid = withResource(ImageGrid);

function OptionsList({ data }: { data: BreedList }) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const breedOptions = useAppSelector(selectOptions);

  return (
    <div>
      {breedOptions.map((optionRow, i, arr) => (
        <div key={\`breed-\${i}-row\`} className={classes.optionRow}>
          <OptionRow data={data} row={optionRow} rowIndex={i} />
          <IconButton style={{ marginLeft: 16, visibility: arr.length === (i + 1) ? 'visible' : 'hidden' }} aria-label="add row" disabled={optionRow.type === BreedOptionState.Empty} color="primary" onClick={() => dispatch(addRow())}>
            <AddIcon />
          </IconButton>
        </div>
      ))}
    </div>
  );
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
}`} />
      <Typography style={{ fontWeight: 'bold', marginTop: 40 }} variant="h5" component="h3">UI & Components</Typography>
      <p style={{ lineHeight: 1.6 }}>This is one of the areas where I decided to lean more towards the "it is a small one-off focus on speed" side. I didn't separate components out into their own files. I don't have a problem doing that, but just didn't care to in this case.</p>
      <p style={{ lineHeight: 1.6 }}>Reading the <code>src/features/Generator.tsx</code> file will give you the best idea of how it all was built, but to call out just a couple areas of UX:</p>
      <ul>
        <li style={{ marginTop: 8, lineHeight: 1.6 }}>Added number field limits on both the input itself and in the reducer. These limits are based on what the Dog API has documented.</li>
        <li style={{ marginTop: 8, lineHeight: 1.6 }}>Disabled row addition if in <code>Suspense</code> or if in the <code>Empty</code> state.</li>
      </ul>
      <Typography style={{ fontWeight: 'bold', marginTop: 40 }} variant="h5" component="h3">What I didn't do, but would do with more time.</Typography>
      <p style={{ lineHeight: 1.6 }}><strong>Better UX around <code>ErrorBoundary</code>(s)</strong></p>
      <p style={{ lineHeight: 1.6 }}>The app level ErrorBoundary would communicate that the App had an error and give the option to refresh the app or contact customer support.</p>
      <p style={{ lineHeight: 1.6 }}>The image modal ErrorBoundary would communicate that there was an error and that they could either try the request again or go back to the generator options.</p>
      <p style={{ lineHeight: 1.6 }}><strong>Add Concurrent mode support.</strong></p>
      <p style={{ lineHeight: 1.6 }}>As I talked about in the section on the Suspense implementation I didn't add in concurrent mode or the primitives that assist in making sure the app UX is smoother in regards to loading states.</p>
      <p style={{ lineHeight: 1.6 }}><strong>Add better UX and design to the modal.</strong></p>
      <p style={{ lineHeight: 1.6 }}>I left it with the default behavior from the Material Component, but would probably add an addition close button for accessibility purposes, and try and clean up the modal to be nicer than just a box with a grid of images. Not sure how, but it feels a little plain.</p>
      <p style={{ lineHeight: 1.6 }}><strong>Parsed the image strings to get more accessible alt text</strong></p>
      <p style={{ lineHeight: 1.6 }}>The API did not have any image metadata so I would have parsed the image strings to pull out which breed the image was of to help with having more descriptive alt text for accessibility.</p>
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