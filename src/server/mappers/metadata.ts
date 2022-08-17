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

export default {
  mapMetadataProperties,
};
