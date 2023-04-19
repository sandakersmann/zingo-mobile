/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useEffect, useState } from 'react';
import { View, ScrollView, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faDotCircle } from '@fortawesome/free-solid-svg-icons';
import { faCircle as farCircle } from '@fortawesome/free-regular-svg-icons';
import Toast from 'react-native-simple-toast';

import RegText from '../Components/RegText';
import FadeText from '../Components/FadeText';
import BoldText from '../Components/BoldText';
import { checkServerURI, parseServerURI, serverUris } from '../../app/uris';
import Button from '../Components/Button';
import { ThemeType } from '../../app/types';
import { ContextAppLoaded } from '../../app/context';
import moment from 'moment';
import 'moment/locale/es';
import Header from '../Header';

type SettingsProps = {
  closeModal: () => void;
  set_wallet_option: (name: string, value: string) => Promise<void>;
  set_server_option: (name: 'server' | 'currency' | 'language' | 'sendAll', value: string) => Promise<void>;
  set_currency_option: (name: 'server' | 'currency' | 'language' | 'sendAll', value: string) => Promise<void>;
  set_language_option: (
    name: 'server' | 'currency' | 'language' | 'sendAll',
    value: string,
    reset: boolean,
  ) => Promise<void>;
  set_sendAll_option: (name: 'server' | 'currency' | 'language' | 'sendAll', value: boolean) => Promise<void>;
};

type Options = {
  value: string;
  text: string;
};

const Settings: React.FunctionComponent<SettingsProps> = ({
  set_wallet_option,
  set_server_option,
  set_currency_option,
  set_language_option,
  set_sendAll_option,
  closeModal,
}) => {
  const context = useContext(ContextAppLoaded);
  const {
    walletSettings,
    translate,
    server: serverContext,
    currency: currencyContext,
    language: languageContext,
    sendAll: sendAllContext,
    netInfo,
  } = context;

  const memosArray = translate('settings.memos');
  //console.log(memosArray, typeof memosArray);
  let MEMOS: Options[] = [];
  if (typeof memosArray === 'object') {
    MEMOS = memosArray as Options[];
  }

  const currenciesArray = translate('settings.currencies');
  let CURRENCIES: Options[] = [];
  if (typeof currenciesArray === 'object') {
    CURRENCIES = currenciesArray as Options[];
  }

  const languagesArray = translate('settings.languages');
  let LANGUAGES: Options[] = [];
  if (typeof languagesArray === 'object') {
    LANGUAGES = languagesArray as Options[];
  }

  const sendAllsArray = translate('settings.sendalls');
  let SENDALLS: Options[] = [];
  if (typeof sendAllsArray === 'object') {
    SENDALLS = sendAllsArray as Options[];
  }

  const { colors } = useTheme() as unknown as ThemeType;

  const [memos, setMemos] = useState(walletSettings.download_memos);
  const [filter, setFilter] = useState(walletSettings.transaction_filter_threshold);
  const [server, setServer] = useState(serverContext);
  const [currency, setCurrency] = useState(currencyContext);
  const [language, setLanguage] = useState(languageContext);
  const [sendAll, setSendAll] = useState(sendAllContext);
  const [customIcon, setCustomIcon] = useState(farCircle);
  const [disabled, setDisabled] = useState<boolean | undefined>();

  moment.locale(language);

  useEffect(() => {
    setCustomIcon(serverUris().find((s: string) => s === server) ? farCircle : faDotCircle);
  }, [server]);

  useEffect(() => {
    // start checking the new server
    if (disabled) {
      Toast.show(translate('loadedapp.tryingnewserver') as string, Toast.SHORT);
    }
    // if the server cheking takes more then 30 seconds.
    if (!disabled && disabled !== undefined) {
      Toast.show(translate('loadedapp.tryingnewserver-error') as string, Toast.LONG);
      // in this point the sync process is blocked, who knows why.
      // if I save the actual server before the customization... is going to work.
      set_server_option('server', serverContext);
    }
  }, [disabled, serverContext, set_server_option, translate]);

  const saveSettings = async () => {
    let serverParsed = server;
    if (
      walletSettings.download_memos === memos &&
      walletSettings.transaction_filter_threshold === filter &&
      serverContext === serverParsed &&
      currencyContext === currency &&
      languageContext === language &&
      sendAllContext === sendAll
    ) {
      Toast.show(translate('settings.nochanges') as string, Toast.LONG);
      return;
    }
    if (!memos) {
      Toast.show(translate('settings.ismemo') as string, Toast.LONG);
      return;
    }
    if (!filter) {
      Toast.show(translate('settings.isthreshold') as string, Toast.LONG);
      return;
    }
    if (!serverParsed) {
      Toast.show(translate('settings.isserver') as string, Toast.LONG);
      return;
    }
    if (!language) {
      Toast.show(translate('settings.islanguage') as string, Toast.LONG);
      return;
    }

    if (serverContext !== serverParsed) {
      const resultUri = parseServerURI(serverParsed);
      if (resultUri.toLowerCase().startsWith('error')) {
        Toast.show(translate('settings.isuri') as string, Toast.LONG);
        return;
      } else {
        // url-parse sometimes is too wise, and if you put:
        // server: `http:/zec-server.com:9067` the parser understand this. Good.
        // but this value will be store in the settings and the value is wrong.
        // so, this function if everything is OK return the URI well formmatted.
        // and I save it in the state ASAP.
        if (serverParsed !== resultUri) {
          serverParsed = resultUri;
          setServer(resultUri);
        }
      }
    }

    if (!netInfo.isConnected) {
      Toast.show(translate('loadedapp.connection-error') as string, Toast.LONG);
      return;
    }

    if (serverContext !== serverParsed) {
      setDisabled(true);
      const resultServer = await checkServerURI(serverParsed, serverContext, setDisabled);
      // if disabled is true  -> fast response -> show the toast with the error
      // if disabled is false -> 30 seconds error before this task end -> don't show the error,
      //                         it was showed before.
      if (!resultServer) {
        if (disabled) {
          Toast.show(translate('loadedapp.changeservernew-error') as string, Toast.LONG);
        }
        // in this point the sync process is blocked, who knows why.
        // if I save the actual server before the customization... is going to work.
        set_server_option('server', serverContext);
        setDisabled(undefined);
        return;
      }
    }

    if (walletSettings.download_memos !== memos) {
      await set_wallet_option('download_memos', memos);
    }
    if (walletSettings.transaction_filter_threshold !== filter) {
      await set_wallet_option('transaction_filter_threshold', filter);
    }
    if (currencyContext !== currency) {
      await set_currency_option('currency', currency);
    }
    if (sendAllContext !== sendAll) {
      await set_sendAll_option('sendAll', sendAll);
    }

    // I need a little time in this modal because maybe the wallet cannot be open with the new server
    let ms = 100;
    if (serverContext !== serverParsed) {
      if (languageContext !== language) {
        await set_language_option('language', language, false);
      }
      set_server_option('server', serverParsed);
      ms = 1500;
    } else {
      if (languageContext !== language) {
        await set_language_option('language', language, true);
      }
    }

    setTimeout(() => {
      closeModal();
    }, ms);
  };

  const optionsRadio = (
    DATA: Options[],
    setOption: React.Dispatch<React.SetStateAction<string | boolean>>,
    typeOption: StringConstructor | BooleanConstructor,
    valueOption: string | boolean,
  ) => {
    return DATA.map(item => (
      <View key={'view-' + item.value}>
        <TouchableOpacity
          disabled={disabled}
          style={{ marginRight: 10, marginBottom: 5, maxHeight: 50, minHeight: 48 }}
          onPress={() => setOption(typeOption(item.value))}>
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <FontAwesomeIcon
              icon={typeOption(item.value) === valueOption ? faDotCircle : farCircle}
              size={20}
              color={colors.border}
            />
            <RegText key={'text-' + item.value} style={{ marginLeft: 10 }}>
              {translate(`settings.value-${item.value}`) as string}
            </RegText>
          </View>
        </TouchableOpacity>
        <FadeText key={'fade-' + item.value}>{item.text}</FadeText>
      </View>
    ));
  };

  //console.log(walletSettings);

  return (
    <SafeAreaView
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        height: '100%',
        backgroundColor: colors.background,
      }}>
      <Header title={translate('settings.title') as string} noBalance={true} noSyncingStatus={true} noDrawMenu={true} />

      <ScrollView
        testID="settings.scrollView"
        style={{ maxHeight: '85%' }}
        contentContainerStyle={{
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
        }}>
        <View style={{ display: 'flex', margin: 10 }}>
          <BoldText>{translate('settings.sendall-title') as string}</BoldText>
        </View>

        <View style={{ display: 'flex', marginLeft: 25 }}>
          {optionsRadio(
            SENDALLS,
            setSendAll as React.Dispatch<React.SetStateAction<string | boolean>>,
            Boolean,
            sendAll,
          )}
        </View>

        <View style={{ display: 'flex', margin: 10 }}>
          <BoldText>{translate('settings.currency-title') as string}</BoldText>
        </View>

        <View style={{ display: 'flex', marginLeft: 25 }}>
          {optionsRadio(
            CURRENCIES,
            setCurrency as React.Dispatch<React.SetStateAction<string | boolean>>,
            String,
            currency,
          )}
        </View>

        <View style={{ display: 'flex', margin: 10 }}>
          <BoldText>{translate('settings.language-title') as string}</BoldText>
        </View>

        <View style={{ display: 'flex', marginLeft: 25 }}>
          {optionsRadio(
            LANGUAGES,
            setLanguage as React.Dispatch<React.SetStateAction<string | boolean>>,
            String,
            language,
          )}
        </View>

        <View style={{ display: 'flex', margin: 10 }}>
          <BoldText>{translate('settings.server-title') as string}</BoldText>
        </View>

        <View style={{ display: 'flex', marginLeft: 25 }}>
          {serverUris().map((uri: string, i: number) =>
            uri ? (
              <TouchableOpacity
                testID={
                  i === 0
                    ? 'settings.firstServer'
                    : i === 1
                    ? 'settings.secondServer'
                    : 'settings.' + i.toString + '-Server'
                }
                disabled={disabled}
                key={'touch-' + uri}
                style={{ marginRight: 10, marginBottom: 5, maxHeight: 50, minHeight: 48 }}
                onPress={() => setServer(uri)}>
                <View style={{ display: 'flex', flexDirection: 'row', marginTop: 10 }}>
                  <FontAwesomeIcon icon={uri === server ? faDotCircle : farCircle} size={20} color={colors.border} />
                  <RegText key={'tex-' + uri} style={{ marginLeft: 10 }}>
                    {uri}
                  </RegText>
                </View>
              </TouchableOpacity>
            ) : null,
          )}

          <View style={{ display: 'flex', flexDirection: 'row' }}>
            <TouchableOpacity
              testID="settings.customServer"
              disabled={disabled}
              style={{ marginRight: 10, marginBottom: 5, maxHeight: 50, minHeight: 48 }}
              onPress={() => setServer('')}>
              <View style={{ display: 'flex', flexDirection: 'row', marginTop: 10 }}>
                {customIcon && <FontAwesomeIcon icon={customIcon} size={20} color={colors.border} />}
                <RegText style={{ marginLeft: 10 }}>{translate('settings.custom') as string}</RegText>
              </View>
            </TouchableOpacity>

            {customIcon === faDotCircle && (
              <View
                accessible={true}
                accessibilityLabel={translate('settings.server-acc') as string}
                style={{
                  borderColor: colors.border,
                  borderWidth: 1,
                  marginLeft: 5,
                  width: 'auto',
                  maxWidth: '80%',
                  maxHeight: 48,
                  minWidth: '50%',
                  minHeight: 48,
                }}>
                <TextInput
                  testID="settings.customServerField"
                  placeholder={'https://------.---:---'}
                  placeholderTextColor={colors.placeholder}
                  style={{
                    color: colors.text,
                    fontWeight: '600',
                    fontSize: 18,
                    minWidth: '50%',
                    minHeight: 48,
                    marginLeft: 5,
                  }}
                  value={server}
                  onChangeText={(text: string) => setServer(text)}
                  editable={!disabled}
                  maxLength={100}
                />
              </View>
            )}
          </View>
        </View>

        <View style={{ display: 'flex', margin: 10 }}>
          <BoldText>{translate('settings.threshold-title') as string}</BoldText>
        </View>

        <View style={{ display: 'flex', marginLeft: 25 }}>
          <View
            accessible={true}
            accessibilityLabel={translate('settings.threshold-acc') as string}
            style={{
              borderColor: colors.border,
              borderWidth: 1,
              marginLeft: 5,
              width: 'auto',
              maxWidth: '60%',
              maxHeight: 48,
              minWidth: '30%',
              minHeight: 48,
            }}>
            <TextInput
              placeholder={translate('settings.number') as string}
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
              style={{
                color: colors.text,
                fontWeight: '600',
                fontSize: 18,
                minWidth: '30%',
                minHeight: 48,
                marginLeft: 5,
              }}
              value={filter}
              onChangeText={(text: string) => setFilter(text)}
              editable={!disabled}
              maxLength={6}
            />
          </View>
        </View>

        <View style={{ display: 'flex', margin: 10 }}>
          <BoldText>{translate('settings.memo-title') as string}</BoldText>
        </View>

        <View style={{ display: 'flex', marginLeft: 25, marginBottom: 30 }}>
          {optionsRadio(MEMOS, setMemos as React.Dispatch<React.SetStateAction<string | boolean>>, String, memos)}
        </View>
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
          testID="settings.button.save"
          disabled={disabled}
          type="Primary"
          title={translate('settings.save') as string}
          onPress={saveSettings}
        />
        <Button
          disabled={disabled}
          type="Secondary"
          title={translate('cancel') as string}
          style={{ marginLeft: 10 }}
          onPress={closeModal}
        />
      </View>
    </SafeAreaView>
  );
};

export default Settings;
