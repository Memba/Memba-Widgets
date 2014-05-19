/**
 * Created by jlchereau on 10/03/14.
 */

$(document).ready(function() {

    var pageItemCollectionData = [
        { id: 'be1935d0-ff0e-4818-a5a8-762127f3b506', tool : 'image', top: 50, left: 100, height: 250, width: 250, rotate: 45, properties: '{ "src": "http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png" }' },
        { id: '75cecd51-dff0-4633-a421-dcdb5220fed5', tool : 'image', top: 300, left: 300, height: 250, width: 250, rotate: 315, properties: '{ "src": "http://4.bp.blogspot.com/_cPxcXn8pqkM/TCoCrLc7mVI/AAAAAAAABF0/8d6paccQU8A/s320/228_facebook.jpg" }' },
        { id: 'f2b4179e-3189-401b-bb17-65ceaf62b1eb', tool : 'label', top: 250, left: 500, height: 100, width: 300, rotate: 90, properties: '{ "font": "Georgia, serif", "color": "#FF0000", "text": "World" }' },
        { id: 'c3d46312-07c3-44dc-a1c9-987654949927', tool : 'textbox', top: 20, left: 20, height: 100, width: 300, rotate: 0, properties: '{}' }
    ];

    var pageCollectionData = [
        {
            id: '29c14ae2-496b-49f5-9551-e0d7e4aa6032',
            items: [
                { id: 'be1935d0-ff0e-4818-a5a8-762127f3b506', tool : 'image', top: 50, left: 100, height: 250, width: 250, rotate: 45, properties: '{ "src": "http://marketingland.com/wp-content/ml-loads/2013/04/google-g-logo-2012.png" }' },
                { id: '75cecd51-dff0-4633-a421-dcdb5220fed5', tool : 'image', top: 300, left: 300, height: 250, width: 250, rotate: 315, properties: '{ "src": "http://4.bp.blogspot.com/_cPxcXn8pqkM/TCoCrLc7mVI/AAAAAAAABF0/8d6paccQU8A/s320/228_facebook.jpg" }' },
                { id: 'f2b4179e-3189-401b-bb17-65ceaf62b1eb', tool : 'label', top: 250, left: 500, height: 100, width: 300, rotate: 90, properties: '{ "font": "Georgia, serif", "color": "#FF0000", "text": "World" }' },
                { id: 'c3d46312-07c3-44dc-a1c9-987654949927', tool : 'textbox', top: 20, left: 20, height: 100, width: 300, rotate: 0, properties: '{}' }
            ]
        },
        {
            id: 'c0878ced-8e3f-4161-a83a-049caed02d53',
            items: [
                { id: 'c745e385-d409-40d0-a4d7-1b7c14abc2f6', tool : 'label', top: 250, left: 500, height: 100, width: 300, rotate: 90, properties: '{ "font": "Georgia, serif", "color": "#FF0000", "text": "World" }' },
                { id: '25bd6088-dc9f-4c9c-a697-be32b8673ba9', tool : 'textbox', top: 20, left: 20, height: 100, width: 300, rotate: 0, properties: '{}' }
            ]
        }
    ];


    module('Test PageItemCollectionDataSource');
    test('Initialize from proper array', function() {
        var pageItemCollectionDataSource = new kidoju.PageItemCollectionDataSource({ data: pageItemCollectionData });
        pageItemCollectionDataSource.read();
        expect(1);
        equal(pageItemCollectionData.length, pageItemCollectionDataSource.total());
    });
    test('Remove page items', function() {
        var pageItemCollectionDataSource = new kidoju.PageItemCollectionDataSource({ data: pageItemCollectionData });
        pageItemCollectionDataSource.read();
        expect(2);
        equal(pageItemCollectionData.length, pageItemCollectionDataSource.total());
        pageItemCollectionDataSource.remove(pageItemCollectionDataSource.at(0));
        equal(pageItemCollectionData.length-1, pageItemCollectionDataSource.total());
    });

    test('Use of create method', function() {
        var pageItemCollectionDataSource1 = kidoju.PageItemCollectionDataSource.create(pageItemCollectionData);
        var pageItemCollectionDataSource2 = kidoju.PageItemCollectionDataSource.create(pageItemCollectionDataSource1);
        pageItemCollectionDataSource1.read();
        pageItemCollectionDataSource2.read();
        expect(3);
        equal(pageItemCollectionData.length, pageItemCollectionDataSource1.total());
        equal(pageItemCollectionData.length, pageItemCollectionDataSource2.total());
        throws(
            function() {
                kidoju.PageItemCollectionDataSource.create(new kendo.data.DataSource({ data: [] }));
            },
            new Error("Incorrect DataSource type. Only PageItemCollectionDataSource instances are supported")
        );
    });

    test('Initialize from stupid array', function() {
        var pageItemCollectionData = [
            { title: 'Gone with the wind' },
            { title: 'OK Coral' },
            { title: 'The third man' },
            { title: 'The guns of Navarone' }
        ];
        var pageItemCollectionDataSource = new kidoju.PageItemCollectionDataSource({
            data: pageItemCollectionData
        });
        pageItemCollectionDataSource.read();
        expect(1);
        equal(pageItemCollectionData.length, pageItemCollectionDataSource.total());
        //TODO: Do we really want this?
    });
    //TODO Group/Aggregate/Serialize

    module('Test PageCollectionDataSource');
    test('Initialize from proper array', function() {
        var pageCollectionDataSource = new kidoju.PageCollectionDataSource({ data: pageCollectionData });
        pageCollectionDataSource.read();
        expect(8);
        ok(pageCollectionDataSource instanceof kidoju.PageCollectionDataSource);
        equal(pageCollectionData.length, pageCollectionDataSource.total());
        for (var i=0; i<pageCollectionData.length; i++) {
            var page = pageCollectionDataSource.at(i);
            page.load();
            ok(page instanceof kidoju.Page);
            ok(page.items instanceof  kidoju.PageItemCollectionDataSource);
            equal(pageCollectionData[i].items.length, page.items.total());
        }
    });
    test('Use of create method', function() {
        var pageCollectionDataSource1 = kidoju.PageCollectionDataSource.create(pageCollectionData);
        var pageCollectionDataSource2 = kidoju.PageCollectionDataSource.create(pageCollectionDataSource1);
        pageCollectionDataSource1.read();
        pageCollectionDataSource2.read();
        expect(3);
        equal(pageCollectionData.length, pageCollectionDataSource1.total());
        equal(pageCollectionData.length, pageCollectionDataSource2.total());
        throws(
            function() {
                kidoju.PageCollectionDataSource.create(new kendo.data.DataSource({ data: [] }));
            },
            new Error("Incorrect DataSource type. Only PageCollectionDataSource instances are supported")
        );
    });
    asyncTest('Initialize from json stream', function() {
        var pageCollectionDataSource = new kidoju.PageCollectionDataSource({
            transport: {
                read:  {
                    url: "test/data/pageCollection.json",
                    dataType: "json"
                }
            }
        });
        pageCollectionDataSource.read();

        expect(8);
        ok(pageCollectionDataSource instanceof kidoju.PageCollectionDataSource);
        $.getJSON(pageCollectionDataSource.options.transport.read.url).done(function(pageCollectionData) {
            equal(pageCollectionData.length, pageCollectionDataSource.total());
            for (var i=0; i<pageCollectionData.length; i++) {
                var page = pageCollectionDataSource.at(i);
                page.load();
                ok(page instanceof kidoju.Page);
                ok(page.items instanceof  kidoju.PageItemCollectionDataSource);
                equal(pageCollectionData[i].items.length, page.items.total());
            }
            start();
        });
    });
    test('Remove pages', function() {
        var pageCollectionDataSource = new kidoju.PageCollectionDataSource({ data: pageCollectionData });
        pageCollectionDataSource.read();
        expect(2);
        equal(pageCollectionData.length, pageCollectionDataSource.total());
        pageCollectionDataSource.remove(pageCollectionDataSource.at(0));
        equal(pageCollectionData.length-1, pageCollectionDataSource.total());
    });
    test('Add pages and page items to an empty datasource', function() {
        var pageCollectionDataSource = new kidoju.PageCollectionDataSource({}),
            pageGuid = kendo.guid(),
            itemGuid = kendo.guid();
        expect(10);
        equal(0, pageCollectionDataSource.total());
        pageCollectionDataSource.add(null);
        equal(0, pageCollectionDataSource.total());
        pageCollectionDataSource.add({ id: pageGuid });
        //pageCollectionDataSource.add({ id: pageGuid, items: [] }); TODO: this replaces items datasource by empty array --> check
        equal(1, pageCollectionDataSource.total());
        var page = pageCollectionDataSource.at(0);
        ok(page instanceof kidoju.Page);
        equal(pageGuid, page.id);
        ok(page.items instanceof kidoju.PageItemCollectionDataSource);
        equal(0, page.items.total());
        page.items.add(null);
        equal(0, page.items.total());
        page.items.add({ id: itemGuid });
        var pageItem = page.items.at(0);
        ok(pageItem instanceof kidoju.PageItem);
        equal(itemGuid, pageItem.id);
    });
    test('Parent', function() {
        var pageCollectionDataSource = new kidoju.PageCollectionDataSource({ data: pageCollectionData });
        pageCollectionDataSource.read();
        expect(3*pageCollectionDataSource.total());
        for(var i=0; i<pageCollectionDataSource.total(); i++) {
            var page = pageCollectionDataSource.at(0);
            ok(page instanceof kidoju.Page);
            ok(page.items instanceof kidoju.PageItemCollectionDataSource);
            equal(page, page.items.parent());
            page.items.read(); //load()
            for(var j=0; j<page.items.total(); j++) {
                var pageItem = page.items.at(j);
                //TODO
            }
        }
    });
    //TODO Group/Aggregate/Serialize
});

