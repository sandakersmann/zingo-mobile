/**
 * @format
 */

import 'react-native';
import React from 'react';

import { create } from 'react-test-renderer';
import Pools from '../components/Pools';
import { ContextLoadedProvider } from '../app/context';

import {
  ErrorModalData,
  ReceivePageState,
  SendPageState,
  SendProgress,
  SyncStatusReport,
  ToAddr,
  TotalBalance,
  WalletSettings,
} from '../app/AppState';

jest.mock('@fortawesome/react-native-fontawesome', () => ({
  FontAwesomeIcon: '',
}));
jest.mock('react-native-localize', () => ({
  getNumberFormatSettings: () => {
    return {
      decimalSeparator: '.', // us
      groupingSeparator: ',', // us
    };
  },
}));
jest.useFakeTimers();

// test suite
describe('Component Info - test', () => {
  //snapshot test
  const state = {
    navigation: null,
    route: null,
    dimensions: {} as {
      width: number;
      height: number;
      orientation: 'portrait' | 'landscape';
      deviceType: 'tablet' | 'phone';
      scale: number;
    },

    syncStatusReport: new SyncStatusReport(),
    addressPrivateKeys: new Map(),
    addresses: [],
    addressBook: [],
    transactions: null,
    sendPageState: new SendPageState(new ToAddr(0)),
    receivePageState: new ReceivePageState(),
    rescanning: false,
    wallet_settings: new WalletSettings(),
    syncingStatus: null,
    errorModalData: new ErrorModalData(),
    txBuildProgress: new SendProgress(),
    walletSeed: null,
    isMenuDrawerOpen: false,
    selectedMenuDrawerItem: '',
    aboutModalVisible: false,
    computingModalVisible: false,
    settingsModalVisible: false,
    infoModalVisible: false,
    rescanModalVisible: false,
    seedViewModalVisible: false,
    seedChangeModalVisible: false,
    seedBackupModalVisible: false,
    seedServerModalVisible: false,
    syncReportModalVisible: false,
    poolsModalVisible: false,
    newServer: null,
    uaAddress: null,
    info: {
      testnet: false,
      serverUri: 'serverUri',
      latestBlock: 0,
      connections: 0,
      version: '0',
      verificationProgress: 0,
      currencyName: 'ZEC',
      solps: 0,
      zecPrice: 33.33,
      defaultFee: 0,
      encrypted: false,
      locked: false,
      chain_name: '',
    },
    translate: () => 'translated text',
    totalBalance: new TotalBalance(),
  };
  test('Matches the snapshot Info', () => {
    const info: any = create(
      <ContextLoadedProvider value={state}>
        <Pools closeModal={() => {}} />
      </ContextLoadedProvider>,
    );
    expect(info.toJSON()).toMatchSnapshot();
  });
});
