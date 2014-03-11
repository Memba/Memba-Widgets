/**
 * Created by jlchereau on 10/03/14.
 */

$(document).ready(function() {

    module('kidoju.tools');
    test('Loading', function() {
        expect(3);
        ok(kidoju.tools instanceof kendo.data.ObservableObject);
        ok(kidoju.tools.hasOwnProperty('active'));
        ok($.isFunction(kidoju.tools.register));
    });

});

