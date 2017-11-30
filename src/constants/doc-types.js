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
  },
  workspace: {
    "type": "Workspace",
    "packages": "playing-interaction-elements",
    "facets": [
      "Folderish"
    ],
    "subtypes": ['collection', 'file', 'folder', 'note']
  },
}, DocTypes);