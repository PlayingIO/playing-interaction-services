import { DocTypes } from 'playing-content-services/lib/constants';

export default Object.assign({
  collection: {
    "packages": "playing-interaction-elements",
    "type":"Collection",
    "facets":[
      "Versionable",
      "Collection",
      "NotCollectionMember"
    ]
  },
  favorite: {
    "packages": "playing-interaction-elements",
    "type":"Favorite",
    "facets":[
      "Versionable",
      "Collection",
      "NotCollectionMember"
    ]
  }
}, DocTypes);