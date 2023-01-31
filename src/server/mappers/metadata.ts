// import { Entry, Metadata } from '../../types/metadata';
import { Metadata } from '../../types/metadata';
import { WELL_KNOWN_PROPERTIES } from '../utils/constants';

const mapMetadataProperties = (metadata: Metadata) => {
  const mappedMetadata = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (WELL_KNOWN_PROPERTIES.includes(key)) {
      mappedMetadata[key] = value;
    } else {
      mappedMetadata[key] = [value];
    }
  }
  return mappedMetadata;
};

const mapGetObjectBySubjectResponse = (metadataObject: Record<string, unknown>) => {
  const mappedResponse = {};
  for (const [key, value] of Object.entries(metadataObject)) {
    if (WELL_KNOWN_PROPERTIES.includes(key)) {
      mappedResponse[key] = value;
    } else {
      // eslint-disable-next-line unicorn/no-array-reduce
      mappedResponse[key] = value
      // if (key === 'DAppName') {
      //   console.log("####", key, value)
      //   mappedResponse[key] = value
      // } else {
      //   mappedResponse[key] = (value as Array<Entry>).reduce((higher, current) =>
      //     higher?.sequenceNumber && higher.sequenceNumber > current.sequenceNumber ? higher : current
      //   );
      // }
    }
  }
  return mappedResponse;
};

export default {
  mapMetadataProperties,
  mapGetObjectBySubjectResponse,
};
