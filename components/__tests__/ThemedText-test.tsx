import * as React from 'react';
import renderer, { act, type ReactTestRenderer } from 'react-test-renderer';

import { ThemedText } from '../ThemedText';

// React 19 renders asynchronously: toJSON() is null until the render is flushed in act().
it(`renders correctly`, async () => {
  let tree!: ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<ThemedText>Snapshot test!</ThemedText>);
  });

  expect(tree.toJSON()).toMatchSnapshot();
});
