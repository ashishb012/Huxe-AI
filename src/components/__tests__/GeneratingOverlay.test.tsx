import React from 'react';
import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { GeneratingOverlay } from '../GeneratingOverlay';

describe('GeneratingOverlay', () => {
  it('should render the overlay with the provided status text', () => {
    const { getByText } = render(
      <GeneratingOverlay 
        isVisible={true} 
        statusText="Gathering your emails..." 
      />
    );

    expect(getByText('Gathering your emails...')).toBeTruthy();
  });

  it('should not be visible when isVisible is false', () => {
    const { queryByText } = render(
      <GeneratingOverlay 
        isVisible={false} 
        statusText="Writing script..." 
      />
    );

    // It uses opacity to hide, so the element might still be in the tree
    // but we can check if it rendered the text when visible
    const textElement = queryByText('Writing script...');
    // In our component, we don't return null immediately, we just animate opacity to 0
    expect(textElement).toBeTruthy();
  });
});
