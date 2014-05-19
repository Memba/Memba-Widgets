describe('kidoju.tools', function() {

    describe('Loading', function() {
        it('should find kidoju.tools', function() {
            expect(kidoju.tools).to.be.an.instanceof(kendo.data.ObservableObject);
            expect(kidoju.tools).to.have.property('active');
            expect(kidoju.tools).to.respondTo('register');
        });
    });

});