import React, { ReactNode } from 'react';
import { StackScreenProps } from '@react-navigation/stack';

import {
  AppStateLoading,
  DimensionsType,
  InfoType,
  TotalBalanceClass,
  WalletType,
  zecPriceType,
  BackgroundType,
  NetInfoType,
  BackgroundErrorType,
  ServerType,
} from '../AppState';

export const defaultAppStateLoading: AppStateLoading = {
  navigation: {} as StackScreenProps<any>['navigation'],
  route: {} as StackScreenProps<any>['route'],
  dimensions: {} as DimensionsType,
  appState: '',
  netInfo: {} as NetInfoType,

  screen: 0,
  actionButtonsDisabled: false,
  walletExists: false,
  wallet: {} as WalletType,
  totalBalance: new TotalBalanceClass(),
  info: {} as InfoType,

  server: {} as ServerType,
  currency: '',
  language: 'en',

  zecPrice: {
    zecPrice: 0,
    date: 0,
  } as zecPriceType,
  sendAll: false,
  background: {
    batches: 0,
    date: 0,
  } as BackgroundType,

  translate: () => '',
  backgroundError: {} as BackgroundErrorType,
  privacy: false,
  readOnly: false,
  customServerShow: false,
  customServerUri: '',
  customServerChainName: 'main',
  mode: 'basic',
};

export const ContextAppLoading = React.createContext(defaultAppStateLoading);

type ContextProviderProps = {
  children: ReactNode;
  value: AppStateLoading;
};

export const ContextAppLoadingProvider = ({ children, value }: ContextProviderProps) => {
  return <ContextAppLoading.Provider value={value}>{children}</ContextAppLoading.Provider>;
};
