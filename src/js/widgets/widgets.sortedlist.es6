// https://github.com/benmosher/eslint-plugin-import/issues/1097
// eslint-disable-next-line import/extensions, import/no-unresolved
// import $ from 'jquery';
import 'kendo.listview';
import 'kendo.sortable';

const {
    attr,
    support: { touch },
    ui: { ListView, plugin }
} = window.kendo;

const SortedList = ListView.extend({
    /**
     * COnstructor
     * @constructot
     * @param element
     * @param options
     */
    init(element, options) {
        ListView.fn.init.call(this, element, options);
        this._initSortable();
    },

    /**
     * Widget options
     */
    options: {
        name: 'SortedList'
    },

    /**
     * Initialize sortable
     * @private
     */
    _initSortable() {
        const { dataSource } = this;
        // Make the list sortable
        this.sortable = this.element
            .kendoSortable({
                cursor: 'move',
                filter: '>.k-listview-item',
                // handler: '.kj-handle, .kj-handle *',
                holdToDrag: touch,
                ignore: 'input', // otherwise focus and selections won't work properly in inputs
                placeholder(element) {
                    return element.clone().css('opacity', 0.4);
                },
                hint(element) {
                    return element.clone(); // .removeClass('k-state-selected');
                },
                change(e) {
                    const skip = dataSource.skip() || 0;
                    const newIndex = e.newIndex + skip;
                    const dataItem = dataSource.getByUid(
                        e.item.attr(attr('uid'))
                    );
                    dataSource.remove(dataItem);
                    dataSource.insert(newIndex, dataItem);
                }
            })
            .data('kendoSortable');
    },

    /**
     * Destroy
     */
    destroy() {
        ListView.fn.destroy.call(this);
    }
});

// Register widget
plugin(SortedList);
