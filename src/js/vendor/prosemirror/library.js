import * as exampleSetup from 'prosemirror-example-setup';
import * as markdown from 'prosemirror-markdown';
import * as model from 'prosemirror-model';
import * as schemaBasic from 'prosemirror-schema-basic';
import * as state from 'prosemirror-state';
import * as transform from 'prosemirror-transform';
import * as view from 'prosemirror-view';
// import * as keymap from 'prosemirror-keymap';
// import * as inputrules from 'prosemirror-inputrules';
import * as history from 'prosemirror-history';
import * as commands from 'prosemirror-commands';
import * as schemaList from 'prosemirror-schema-list';
// import * as dropcursor from 'prosemirror-dropcursor';
// import * as gapcursor from 'prosemirror-gapcursor';
// import * as menu from 'prosemirror-menu';
// import * as tables from 'prosemirror-tables';
// import * as OrderedMap from 'orderedmap';

const pm = {
    commands,
    exampleSetup,
    history,
    markdown,
    model,
    schemaBasic,
    schemaList,
    state,
    transform,
    view,
};

const mySchema = new Schema({
    nodes: addListNodes(baseSchema.spec.nodes, "paragraph block*", "block"),
    marks: baseSchema.spec.marks
})

export default pm;
