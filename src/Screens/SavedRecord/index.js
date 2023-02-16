import * as React from 'react';
import {SafeAreaView, ScrollView, Alert} from 'react-native';
import {List, Button} from 'react-native-paper';
import {NfcTech} from 'react-native-nfc-manager';
import * as AppContext from '../../AppContext';
import RecordItem from './RecordItem';
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

  //Initialize every app with the presaved record
  nfcARecords.push(
    { record: 
       { name: 'presaved record',
         payload: 
          { tech: 'NfcA',
            value: 
            [ { type: 'command', payload: [ 48, 4 ] },
            { type: 'command', payload: [ 48, 8 ] },
            { type: 'command', payload: [ 48, 12 ] },
            { type: 'command', payload: [ 162, 4, 3, 39, 216, 15 ] },
            { type: 'command', payload: [ 162, 5, 21, 97, 110, 100 ] },
            { type: 'command', payload: [ 162, 6, 114, 111, 105, 100 ] },
            { type: 'command', payload: [ 162, 7, 46, 99, 111, 109 ] },
            { type: 'command', payload: [ 162, 8, 58, 112, 107, 103 ] },
            { type: 'command', payload: [ 162, 9, 119, 97, 118, 101 ] },
            { type: 'command', payload: [ 162, 10, 115, 104, 97, 114 ] },
            { type: 'command', payload: [ 162, 11, 101, 46, 102, 101 ] },
            { type: 'command', payload: [ 162, 12, 110, 103, 46, 110 ] },
            { type: 'command', payload: [ 162, 13, 102, 99, 116, 97 ] },
            { type: 'command', payload: [ 162, 14, 103, 254, 0, 0 ] } ] 
          } 
        },
      idx: records.length })
  
  return {
    ndefRecords,
    nfcARecords,
    nfcVRecords,
    isoDepRecords,
  };
}

function SavedRecordScreen(props) {
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

export default SavedRecordScreen;
