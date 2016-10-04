'use strict';

describe('Job.Publish.Context.Data', function() {
    var PublishContextDataJob,
        uuid,
        fakeNodeId,
        messenger,
        sandbox,
        Constants;

    before(function() {
        helper.setupInjector([
            helper.require('/lib/jobs/base-job.js'),
            helper.require('/lib/jobs/publish-context-data-job.js')
        ]);

        PublishContextDataJob = helper.injector.get('Job.Publish.Context.Data');
        messenger = helper.injector.get('Services.Messenger');
        Constants = helper.injector.get('Constants');

        sandbox = sinon.sandbox.create();

        uuid = helper.injector.get('uuid');
        fakeNodeId = uuid.v4();
    });

    afterEach(function() {
       sandbox.restore;
    });

    it('should publish data in the context to the message queue', function() {
        var context = {
                "data": [{'test': 1}]
        };
        var jobObject = new PublishContextDataJob({}, context, uuid.v4());
        sandbox.stub(jobObject, '_subscribeActiveTaskExists').resolves();
        sandbox.stub(messenger, 'publish').resolves();

        return jobObject.run()
            .then(function(){
                expect(messenger.publish).to.have.been.calledWith( 
                    Constants.Protocol.Exchanges.Events.Name,
                    'temp.exchange',
                    context.data[0]
                );
            });
    });

    it('should not publish empty context data property to the message queue', function(){
        var context = {};
        var jobObject = new PublishContextDataJob({}, context, uuid.v4());
        sandbox.stub(jobObject, '_subscribeActiveTaskExists').resolves();

        return expect(jobObject.run()).to.be.rejectedWith("Data property must exist");
    });

    it('should not publish context data property that is not an array', function(){
        var context = {
            "data": {"test": "object"}
        };
        var jobObject = new PublishContextDataJob({}, context, uuid.v4());
        sandbox.stub(jobObject, '_subscribeActiveTaskExists').resolves();

        return expect(jobObject.run()).to.be.rejectedWith("Data property must be an array");
    });
});
