# Important note

Running zombie has some overhead and requires that the default mocha timeout of 2s be increased to 10s.

It seems Webstorm mocha implementation does not use mocha.opts.
You need to edit your Mocha configuration and add ```--timeout 10000``` to mocha extra options.

In Gruntfile.js grunt-mocha-test can be configured with the same timeout.
