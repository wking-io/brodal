import React from 'react';

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
      <Typography style={{ fontWeight: 'bold' }} variant="h4" component="h1">Documentation</Typography>
      <p style={{ fontSize: 14, lineHeight: 1.6 }}>You can absolutely crawl through the codebase, but I thought it would be a little easier to review if I called out a few key areas and explained my thought process.</p>
    </Container>
  );
}