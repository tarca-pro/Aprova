import React from 'react';
import {Composition} from 'remotion';
import {CuriosidadeShort} from './CuriosidadeShort';
import {fontsLoaded} from './fonts';
import type {ShortProps} from './types';
import demo from '../props.example.json';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="CuriosidadeShort"
    component={CuriosidadeShort}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={30 * 15}
    defaultProps={demo as ShortProps}
    calculateMetadata={async ({props}) => {
      await fontsLoaded;
      return {durationInFrames: Math.ceil(props.durationInSeconds * 30)};
    }}
  />
);
