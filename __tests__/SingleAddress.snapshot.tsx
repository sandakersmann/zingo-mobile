/**
 * @format
 */

import 'react-native';
import React from 'react';

import { render } from '@testing-library/react-native';
import SingleAddress from '../components/Components/SingleAddress';

jest.useFakeTimers();
jest.mock('@fortawesome/react-native-fontawesome', () => ({
  FontAwesomeIcon: '',
}));
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// test suite
describe('Component SingleAddress - test', () => {
  //snapshot test
  test('SingleAddress - snapshot', () => {
    const onPrev = jest.fn();
    const onNext = jest.fn();
    const about = render(
      <SingleAddress address="hvkausdfskidjlfs" addressKind="u" index={0} total={1} prev={onPrev} next={onNext} />,
    );
    expect(about.toJSON()).toMatchSnapshot();
  });
});
