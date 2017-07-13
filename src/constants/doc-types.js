import { DocTypes } from 'playing-content-services/lib/constants';

export default Object.assign({
  collection: {
    "packages": "playing-interaction-elements",
    "type":"Collection",
    "facets":[
      "Folderish",
      "Versionable",
      "Publishable",
      "Commentable",
      "HasRelatedText",
      "Downloadable"
    ]
  }
}, DocTypes);