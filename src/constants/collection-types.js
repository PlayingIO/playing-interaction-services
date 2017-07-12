import { DocTypes } from 'playing-content-services/lib/constants';

export default Object.assign({
  Collection: {
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