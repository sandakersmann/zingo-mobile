/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, SafeAreaView, ScrollView, TouchableOpacity, Text, TextInput, Keyboard } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Toast from 'react-native-simple-toast';
import Clipboard from '@react-native-community/clipboard';
import Animated, { EasingNode } from 'react-native-reanimated';

import RegText from '../Components/RegText';
import FadeText from '../Components/FadeText';
import Button from '../Components/Button';
import { ThemeType } from '../../app/types';
import { ContextAppLoaded, ContextAppLoading } from '../../app/context';
import { DimensionsType, InfoType, NetInfoType, ServerType, TranslateType, WalletType } from '../../app/AppState';
import RPCModule from '../../app/RPCModule';
import RPC from '../../app/rpc';
import Header from '../Header';
import Utils from '../../app/utils';
import { createAlert } from '../../app/createAlert';

type TextsType = {
  new: string[];
  change: string[];
  server: string[];
  view: string[];
  restore: string[];
  backup: string[];
};

type SeedProps = {
  onClickOK: (seedPhrase: string, birthdayNumber: number) => void;
  onClickCancel: () => void;
  action: 'new' | 'change' | 'view' | 'restore' | 'backup' | 'server';
  setBackgroundError?: (title: string, error: string) => void;
};
const Seed: React.FunctionComponent<SeedProps> = ({ onClickOK, onClickCancel, action, setBackgroundError }) => {
  const contextLoaded = useContext(ContextAppLoaded);
  const contextLoading = useContext(ContextAppLoading);
  let wallet: WalletType,
    translate: (key: string) => TranslateType,
    info: InfoType,
    server: ServerType,
    dimensions: DimensionsType,
    netInfo: NetInfoType,
    privacy: boolean,
    mode: 'basic' | 'expert';
  if (action === 'new' || action === 'restore') {
    wallet = contextLoading.wallet;
    translate = contextLoading.translate;
    info = contextLoading.info;
    server = contextLoading.server;
    dimensions = contextLoading.dimensions;
    netInfo = contextLoading.netInfo;
    privacy = contextLoading.privacy;
    mode = contextLoading.mode;
  } else {
    wallet = contextLoaded.wallet;
    translate = contextLoaded.translate;
    info = contextLoaded.info;
    server = contextLoaded.server;
    dimensions = contextLoaded.dimensions;
    netInfo = contextLoaded.netInfo;
    privacy = contextLoaded.privacy;
    mode = contextLoaded.mode;
  }

  const { colors } = useTheme() as unknown as ThemeType;
  const [seedPhrase, setSeedPhrase] = useState('');
  const [birthdayNumber, setBirthdayNumber] = useState('');
  const [times, setTimes] = useState(0);
  const [texts, setTexts] = useState({} as TextsType);
  const [readOnly, setReadOnly] = useState(true);
  const [titleViewHeight, setTitleViewHeight] = useState(0);
  const [latestBlock, setLatestBlock] = useState(0);
  const [expandSeed, setExpandSeed] = useState(false);
  const [expandBirthday, setExpandBithday] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (privacy) {
      setExpandSeed(false);
      setExpandBithday(false);
    } else {
      setExpandSeed(true);
      setExpandBithday(true);
    }
  }, [privacy]);

  useEffect(() => {
    if (!expandSeed && !privacy) {
      setExpandSeed(true);
    }
  }, [expandSeed, privacy]);

  useEffect(() => {
    if (!expandBirthday && !privacy) {
      setExpandBithday(true);
    }
  }, [expandBirthday, privacy]);

  useEffect(() => {
    const buttonTextsArray = translate('seed.buttontexts');
    let buttonTexts = {} as TextsType;
    if (typeof buttonTextsArray === 'object') {
      buttonTexts = buttonTextsArray as TextsType;
      setTexts(buttonTexts);
    }
    setReadOnly(
      action === 'new' || action === 'view' || action === 'change' || action === 'backup' || action === 'server',
    );
    setTimes(action === 'change' || action === 'backup' || action === 'server' ? 1 : 0);
    setSeedPhrase(wallet.seed || '');
    setBirthdayNumber((wallet.birthday && wallet.birthday.toString()) || '');
  }, [action, wallet.seed, wallet.birthday, wallet, translate]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      Animated.timing(slideAnim, {
        toValue: 0 - titleViewHeight + 25,
        duration: 100,
        easing: EasingNode.linear,
        //useNativeDriver: true,
      }).start();
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 100,
        easing: EasingNode.linear,
        //useNativeDriver: true,
      }).start();
    });

    return () => {
      !!keyboardDidShowListener && keyboardDidShowListener.remove();
      !!keyboardDidHideListener && keyboardDidHideListener.remove();
    };
  }, [slideAnim, titleViewHeight]);

  useEffect(() => {
    if (action === 'restore') {
      if (info.latestBlock) {
        setLatestBlock(info.latestBlock);
      } else {
        (async () => {
          const resp: string = await RPCModule.getLatestBlock(server.uri);
          //console.log(resp);
          if (resp && !resp.toLowerCase().startsWith('error')) {
            setLatestBlock(Number(resp));
          } else {
            //console.log('error latest block', resp);
            if (setBackgroundError) {
              createAlert(setBackgroundError, translate('loadingapp.creatingwallet-label') as string, resp);
            }
            onClickCancel();
          }
        })();
      }
    }
  }, [action, info.latestBlock, latestBlock, onClickCancel, server.uri, setBackgroundError, translate]);

  useEffect(() => {
    if (action !== 'new' && action !== 'restore') {
      (async () => await RPC.rpc_setInterruptSyncAfterBatch('false'))();
    }
  }, [action]);

  //console.log('=================================');
  //console.log(wallet.seed, wallet.birthday);
  //console.log(seedPhrase, birthdayNumber);
  //console.log(latestBlock);

  return (
    <SafeAreaView
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        height: '100%',
        backgroundColor: colors.background,
      }}>
      <Animated.View style={{ marginTop: slideAnim }}>
        <View
          onLayout={e => {
            const { height } = e.nativeEvent.layout;
            setTitleViewHeight(height);
          }}>
          <Header
            title={translate('seed.title') + ' (' + translate(`seed.${action}`) + ')'}
            noBalance={true}
            noSyncingStatus={true}
            noDrawMenu={true}
            noPrivacy={true}
            translate={translate}
            dimensions={dimensions}
            netInfo={netInfo}
            mode={mode}
          />
        </View>
      </Animated.View>

      <View style={{ width: '100%', height: 1, backgroundColor: colors.primary }} />

      <ScrollView
        style={{ maxHeight: '85%' }}
        contentContainerStyle={{
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
        }}>
        <FadeText style={{ marginTop: 0, padding: 20, textAlign: 'center' }}>
          {readOnly ? (translate('seed.text-readonly') as string) : (translate('seed.text-no-readonly') as string)}
        </FadeText>
        <View
          style={{
            margin: 10,
            padding: 10,
            borderWidth: 1,
            borderRadius: 10,
            borderColor: colors.text,
            maxHeight: '40%',
          }}>
          {readOnly ? (
            <TouchableOpacity
              onPress={() => {
                if (seedPhrase) {
                  Clipboard.setString(seedPhrase);
                  Toast.show(translate('seed.tapcopy-seed-message') as string, Toast.LONG);
                  setExpandSeed(true);
                  if (privacy) {
                    setTimeout(() => {
                      setExpandSeed(false);
                    }, 5000);
                  }
                }
              }}>
              <RegText
                color={colors.text}
                style={{
                  textAlign: 'center',
                }}>
                {!expandSeed ? Utils.trimToSmall(seedPhrase, 5) : seedPhrase}
              </RegText>
            </TouchableOpacity>
          ) : (
            <View
              accessible={true}
              accessibilityLabel={translate('seed.seed-acc') as string}
              style={{
                margin: 0,
                borderWidth: 1,
                borderRadius: 10,
                borderColor: colors.text,
                maxWidth: '100%',
                maxHeight: '70%',
                minWidth: '95%',
                minHeight: 100,
              }}>
              <TextInput
                testID="seed.seedinput"
                placeholder={translate('seed.seedplaceholder') as string}
                placeholderTextColor={colors.placeholder}
                multiline
                style={{
                  color: colors.text,
                  fontWeight: '600',
                  fontSize: 16,
                  minWidth: '95%',
                  minHeight: 100,
                  marginLeft: 5,
                  backgroundColor: 'transparent',
                }}
                value={seedPhrase}
                onChangeText={(text: string) => setSeedPhrase(text)}
                editable={true}
              />
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View />
            <TouchableOpacity
              onPress={() => {
                if (seedPhrase) {
                  Clipboard.setString(seedPhrase);
                  Toast.show(translate('seed.tapcopy-seed-message') as string, Toast.LONG);
                }
              }}>
              <Text
                style={{
                  color: colors.text,
                  textDecorationLine: 'underline',
                  padding: 10,
                  marginTop: 0,
                  textAlign: 'center',
                  minHeight: 48,
                }}>
                {translate('seed.tapcopy') as string}
              </Text>
            </TouchableOpacity>
            <View />
          </View>
        </View>

        <View style={{ marginTop: 10, alignItems: 'center' }}>
          <FadeText style={{ textAlign: 'center' }}>{translate('seed.birthday-readonly') as string}</FadeText>
          {readOnly ? (
            <TouchableOpacity
              onPress={() => {
                if (birthdayNumber) {
                  Clipboard.setString(birthdayNumber);
                  Toast.show(translate('seed.tapcopy-birthday-message') as string, Toast.LONG);
                  setExpandBithday(true);
                  if (privacy) {
                    setTimeout(() => {
                      setExpandBithday(false);
                    }, 5000);
                  }
                }
              }}>
              <RegText color={colors.text} style={{ textAlign: 'center' }}>
                {!expandBirthday ? Utils.trimToSmall(birthdayNumber, 1) : birthdayNumber}
              </RegText>
            </TouchableOpacity>
          ) : (
            <>
              <FadeText style={{ textAlign: 'center' }}>
                {translate('seed.birthday-no-readonly') + ' (1, ' + (latestBlock ? latestBlock.toString() : '--') + ')'}
              </FadeText>
              <View
                accessible={true}
                accessibilityLabel={translate('seed.birthday-acc') as string}
                style={{
                  margin: 10,
                  borderWidth: 1,
                  borderRadius: 10,
                  borderColor: colors.text,
                  width: '30%',
                  maxWidth: '40%',
                  maxHeight: 48,
                  minWidth: '20%',
                  minHeight: 48,
                }}>
                <TextInput
                  testID="seed.birthdayinput"
                  placeholder={'#'}
                  placeholderTextColor={colors.placeholder}
                  style={{
                    color: colors.text,
                    fontWeight: '600',
                    fontSize: 18,
                    minWidth: '20%',
                    minHeight: 48,
                    marginLeft: 5,
                    backgroundColor: 'transparent',
                  }}
                  value={birthdayNumber}
                  onChangeText={(text: string) => {
                    if (isNaN(Number(text))) {
                      setBirthdayNumber('');
                    } else if (Number(text) <= 0 || Number(text) > latestBlock) {
                      setBirthdayNumber('');
                    } else {
                      setBirthdayNumber(Number(text.replace('.', '').replace(',', '')).toFixed(0));
                    }
                  }}
                  editable={latestBlock ? true : false}
                  keyboardType="numeric"
                />
              </View>
            </>
          )}
        </View>

        {times === 3 && action === 'change' && (
          <FadeText style={{ marginTop: 20, padding: 20, textAlign: 'center', color: 'white' }}>
            {translate('seed.change-warning') as string}
          </FadeText>
        )}
        {times === 3 && action === 'backup' && (
          <FadeText style={{ marginTop: 20, padding: 20, textAlign: 'center', color: 'white' }}>
            {translate('seed.backup-warning') as string}
          </FadeText>
        )}
        {times === 3 && action === 'server' && (
          <FadeText style={{ marginTop: 20, padding: 20, textAlign: 'center', color: 'white' }}>
            {translate('seed.server-warning') as string}
          </FadeText>
        )}

        {server.chain_name !== 'main' && times === 3 && (action === 'change' || action === 'server') && (
          <FadeText style={{ color: colors.primary, textAlign: 'center', width: '100%' }}>
            {translate('seed.mainnet-warning') as string}
          </FadeText>
        )}
        <View style={{ marginBottom: 30 }} />
      </ScrollView>
      <View
        style={{
          flexGrow: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginVertical: 5,
        }}>
        <Button
          testID="seed.button.OK"
          type={mode === 'basic' ? 'Secondary' : 'Primary'}
          style={{
            backgroundColor: times === 3 ? 'red' : mode === 'basic' ? colors.background : colors.primary,
          }}
          title={
            mode === 'basic' ? (translate('cancel') as string) : !!texts && !!texts[action] ? texts[action][times] : ''
          }
          onPress={() => {
            if (!seedPhrase) {
              return;
            }
            if (!netInfo.isConnected && (times > 0 || action === 'restore')) {
              Toast.show(translate('loadedapp.connection-error') as string, Toast.LONG);
              return;
            }
            if (times === 0 || times === 3) {
              if (action === 'restore') {
                // waiting while closing the keyboard, just in case.
                setTimeout(async () => {
                  onClickOK(seedPhrase, Number(birthdayNumber));
                }, 100);
              } else {
                onClickOK(seedPhrase, Number(birthdayNumber));
              }
            } else if (times === 1 || times === 2) {
              setTimes(times + 1);
            }
          }}
        />
        {(times > 0 || action === 'restore') && (
          <Button
            type="Secondary"
            title={translate('cancel') as string}
            style={{ marginLeft: 10 }}
            onPress={onClickCancel}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Seed;
