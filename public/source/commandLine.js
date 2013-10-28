
var ko = require('../vendor/js/knockout-2.2.1');
var $ = require('../vendor/js/jquery-2.0.0.min');


// Will be loaded from config
var aliases = {
    'c': 'commit'
}


var CommandLineViewModel = function(path) {
    var self = this;
    this.path = path;
    this.hasFocus = ko.observable(true);
    this.command = ko.observable();
    $(document).keypress(function() { self.hasFocus(true); });
}
exports.CommandLineViewModel = CommandLineViewModel;
CommandLineViewModel.prototype.template = 'commandLine';
CommandLineViewModel.prototype.call = function() {
    var command = this.command();
    this.command('');
    while (aliases[command]) {
        command = aliases[command];
    }
    if (this[command]) return this[command]();
}
CommandLineViewModel.prototype.commit = function() {
    this.path.repository().staging.commitMessageTitleFocused(true);
}