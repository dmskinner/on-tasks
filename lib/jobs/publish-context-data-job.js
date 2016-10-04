'use strict';

var di = require('di');

module.exports = publishContextDataJobFactory;
di.annotate(publishContextDataJobFactory, new di.Provide('Job.Publish.Context.Data'));
di.annotate(publishContextDataJobFactory, new di.Inject(
    'Job.Base',
    'Logger',
    'Util',
    '_',
    'Services.Messenger',
    'Constants',
    'Promise'
));

function publishContextDataJobFactory(
    BaseJob,
    Logger,
    util,
    _,
    messenger,
    Constants,
    Promise
){
    var logger = Logger.initialize(publishContextDataJobFactory);

    function PublishContextDataJob(options, context, taskId){
        PublishContextDataJob.super_.call(this, logger, options, context, taskId);
    }

    util.inherits(PublishContextDataJob, BaseJob);

    PublishContextDataJob.prototype._run = function _run(){
        var self = this;
        if(this.context.data)
        {
            if(_.isArray(this.context.data)) {
                Promise.each(this.context.data, function (val) {
                    messenger.publish(
                        Constants.Protocol.Exchanges.Events.Name,
                        'temp.exchange',
                        val
                    );
                })
                .then(function () {
                    self._done();
                })
                .catch(function (err) {
                    self._done(err);
                });
            }
            else {
                self._done("Data property must be an array");
            }
        }
        else {
            self._done("Data property must exist");
        }

    };

    return PublishContextDataJob;
}
