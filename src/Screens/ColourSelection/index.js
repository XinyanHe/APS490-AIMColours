import * as React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  View,
  FlatList,
  Dimensions,
} from 'react-native';
import {List, Button} from 'react-native-paper';
import {NfcTech} from 'react-native-nfc-manager';
import * as AppContext from '../../AppContext';
import RecordItem from '../SavedRecord/RecordItem';
import SaveRecordModal from '../../Components/SaveRecordModal';

function groupRecordByTech(records) {
  // console.log(records)
  const ndefRecords = [];
  const nfcARecords = [];
  const nfcVRecords = [];
  const isoDepRecords = [];
  for (let idx = 0; idx < records.length; idx++) {
    const record = records[idx];
    if (record.payload.tech === NfcTech.Ndef) {
      ndefRecords.push({record, idx});
    } else if (record.payload.tech === NfcTech.NfcA) {
      nfcARecords.push({record, idx});
    } else if (record.payload.tech === NfcTech.NfcV) {
      nfcVRecords.push({record, idx});
    } else if (record.payload.tech === NfcTech.IsoDep) {
      isoDepRecords.push({record, idx});
    }
  }

/* ============================================================ */
/* ===============THIS IS FOR DEBUGGING PURPOSES=============== */
/* ============================================================ */

  /* ============================================================ */
  /* ===================THIS IS FOR FUNCTION A=================== */
  /* ============================================================ */
  // Initial Sequence of Commands for the Bitmap Function
  const intialize_bitmap_function_a = [
    {type: 'command', payload: [0xcd, 0xd]},
    {type: 'command', payload: [0xcd, 0x0, 0x7f]},
    {type: 'delay', payload: 50},
    {type: 'command', payload: [0xcd, 0x1]},
    {type: 'delay', payload: 20},
    {type: 'command', payload: [0xcd, 0x2]},
    {type: 'delay', payload: 20},
    {type: 'command', payload: [0xcd, 0x3]},
    {type: 'delay', payload: 20},
    {type: 'command', payload: [0xcd, 0x5]},
    {type: 'delay', payload: 20},
    {type: 'command', payload: [0xcd, 0x6]},
    {type: 'delay', payload: 10},
    {type: 'command', payload: [0xcd, 0x7, 0x0]},
  ];

  // Write Bitmap for the Bitmap Function
  const bitmap_element_a = new Array(103);
  bitmap_element_a[0] = 0xcd;
  bitmap_element_a[1] = 0x8;
  bitmap_element_a[2] = 0x64;
  for (let i = 3; i < bitmap_element_a.length; i++) {
    bitmap_element_a[i] = 0x0;
  }
  const bitmap_a = new Array(100);
  for (let i = 0; i < 100; i += 2) {
    bitmap_a[i] = {type: 'command', payload: bitmap_element_a};
  }
  for (let i = 1; i < 100; i += 2) {
    bitmap_a[i] = {type: 'delay', payload: 2};
  }

  // After Writing Bitmap
  const end_bitmap_a = [
    {type: 'command', payload: [0xcd, 0x18]},
    {type: 'delay', payload: 200},
    {type: 'command', payload: [0xcd, 0x9]},
    {type: 'delay', payload: 300},
  ];

  // Need Ack from [0xcd, 0xa] which does not seem to work at the moment
  const bitmap_closure_a = [
    {type: 'command', payload: [0xcd, 0xa]},
    // {type: 'delay', payload: 25},
    // {type: 'command', payload: [0xcd, 0x4]}
  ];

  // Generate Bitmap Function
  const bitmap_function_a = intialize_bitmap_function_a.concat(bitmap_a, end_bitmap_a, bitmap_closure_a)

  // nfcARecords.push({
  //   record: {
  //     name: 'Write Bitmap a',
  //     payload: {
  //       tech: 'NfcA',
  //       value: bitmap_function_a,
  //     },
  //   },
  //   idx: records.length,
  // });

  /* ============================================================ */
  /* ===================THIS IS FOR FUNCTION B=================== */
  /* ============================================================ */
  const intialize_bitmap_function_b = [
            {type: 'delay', payload: 10},
            {type: 'command', payload: [0xcd, 0xd]},
            {type: 'delay', payload: 10},
            {type: 'command', payload: [0xcd, 0x0]},
            {type: 'delay', payload: 10},
            {type: 'command', payload: [0xcd, 0x1]},
            {type: 'delay', payload: 10},
            {type: 'command', payload: [0xcd, 0x2]},
            {type: 'delay', payload: 100},
            {type: 'command', payload: [0xcd, 0x3]},
            {type: 'delay', payload: 100},
  ];

  /* ===================RED=================== */
  const bitmap_element_red = new Array(103);
  bitmap_element_red[0] = 0xcd;
  bitmap_element_red[1] = 0x5;
  bitmap_element_red[2] = 0x64;
  for (let i = 3; i < bitmap_element_red.length; i++) {
    bitmap_element_red[i] = 0xFF;
  }
  const bitmap_red = new Array(100);
  for (let i = 0; i < 100; i += 2) {
    bitmap_red[i] = {type: 'command', payload: bitmap_element_red};
  }
  for (let i = 1; i < 100; i += 2) {
    bitmap_red[i] = {type: 'delay', payload: 5};
  }

  const middle_bitmap_b = [
    {type: 'command', payload: [0xcd, 0x4]},
    {type: 'delay', payload: 30},
  ];

  const end_bitmap_b = [
    {type: 'delay', payload: 100},
    {type: 'command', payload: [0xcd, 0x6]},
    {type: 'delay', payload: 1000},
  ];

  const wait_bitmap_ack = new Array(100);
  for (let i = 0; i < 100; i += 2) {
    wait_bitmap_ack[i] = {type: 'command', payload: [0xcd, 0x8]};
  }
  for (let i = 1; i < 100; i += 2) {
    wait_bitmap_ack[i] = {type: 'delay', payload: 500};
  }

  const bitmap_function_red = intialize_bitmap_function_b.concat(bitmap_red, middle_bitmap_b, bitmap_red, end_bitmap_b, wait_bitmap_ack)

  nfcARecords.push({
    record: {
      name: 'Red',
      payload: {
        tech: 'NfcA',
        value: bitmap_function_red,
      },
    },
    idx: records.length,
  });

  /* ===================BLACK=================== */
  const bitmap_element_black = new Array(103);
  bitmap_element_black[0] = 0xcd;
  bitmap_element_black[1] = 0x5;
  bitmap_element_black[2] = 0x64;
  for (let i = 3; i < bitmap_element_black.length; i++) {
    bitmap_element_black[i] = 0x00;
  }
  const bitmap_black = new Array(100);
  for (let i = 0; i < 100; i += 2) {
    bitmap_black[i] = {type: 'command', payload: bitmap_element_black};
  }
  for (let i = 1; i < 100; i += 2) {
    bitmap_black[i] = {type: 'delay', payload: 5};
  }

  const bitmap_function_black = intialize_bitmap_function_b.concat(bitmap_black, middle_bitmap_b, bitmap_black, end_bitmap_b, wait_bitmap_ack)

  nfcARecords.push({
    record: {
      name: 'Black',
      payload: {
        tech: 'NfcA',
        value: bitmap_function_black,
      },
    },
    idx: records.length,
  });

  /* =================== RED AND BLACK=================== */
  const bitmap_red_and_black = new Array(100);
  for (let i = 0; i < 50; i += 2) {
    bitmap_red_and_black[i] = {type: 'command', payload: bitmap_element_black};
  }
  for (let i = 50; i < 100; i += 2) {
    bitmap_red_and_black[i] = {type: 'command', payload: bitmap_element_red};
  }
  for (let i = 1; i < 100; i += 2) {
    bitmap_red_and_black[i] = {type: 'delay', payload: 5};
  }

  const bitmap_function_red_and_black = intialize_bitmap_function_b.concat(bitmap_red_and_black, middle_bitmap_b, bitmap_red_and_black, end_bitmap_b, wait_bitmap_ack)

  nfcARecords.push({
    record: {
      name: 'Red & Black',
      payload: {
        tech: 'NfcA',
        value: bitmap_function_red_and_black,
      },
    },
    idx: records.length,
  });

  return {
    ndefRecords,
    nfcARecords,
    nfcVRecords,
    isoDepRecords,
  };
}

function ColourSelectionScreen(props) {
  const {navigation} = props;
  const app = React.useContext(AppContext.Context);
  const recordList = app.state.storageCache;
  const [recordToCopy, setRecordToCopy] = React.useState(null);

  async function clearAll() {
    Alert.alert('CONFIRM', 'Are you sure?', [
      {
        text: 'DO IT',
        onPress: async () => {
          await app.actions.setStorage([]);
        },
      },
      {
        text: 'CANCEL',
        onPress: () => 0,
      },
    ]);
  }

  async function removeIdx(idx) {
    Alert.alert('CONFIRM', 'Are you sure?', [
      {
        text: 'DO IT',
        onPress: async () => {
          const nextRecordList = [...recordList];
          nextRecordList.splice(idx, 1);
          await app.actions.setStorage(nextRecordList);
        },
      },
      {
        text: 'CANCEL',
        onPress: () => 0,
      },
    ]);
  }

  function goToHandler(savedRecordIdx, savedRecord) {
    if (savedRecord.payload?.tech === NfcTech.Ndef) {
      navigation.navigate('NdefWrite', {
        savedRecord,
        savedRecordIdx,
      });
    } else if (savedRecord.payload?.tech === NfcTech.NfcA) {
      navigation.navigate('CustomTransceive', {
        savedRecord,
        savedRecordIdx,
      });
    } else if (savedRecord.payload?.tech === NfcTech.NfcV) {
      navigation.navigate('CustomTransceive', {
        savedRecord,
        savedRecordIdx,
      });
    } else if (savedRecord.payload?.tech === NfcTech.IsoDep) {
      navigation.navigate('CustomTransceive', {
        savedRecord,
        savedRecordIdx,
      });
    }
  }

  const {ndefRecords, nfcARecords, nfcVRecords, isoDepRecords} =
    groupRecordByTech(recordList);

  return (
    <>
      <ScrollView style={{flex: 1, backgroundColor: 'white'}}>
        <List.Section>
          <List.Subheader>NDEF ({ndefRecords.length})</List.Subheader>
          {ndefRecords.map(({record, idx}) => (
            <RecordItem
              key={idx}
              record={record}
              idx={idx}
              removeIdx={removeIdx}
              goToHandler={goToHandler.bind(null, idx)}
              onCopy={() => {
                console.warn(record);
                setRecordToCopy(record);
              }}
            />
          ))}
        </List.Section>

        <List.Section>
          <List.Subheader>NfcA ({nfcARecords.length})</List.Subheader>
          {nfcARecords.map(({record, idx}) => (
            <RecordItem
              key={idx}
              record={record}
              idx={idx}
              removeIdx={removeIdx}
              goToHandler={goToHandler.bind(null, idx)}
              onCopy={() => setRecordToCopy(record)}
            />
          ))}
        </List.Section>

        <List.Section>
          <List.Subheader>NfcV ({nfcVRecords.length})</List.Subheader>
          {nfcVRecords.map(({record, idx}) => (
            <RecordItem
              key={idx}
              record={record}
              idx={idx}
              removeIdx={removeIdx}
              goToHandler={goToHandler.bind(null, idx)}
              onCopy={() => setRecordToCopy(record)}
            />
          ))}
        </List.Section>

        <List.Section>
          <List.Subheader>IsoDep ({isoDepRecords.length})</List.Subheader>
          {isoDepRecords.map(({record, idx}) => (
            <RecordItem
              key={idx}
              record={record}
              idx={idx}
              removeIdx={removeIdx}
              goToHandler={goToHandler.bind(null, idx)}
              onCopy={() => setRecordToCopy(record)}
            />
          ))}
        </List.Section>
      </ScrollView>
      <Button onPress={clearAll}>CLEAR ALL</Button>
      <SafeAreaView />

      <SaveRecordModal
        title={'COPY THIS RECORD AS'}
        visible={!!recordToCopy}
        onClose={() => setRecordToCopy(null)}
        onPersistRecord={async (name) => {
          if (!recordToCopy) {
            return false;
          }

          const nextList = AppContext.Actions.getStorage();
          nextList.push({
            name,
            payload: recordToCopy.payload,
          });

          await AppContext.Actions.setStorage(nextList);
          setRecordToCopy(null);
        }}
      />
    </>
  );
}

export default ColourSelectionScreen;