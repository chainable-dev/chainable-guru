import { createFunctionCall } from '../types/function-calls';

export const createDocumentFunctionCall = createFunctionCall(
  'createDocument',
  'Create a new document with the given title',
  {
    title: {
      type: 'string',
      description: 'The title of the document to create',
      required: true
    }
  }
);

export const updateDocumentFunctionCall = createFunctionCall(
  'updateDocument',
  'Update an existing document with new content',
  {
    id: {
      type: 'string',
      description: 'The ID of the document to update',
      required: true
    },
    description: {
      type: 'string',
      description: 'The description of changes to make',
      required: true
    }
  }
);

export const requestSuggestionsFunctionCall = createFunctionCall(
  'requestSuggestions',
  'Get improvement suggestions for a document',
  {
    documentId: {
      type: 'string',
      description: 'The ID of the document to get suggestions for',
      required: true
    }
  }
); 