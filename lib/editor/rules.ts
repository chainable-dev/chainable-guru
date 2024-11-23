import { keymap } from 'prosemirror-keymap'
import { history } from 'prosemirror-history'
import { baseKeymap } from 'prosemirror-commands'
import { Schema } from 'prosemirror-model'
import { dropCursor } from 'prosemirror-dropcursor'
import { gapCursor } from 'prosemirror-gapcursor'
import { inputRules, smartQuotes, emDash, ellipsis } from 'prosemirror-inputrules'

// Basic editor setup without example dependencies
export function basicSetup(schema: Schema) {
  return [
    history(),
    dropCursor(),
    gapCursor(),
    keymap(baseKeymap),
    inputRules({ rules: [
      ...smartQuotes,
      emDash,
      ellipsis
    ]}),
  ]
}

// Custom key bindings
export const customKeymap = {
  'Mod-b': toggleMark(schema.marks.strong),
  'Mod-i': toggleMark(schema.marks.em),
  'Mod-`': toggleMark(schema.marks.code),
  'Shift-Ctrl-8': wrapInList(schema.nodes.bulletList),
  'Shift-Ctrl-9': wrapInList(schema.nodes.orderedList),
  'Shift-Ctrl-0': lift,
  'Mod-z': undo,
  'Shift-Mod-z': redo
}

// Basic schema
export const basicSchema = new Schema({
  nodes: {
    doc: {
      content: 'block+'
    },
    paragraph: {
      group: 'block',
      content: 'inline*',
      parseDOM: [{tag: 'p'}],
      toDOM() { return ['p', 0] }
    },
    text: {
      group: 'inline'
    }
  },
  marks: {
    strong: {
      parseDOM: [{tag: 'strong'}, {tag: 'b'}],
      toDOM() { return ['strong'] }
    },
    em: {
      parseDOM: [{tag: 'em'}, {tag: 'i'}],
      toDOM() { return ['em'] }
    },
    code: {
      parseDOM: [{tag: 'code'}],
      toDOM() { return ['code'] }
    }
  }
}) 